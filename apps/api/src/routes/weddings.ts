import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { slugify, isReservedSlug } from "../lib/slug.js";

const router = Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const list = await prisma.wedding.findMany({
      where: { ownerId: req.user!.sub },
      include: { couple: true, template: true, _count: { select: { guests: true, rsvps: true, wishes: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get("/by-id/:id", authRequired, async (req, res, next) => {
  try {
    const w = await prisma.wedding.findFirst({
      where: { id: req.params.id, ownerId: req.user!.sub },
      include: {
        couple: true,
        template: true,
        events: { orderBy: { order: "asc" } },
        gallery: { orderBy: { order: "asc" } },
        gifts: { orderBy: { order: "asc" } },
        storyChapters: { orderBy: { order: "asc" } },
        _count: { select: { guests: true, rsvps: true, wishes: true } },
      },
    });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
    res.json(w);
  } catch (e) {
    next(e);
  }
});

const createSchema = z.object({
  brideShort: z.string().min(1),
  groomShort: z.string().min(1),
  brideName: z.string().min(1),
  groomName: z.string().min(1),
  templateId: z.string().optional(),
  eventDate: z.string().optional(),
});

router.post("/", authRequired, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const baseSlug = slugify(`${body.brideShort}-${body.groomShort}`) || "undangan";
    let slug = baseSlug;
    let counter = 1;
    while (isReservedSlug(slug) || (await prisma.wedding.findUnique({ where: { slug } }))) {
      slug = `${baseSlug}-${counter++}`;
    }
    const wedding = await prisma.wedding.create({
      data: {
        slug,
        ownerId: req.user!.sub,
        templateId: body.templateId,
        couple: {
          create: {
            brideName: body.brideName,
            brideShort: body.brideShort,
            groomName: body.groomName,
            groomShort: body.groomShort,
          },
        },
      },
      include: { couple: true },
    });
    res.status(201).json(wedding);
  } catch (e) {
    next(e);
  }
});

const updateSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  coverImage: z.string().nullish(),
  eyebrow: z.string().optional(),
  story: z.string().nullish(),
  quote: z.string().nullish(),
  openingSalutation: z.string().nullish(),
  closingSalutation: z.string().nullish(),
  waMessageTemplate: z.string().nullish(),
  musicUrl: z.string().nullish(),
  primaryColor: z.string().nullish(),
  templateId: z.string().nullish(),
  couple: z
    .object({
      brideName: z.string().optional(),
      brideShort: z.string().optional(),
      brideParents: z.string().nullish(),
      brideOrder: z.string().nullish(),
      bridePhoto: z.string().nullish(),
      brideInstagram: z.string().nullish(),
      groomName: z.string().optional(),
      groomShort: z.string().optional(),
      groomParents: z.string().nullish(),
      groomOrder: z.string().nullish(),
      groomPhoto: z.string().nullish(),
      groomInstagram: z.string().nullish(),
    })
    .optional(),
});

router.put("/by-id/:id", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    const body = updateSchema.parse(req.body);
    const { couple, ...rest } = body;
    const w = await prisma.wedding.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        couple: couple
          ? { update: couple as never }
          : undefined,
      },
      include: { couple: true },
    });
    res.json(w);
  } catch (e) {
    next(e);
  }
});

const eventSchema = z.object({
  kind: z.enum(["AKAD", "RESEPSI", "NGUNDUH_MANTU", "TASYAKURAN", "LAINNYA"]),
  title: z.string(),
  date: z.string(),
  endTime: z.string().nullish(),
  venueName: z.string(),
  address: z.string(),
  mapUrl: z.string().nullish(),
  dressCode: z.string().nullish(),
  notes: z.string().nullish(),
  order: z.number().int().optional(),
});

router.post("/by-id/:id/events", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    const body = eventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        ...body,
        date: new Date(body.date),
        endTime: body.endTime ? new Date(body.endTime) : null,
        weddingId: req.params.id,
      },
    });
    res.status(201).json(event);
  } catch (e) {
    next(e);
  }
});

router.delete("/by-id/:id/events/:eventId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    await prisma.event.delete({ where: { id: req.params.eventId } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

const giftSchema = z.object({
  kind: z.enum(["BANK", "EWALLET", "QRIS"]),
  bankName: z.string(),
  number: z.string(),
  holder: z.string(),
  order: z.number().int().optional(),
});

router.post("/by-id/:id/gifts", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    const body = giftSchema.parse(req.body);
    const gift = await prisma.giftAccount.create({ data: { ...body, weddingId: req.params.id } });
    res.status(201).json(gift);
  } catch (e) {
    next(e);
  }
});

router.delete("/by-id/:id/gifts/:giftId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    await prisma.giftAccount.delete({ where: { id: req.params.giftId } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

const gallerySchema = z.object({
  url: z.string(),
  caption: z.string().nullish(),
  order: z.number().int().optional(),
});

router.post("/by-id/:id/gallery", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    const body = gallerySchema.parse(req.body);
    const item = await prisma.galleryItem.create({ data: { ...body, weddingId: req.params.id } });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.delete("/by-id/:id/gallery/:itemId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    await prisma.galleryItem.delete({ where: { id: req.params.itemId } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/* ---------- STORY CHAPTERS ---------- */

const chapterSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1),
  photo: z.string().nullish(),
  order: z.number().int().optional(),
});

router.post("/by-id/:id/chapters", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    const body = chapterSchema.parse(req.body);
    const last = await prisma.storyChapter.findFirst({
      where: { weddingId: req.params.id },
      orderBy: { order: "desc" },
    });
    const ch = await prisma.storyChapter.create({
      data: {
        ...body,
        weddingId: req.params.id,
        order: body.order ?? (last ? last.order + 1 : 0),
      },
    });
    res.status(201).json(ch);
  } catch (e) {
    next(e);
  }
});

router.put("/by-id/:id/chapters/:chapterId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    const body = chapterSchema.partial().parse(req.body);
    const ch = await prisma.storyChapter.update({
      where: { id: req.params.chapterId },
      data: body,
    });
    res.json(ch);
  } catch (e) {
    next(e);
  }
});

router.delete("/by-id/:id/chapters/:chapterId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    await prisma.storyChapter.delete({ where: { id: req.params.chapterId } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});

router.put("/by-id/:id/chapters-reorder", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({ where: { id: req.params.id, ownerId: req.user!.sub } });
    if (!owned) throw new HttpError(404, "Undangan tidak ditemukan");
    const { ids } = reorderSchema.parse(req.body);
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.storyChapter.update({ where: { id }, data: { order: i } })
      )
    );
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// PUBLIC by slug, used by guest-facing invitation page
router.get("/public/:slug", async (req, res, next) => {
  try {
    const w = await prisma.wedding.findUnique({
      where: { slug: req.params.slug },
      include: {
        couple: true,
        template: true,
        events: { orderBy: { date: "asc" } },
        gallery: { orderBy: { order: "asc" } },
        gifts: { orderBy: { order: "asc" } },
        storyChapters: { orderBy: { order: "asc" } },
        wishes: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
    if (!w) throw new HttpError(404, "Undangan tidak ditemukan");
    res.json(w);
  } catch (e) {
    next(e);
  }
});

export default router;
