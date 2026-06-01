import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

const rsvpSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["HADIR", "TIDAK", "RAGU"]),
  pax: z.number().int().min(1).max(10).default(1),
  session: z.string().nullish(),
  message: z.string().max(800).nullish(),
  guestToken: z.string().nullish(),
  guestSlug: z.string().nullish(),
});

// PUBLIC submit by slug
router.post("/public/:slug", async (req, res, next) => {
  try {
    const wedding = await prisma.wedding.findUnique({ where: { slug: req.params.slug } });
    if (!wedding) return res.status(404).json({ error: "Undangan tidak ditemukan" });
    const body = rsvpSchema.parse(req.body);

    // Resolve guest: prefer slug (new), fallback to token (legacy)
    let guest = null;
    if (body.guestSlug) {
      guest = await prisma.guest.findFirst({
        where: { weddingId: wedding.id, slug: body.guestSlug },
      });
    } else if (body.guestToken) {
      const g = await prisma.guest.findUnique({ where: { token: body.guestToken } });
      if (g && g.weddingId === wedding.id) guest = g;
    }

    const name = body.name ?? guest?.name;
    if (!name) {
      return res.status(400).json({ error: "Nama tamu wajib diisi" });
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        weddingId: wedding.id,
        guestId: guest?.id,
        name,
        status: body.status,
        pax: body.pax,
        session: body.session ?? guest?.invitedTo ?? null,
        message: body.message ?? null,
      },
    });
    res.status(201).json(rsvp);
  } catch (e) {
    next(e);
  }
});

// OWNER list
router.get("/:weddingId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({
      where: { id: req.params.weddingId, ownerId: req.user!.sub },
    });
    if (!owned) return res.status(404).json({ error: "Tidak ditemukan" });
    const { status } = req.query as { status?: string };
    const rsvps = await prisma.rsvp.findMany({
      where: {
        weddingId: req.params.weddingId,
        ...(status && status !== "all" ? { status: status as never } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(rsvps);
  } catch (e) {
    next(e);
  }
});

export default router;
