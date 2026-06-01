import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminOnly, authRequired } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { category } = req.query as { category?: string };
    const templates = await prisma.template.findMany({
      where: category && category !== "all" ? { category } : undefined,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
    res.json(templates);
  } catch (e) {
    next(e);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const tpl = await prisma.template.findUnique({ where: { slug: req.params.slug } });
    if (!tpl) return res.status(404).json({ error: "Template tidak ditemukan" });
    res.json(tpl);
  } catch (e) {
    next(e);
  }
});

const upsertSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  style: z.string(),
  category: z.string(),
  priceIdr: z.number().int().nonnegative(),
  badge: z.string().nullish(),
  isFeatured: z.boolean().optional(),
  palette: z.string(),
  description: z.string().nullish(),
  features: z.array(z.string()).default([]),
});

router.post("/", authRequired, adminOnly, async (req, res, next) => {
  try {
    const body = upsertSchema.parse(req.body);
    const tpl = await prisma.template.create({ data: body });
    res.status(201).json(tpl);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const body = upsertSchema.partial().parse(req.body);
    const tpl = await prisma.template.update({ where: { id: req.params.id }, data: body });
    res.json(tpl);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    await prisma.template.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
