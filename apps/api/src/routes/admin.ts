import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { adminOnly, authRequired } from "../middleware/auth.js";
import { connect as waConnect, disconnect as waDisconnect, getStatus as waStatus, sendMessage as waSend } from "../lib/whatsapp.js";
import { HttpError } from "../middleware/error.js";
import { slugify, isReservedSlug } from "../lib/slug.js";
import {
  cloudflareConfigured,
  createCustomHostname,
  getCustomHostname,
  deleteCustomHostname,
  mapCfStatus,
  CF_FALLBACK_ORIGIN,
} from "../lib/cloudflare.js";

const router = Router();

router.use(authRequired, adminOnly);

router.get("/stats", async (_req, res, next) => {
  try {
    const [users, weddings, published, rsvps, wishes, templates] = await Promise.all([
      prisma.user.count(),
      prisma.wedding.count(),
      prisma.wedding.count({ where: { status: "PUBLISHED" } }),
      prisma.rsvp.count(),
      prisma.wish.count(),
      prisma.template.count(),
    ]);
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    const recentWeddings = await prisma.wedding.findMany({
      include: { couple: true, owner: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    res.json({
      totals: { users, weddings, published, rsvps, wishes, templates },
      recentUsers,
      recentWeddings,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/users", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: { select: { weddings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get("/weddings", async (_req, res, next) => {
  try {
    const list = await prisma.wedding.findMany({
      include: {
        couple: true,
        owner: { select: { email: true, name: true } },
        template: { select: { name: true, slug: true } },
        _count: { select: { guests: true, rsvps: true, wishes: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

/* ---------- WhatsApp bot ---------- */

router.get("/whatsapp/status", (_req, res) => {
  res.json(waStatus());
});

router.post("/whatsapp/connect", async (_req, res, next) => {
  try {
    const s = await waConnect();
    res.json(s);
  } catch (e) {
    next(e);
  }
});

router.post("/whatsapp/disconnect", async (_req, res, next) => {
  try {
    await waDisconnect();
    res.json(waStatus());
  } catch (e) {
    next(e);
  }
});

router.get("/logs", async (_req, res, next) => {
  try {
    const logs = await prisma.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    res.json(logs);
  } catch (e) {
    next(e);
  }
});

/* ---------- Buat undangan untuk klien (admin) ----------
   Admin membuatkan akun klien (email + password) sekaligus undangannya.
   Klien lalu login & mengisi sendiri isi undangannya. */

const createClientSchema = z.object({
  name: z.string().min(1, "Nama klien wajib diisi").max(120),
  email: z.string().email("Email tidak valid").toLowerCase(),
  password: z.string().min(6, "Password minimal 6 karakter").max(120),
  phone: z.string().max(40).optional().nullable(),
  package: z.enum(["PRO", "EKSKLUSIF"]).default("PRO"),
  brideShort: z.string().min(1).max(60),
  brideName: z.string().min(1).max(120),
  groomShort: z.string().min(1).max(60),
  groomName: z.string().min(1).max(120),
  templateId: z.string().optional().nullable(),
});

router.post("/clients", async (req, res, next) => {
  try {
    const body = createClientSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) throw new HttpError(409, "Email sudah terdaftar");

    const baseSlug = slugify(`${body.brideShort}-${body.groomShort}`) || "undangan";
    let slug = baseSlug;
    let counter = 1;
    while (isReservedSlug(slug) || (await prisma.wedding.findUnique({ where: { slug } }))) {
      slug = `${baseSlug}-${counter++}`;
    }

    const hash = await bcrypt.hash(body.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: body.email, name: body.name, phone: body.phone ?? null, password: hash, role: "USER" },
        select: { id: true, name: true, email: true },
      });
      const wedding = await tx.wedding.create({
        data: {
          slug,
          ownerId: user.id,
          templateId: body.templateId ?? null,
          package: body.package,
          couple: {
            create: {
              brideName: body.brideName,
              brideShort: body.brideShort,
              groomName: body.groomName,
              groomShort: body.groomShort,
            },
          },
        },
        select: { id: true, slug: true },
      });
      return { user, wedding };
    });

    await prisma.adminLog.create({
      data: { actorEmail: req.user!.email, action: "CLIENT_CREATE", target: body.email, meta: { weddingSlug: slug } },
    });

    // Kirim kredensial + info setup ke nomor WhatsApp yang didaftarkan di akun
    let waSent = false;
    let waError: string | null = null;
    if (body.phone) {
      const origin = process.env.PUBLIC_ORIGIN ?? "https://weddq.id";
      const text =
        `Halo ${body.name}, selamat! 🎉 Undangan pernikahan digital Anda di *weddQ* telah dibuat.\n\n` +
        `Detail akun untuk masuk ke dasbor:\n` +
        `• Email: ${body.email}\n` +
        `• Password: ${body.password}\n\n` +
        `Masuk untuk mengisi & mengatur undangan:\n${origin}/login\n\n` +
        `Pratinjau undangan Anda:\n${origin}/${slug}\n\n` +
        `Setelah masuk, lengkapi data mempelai, acara, galeri, lalu bagikan tautannya ke tamu. ` +
        `Bila ada kendala, silakan balas pesan ini.\n\n— Tim weddQ`;
      const r = await waSend(body.phone, text);
      waSent = r.ok;
      if (!r.ok) waError = r.error;
    } else {
      waError = "Nomor WhatsApp tidak diisi";
    }

    // Echo kredensial agar admin tetap bisa menyalinnya bila perlu
    res.status(201).json({
      user: result.user,
      wedding: result.wedding,
      credentials: { email: body.email, password: body.password },
      waSent,
      waError,
    });
  } catch (e) {
    next(e);
  }
});

// Assign undangan baru ke user yang sudah ada (tanpa membuat akun baru).
const assignSchema = z.object({
  userId: z.string().min(1, "User wajib dipilih"),
  package: z.enum(["PRO", "EKSKLUSIF"]).default("PRO"),
  brideShort: z.string().min(1).max(60),
  brideName: z.string().min(1).max(120),
  groomShort: z.string().min(1).max(60),
  groomName: z.string().min(1).max(120),
  templateId: z.string().optional().nullable(),
});

router.post("/weddings/assign", async (req, res, next) => {
  try {
    const body = assignSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user) throw new HttpError(404, "User tidak ditemukan");

    const baseSlug = slugify(`${body.brideShort}-${body.groomShort}`) || "undangan";
    let slug = baseSlug;
    let counter = 1;
    while (isReservedSlug(slug) || (await prisma.wedding.findUnique({ where: { slug } }))) {
      slug = `${baseSlug}-${counter++}`;
    }

    const wedding = await prisma.wedding.create({
      data: {
        slug,
        ownerId: user.id,
        templateId: body.templateId ?? null,
        package: body.package,
        couple: {
          create: {
            brideName: body.brideName,
            brideShort: body.brideShort,
            groomName: body.groomName,
            groomShort: body.groomShort,
          },
        },
      },
      select: { id: true, slug: true },
    });

    await prisma.adminLog.create({
      data: { actorEmail: req.user!.email, action: "WEDDING_ASSIGN", target: user.email, meta: { weddingSlug: slug } },
    });

    // Info ke WhatsApp user (tanpa kredensial — akun sudah ada)
    let waSent = false;
    let waError: string | null = null;
    if (user.phone) {
      const origin = process.env.PUBLIC_ORIGIN ?? "https://weddq.id";
      const text =
        `Halo ${user.name}, sebuah undangan pernikahan digital baru telah ditambahkan ke akun *weddQ* Anda. 🎉\n\n` +
        `Masuk dengan akun Anda untuk mengisi & mengaturnya:\n${origin}/login\n\n` +
        `Pratinjau undangan:\n${origin}/${slug}\n\n` +
        `Lengkapi data mempelai, acara, galeri, lalu bagikan tautannya ke tamu.\n\n— Tim weddQ`;
      const r = await waSend(user.phone, text);
      waSent = r.ok;
      if (!r.ok) waError = r.error;
    } else {
      waError = "User belum punya nomor WhatsApp";
    }

    res.status(201).json({
      wedding,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
      waSent,
      waError,
    });
  } catch (e) {
    next(e);
  }
});

/* ---------- Aksi admin atas undangan ---------- */

router.patch("/weddings/:id/status", async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["DRAFT", "PUBLISHED"]) }).parse(req.body);
    const w = await prisma.wedding.findUnique({ where: { id: req.params.id } });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
    const updated = await prisma.wedding.update({ where: { id: w.id }, data: { status } });
    await prisma.adminLog.create({
      data: { actorEmail: req.user!.email, action: "WEDDING_STATUS", target: w.slug, meta: { status } },
    });
    res.json({ id: updated.id, status: updated.status });
  } catch (e) {
    next(e);
  }
});

router.patch("/weddings/:id/package", async (req, res, next) => {
  try {
    const { package: pkg } = z.object({ package: z.enum(["PRO", "EKSKLUSIF"]) }).parse(req.body);
    const w = await prisma.wedding.findUnique({ where: { id: req.params.id } });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
    const updated = await prisma.wedding.update({ where: { id: w.id }, data: { package: pkg }, select: { id: true, package: true } });
    await prisma.adminLog.create({ data: { actorEmail: req.user!.email, action: "WEDDING_PACKAGE", target: w.slug, meta: { package: pkg } } });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Masa aktif edit (verifikasi bayar manual). Kosong = tanpa batas.
router.patch("/weddings/:id/active-window", async (req, res, next) => {
  try {
    const body = z
      .object({
        activeFrom: z.string().datetime().nullable().optional(),
        activeUntil: z.string().datetime().nullable().optional(),
      })
      .parse(req.body);
    const w = await prisma.wedding.findUnique({ where: { id: req.params.id } });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
    const updated = await prisma.wedding.update({
      where: { id: w.id },
      data: {
        ...(body.activeFrom !== undefined ? { activeFrom: body.activeFrom ? new Date(body.activeFrom) : null } : {}),
        ...(body.activeUntil !== undefined ? { activeUntil: body.activeUntil ? new Date(body.activeUntil) : null } : {}),
      },
      select: { id: true, activeFrom: true, activeUntil: true },
    });
    await prisma.adminLog.create({
      data: { actorEmail: req.user!.email, action: "WEDDING_ACTIVE_WINDOW", target: w.slug, meta: body },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/weddings/:id", async (req, res, next) => {
  try {
    const w = await prisma.wedding.findUnique({ where: { id: req.params.id } });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
    await prisma.wedding.delete({ where: { id: w.id } });
    await prisma.adminLog.create({
      data: { actorEmail: req.user!.email, action: "WEDDING_DELETE", target: w.slug },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/* ---------- Custom domains (paket Eksklusif) ---------- */

const domainSelect = {
  id: true,
  slug: true,
  status: true,
  customDomain: true,
  domainStatus: true,
  domainAddedAt: true,
  couple: { select: { brideShort: true, groomShort: true } },
  owner: { select: { email: true, name: true } },
  template: { select: { name: true, priceIdr: true } },
} as const;

router.get("/domains", async (_req, res, next) => {
  try {
    const weddings = await prisma.wedding.findMany({
      select: domainSelect,
      orderBy: [{ domainStatus: "desc" }, { createdAt: "desc" }],
    });
    res.json({
      cloudflareConfigured: cloudflareConfigured(),
      cnameTarget: CF_FALLBACK_ORIGIN,
      weddings,
    });
  } catch (e) {
    next(e);
  }
});

const domainSchema = z.object({
  customDomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/, "Format domain tidak valid (mis. nama.my.id)"),
});

router.put("/weddings/:id/domain", async (req, res, next) => {
  try {
    const { customDomain } = domainSchema.parse(req.body);
    const w = await prisma.wedding.findUnique({ where: { id: req.params.id } });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");

    const clash = await prisma.wedding.findUnique({ where: { customDomain } });
    if (clash && clash.id !== w.id) throw new HttpError(409, "Domain sudah dipakai undangan lain");

    let cfHostnameId = w.cfHostnameId;
    let domainStatus: string = "PENDING";

    if (cloudflareConfigured()) {
      // domain berubah → hapus custom hostname lama
      if (w.cfHostnameId && w.customDomain !== customDomain) {
        await deleteCustomHostname(w.cfHostnameId).catch(() => {});
        cfHostnameId = null;
      }
      const result = await createCustomHostname(customDomain);
      cfHostnameId = result.id;
      domainStatus = mapCfStatus(result);
    }

    const updated = await prisma.wedding.update({
      where: { id: w.id },
      data: { customDomain, cfHostnameId, domainStatus, domainAddedAt: new Date() },
      select: domainSelect,
    });
    await prisma.adminLog.create({
      data: { actorEmail: req.user!.email, action: "DOMAIN_SET", target: customDomain, meta: { weddingId: w.id } },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.post("/weddings/:id/domain/refresh", async (req, res, next) => {
  try {
    const w = await prisma.wedding.findUnique({ where: { id: req.params.id } });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
    if (!w.customDomain) throw new HttpError(400, "Undangan ini belum punya domain custom");
    if (!cloudflareConfigured() || !w.cfHostnameId) {
      return res.json({ domainStatus: w.domainStatus, cloudflareConfigured: cloudflareConfigured() });
    }
    const result = await getCustomHostname(w.cfHostnameId);
    const domainStatus = mapCfStatus(result);
    await prisma.wedding.update({ where: { id: w.id }, data: { domainStatus } });
    res.json({ domainStatus, ssl: result.ssl?.status, status: result.status, verificationErrors: result.verification_errors });
  } catch (e) {
    next(e);
  }
});

router.delete("/weddings/:id/domain", async (req, res, next) => {
  try {
    const w = await prisma.wedding.findUnique({ where: { id: req.params.id } });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
    if (cloudflareConfigured() && w.cfHostnameId) {
      await deleteCustomHostname(w.cfHostnameId).catch(() => {});
    }
    await prisma.wedding.update({
      where: { id: w.id },
      data: { customDomain: null, cfHostnameId: null, domainStatus: "NONE", domainAddedAt: null },
    });
    await prisma.adminLog.create({
      data: { actorEmail: req.user!.email, action: "DOMAIN_REMOVE", target: w.customDomain ?? "", meta: { weddingId: w.id } },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
