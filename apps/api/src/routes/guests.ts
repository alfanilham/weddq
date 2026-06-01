import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { slugify } from "../lib/slug.js";
import { sendMessage as waSend, renderTemplate, DEFAULT_WA_TEMPLATE } from "../lib/whatsapp.js";

const router = Router();

async function ensureOwner(userId: string, weddingId: string) {
  const w = await prisma.wedding.findFirst({ where: { id: weddingId, ownerId: userId } });
  if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
}

/** Generate a slug unique within a wedding, by appending -2, -3, ... on collision. */
async function uniqueGuestSlug(weddingId: string, name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "tamu";
  let candidate = base;
  let counter = 2;
  while (true) {
    const taken = await prisma.guest.findFirst({
      where: { weddingId, slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!taken) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

router.get("/:weddingId", authRequired, async (req, res, next) => {
  try {
    await ensureOwner(req.user!.sub, req.params.weddingId);
    const { q, group } = req.query as { q?: string; group?: string };
    const guests = await prisma.guest.findMany({
      where: {
        weddingId: req.params.weddingId,
        ...(group && group !== "all" ? { group } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { rsvps: { take: 1, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(guests);
  } catch (e) {
    next(e);
  }
});

const guestSchema = z.object({
  name: z.string().min(1),
  phone: z.string().nullish(),
  email: z.string().email().nullish(),
  group: z.string().nullish(),
  invitedTo: z.string().nullish(),
});

router.post("/:weddingId", authRequired, async (req, res, next) => {
  try {
    await ensureOwner(req.user!.sub, req.params.weddingId);
    const body = guestSchema.parse(req.body);
    const slug = await uniqueGuestSlug(req.params.weddingId, body.name);
    const guest = await prisma.guest.create({
      data: { ...body, slug, weddingId: req.params.weddingId },
    });
    res.status(201).json(guest);
  } catch (e) {
    next(e);
  }
});

router.put("/:weddingId/:guestId", authRequired, async (req, res, next) => {
  try {
    await ensureOwner(req.user!.sub, req.params.weddingId);
    const body = guestSchema.partial().parse(req.body);
    const existing = await prisma.guest.findUnique({ where: { id: req.params.guestId } });
    if (!existing) throw new HttpError(404, "Tamu tidak ditemukan");
    // Re-slugify when name changes
    const data: Record<string, unknown> = { ...body };
    if (body.name && body.name !== existing.name) {
      data.slug = await uniqueGuestSlug(req.params.weddingId, body.name, req.params.guestId);
    }
    const guest = await prisma.guest.update({ where: { id: req.params.guestId }, data });
    res.json(guest);
  } catch (e) {
    next(e);
  }
});

router.delete("/:weddingId/:guestId", authRequired, async (req, res, next) => {
  try {
    await ensureOwner(req.user!.sub, req.params.weddingId);
    await prisma.guest.delete({ where: { id: req.params.guestId } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/* ---------- WHATSAPP SEND ---------- */

const SITE_ORIGIN = process.env.PUBLIC_ORIGIN ?? "https://weddq.id";

function buildGuestVars(wedding: { slug: string; couple?: { brideShort: string; groomShort: string } | null }, guest: { name: string; slug: string | null }, primaryEvent: { date: Date; venueName: string } | null) {
  const link = `${SITE_ORIGIN}/${wedding.slug}${guest.slug ? `?to=${guest.slug}` : ""}`;
  const tanggal = primaryEvent
    ? new Date(primaryEvent.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
  return {
    nama: guest.name,
    link,
    tanggal,
    venue: primaryEvent?.venueName ?? "",
    brideShort: wedding.couple?.brideShort ?? "",
    groomShort: wedding.couple?.groomShort ?? "",
  };
}

router.post("/:weddingId/:guestId/send-wa", authRequired, async (req, res, next) => {
  try {
    await ensureOwner(req.user!.sub, req.params.weddingId);
    const guest = await prisma.guest.findUnique({ where: { id: req.params.guestId } });
    if (!guest || guest.weddingId !== req.params.weddingId) throw new HttpError(404, "Tamu tidak ditemukan");
    if (!guest.phone) throw new HttpError(400, "Tamu belum memiliki nomor WhatsApp");
    const wedding = await prisma.wedding.findUnique({
      where: { id: req.params.weddingId },
      include: { couple: true, events: { orderBy: { date: "asc" }, take: 1 } },
    });
    if (!wedding) throw new HttpError(404, "Undangan tidak ditemukan");
    const vars = buildGuestVars(wedding, guest, wedding.events[0] ?? null);
    const template = wedding.waMessageTemplate || DEFAULT_WA_TEMPLATE;
    const text = renderTemplate(template, vars);
    const result = await waSend(guest.phone, text);
    if (result.ok) {
      const updated = await prisma.guest.update({
        where: { id: guest.id },
        data: { waStatus: "SENT", waSentAt: new Date(), waError: null },
      });
      res.json({ ok: true, guest: updated });
    } else {
      const updated = await prisma.guest.update({
        where: { id: guest.id },
        data: { waStatus: "FAILED", waError: result.error },
      });
      res.status(502).json({ ok: false, error: result.error, guest: updated });
    }
  } catch (e) {
    next(e);
  }
});

router.post("/:weddingId/send-wa-all", authRequired, async (req, res, next) => {
  try {
    await ensureOwner(req.user!.sub, req.params.weddingId);
    const wedding = await prisma.wedding.findUnique({
      where: { id: req.params.weddingId },
      include: { couple: true, events: { orderBy: { date: "asc" }, take: 1 } },
    });
    if (!wedding) throw new HttpError(404, "Undangan tidak ditemukan");
    const guests = await prisma.guest.findMany({
      where: { weddingId: req.params.weddingId, phone: { not: null }, waStatus: { not: "SENT" } },
    });
    const template = wedding.waMessageTemplate || DEFAULT_WA_TEMPLATE;
    let sent = 0;
    let failed = 0;
    for (const g of guests) {
      const vars = buildGuestVars(wedding, g, wedding.events[0] ?? null);
      const text = renderTemplate(template, vars);
      const r = await waSend(g.phone!, text);
      if (r.ok) {
        await prisma.guest.update({ where: { id: g.id }, data: { waStatus: "SENT", waSentAt: new Date(), waError: null } });
        sent++;
      } else {
        await prisma.guest.update({ where: { id: g.id }, data: { waStatus: "FAILED", waError: r.error } });
        failed++;
      }
      // Small delay to avoid rate-limiting from WA
      await new Promise((r) => setTimeout(r, 1500));
    }
    res.json({ sent, failed, total: guests.length });
  } catch (e) {
    next(e);
  }
});

/** Preview the rendered template for a specific guest (no actual send). */
router.get("/:weddingId/:guestId/preview-wa", authRequired, async (req, res, next) => {
  try {
    await ensureOwner(req.user!.sub, req.params.weddingId);
    const guest = await prisma.guest.findUnique({ where: { id: req.params.guestId } });
    if (!guest || guest.weddingId !== req.params.weddingId) throw new HttpError(404, "Tamu tidak ditemukan");
    const wedding = await prisma.wedding.findUnique({
      where: { id: req.params.weddingId },
      include: { couple: true, events: { orderBy: { date: "asc" }, take: 1 } },
    });
    if (!wedding) throw new HttpError(404, "Undangan tidak ditemukan");
    const vars = buildGuestVars(wedding, guest, wedding.events[0] ?? null);
    const template = wedding.waMessageTemplate || DEFAULT_WA_TEMPLATE;
    res.json({ text: renderTemplate(template, vars), vars });
  } catch (e) {
    next(e);
  }
});

/* ---------- PUBLIC: lookup by wedding slug + guest slug ---------- */
router.get("/public/:weddingSlug/:guestSlug", async (req, res, next) => {
  try {
    const wedding = await prisma.wedding.findUnique({ where: { slug: req.params.weddingSlug } });
    if (!wedding) return res.status(404).json({ error: "Not found" });
    const guest = await prisma.guest.findFirst({
      where: { weddingId: wedding.id, slug: req.params.guestSlug },
      select: { id: true, name: true, slug: true, invitedTo: true, group: true, opened: true },
    });
    if (!guest) return res.status(404).json({ error: "Not found" });
    if (!guest.opened) {
      await prisma.guest.update({ where: { id: guest.id }, data: { opened: true, openedAt: new Date() } });
    }
    res.json(guest);
  } catch (e) {
    next(e);
  }
});

/* Legacy token-based tracker — kept so old /u/:slug?to=<token> links still work. */
router.post("/:weddingSlug/track-open", async (req, res, next) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) return res.status(400).json({ error: "Missing token" });
    const guest = await prisma.guest.findUnique({ where: { token } });
    if (!guest) return res.status(404).json({ error: "Not found" });
    const wedding = await prisma.wedding.findUnique({ where: { id: guest.weddingId } });
    if (!wedding || wedding.slug !== req.params.weddingSlug) return res.status(404).json({ error: "Not found" });
    if (!guest.opened) {
      await prisma.guest.update({ where: { id: guest.id }, data: { opened: true, openedAt: new Date() } });
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
