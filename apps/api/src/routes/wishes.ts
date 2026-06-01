import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

const wishSchema = z.object({
  name: z.string().min(1).max(80),
  message: z.string().min(1).max(800),
});

router.post("/public/:slug", async (req, res, next) => {
  try {
    const wedding = await prisma.wedding.findUnique({ where: { slug: req.params.slug } });
    if (!wedding) return res.status(404).json({ error: "Undangan tidak ditemukan" });
    const body = wishSchema.parse(req.body);
    const wish = await prisma.wish.create({
      data: { weddingId: wedding.id, name: body.name, message: body.message },
    });
    res.status(201).json(wish);
  } catch (e) {
    next(e);
  }
});

router.get("/:weddingId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({
      where: { id: req.params.weddingId, ownerId: req.user!.sub },
    });
    if (!owned) return res.status(404).json({ error: "Tidak ditemukan" });
    const { status } = req.query as { status?: string };
    const wishes = await prisma.wish.findMany({
      where: {
        weddingId: req.params.weddingId,
        ...(status && status !== "all" ? { status: status as never } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(wishes);
  } catch (e) {
    next(e);
  }
});

router.put("/:weddingId/:wishId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({
      where: { id: req.params.weddingId, ownerId: req.user!.sub },
    });
    if (!owned) return res.status(404).json({ error: "Tidak ditemukan" });
    const body = z.object({ status: z.enum(["PUBLISHED", "HIDDEN"]) }).parse(req.body);
    const w = await prisma.wish.update({ where: { id: req.params.wishId }, data: body });
    res.json(w);
  } catch (e) {
    next(e);
  }
});

router.delete("/:weddingId/:wishId", authRequired, async (req, res, next) => {
  try {
    const owned = await prisma.wedding.findFirst({
      where: { id: req.params.weddingId, ownerId: req.user!.sub },
    });
    if (!owned) return res.status(404).json({ error: "Tidak ditemukan" });
    await prisma.wish.delete({ where: { id: req.params.wishId } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
