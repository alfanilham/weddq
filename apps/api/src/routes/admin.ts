import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminOnly, authRequired } from "../middleware/auth.js";
import { connect as waConnect, disconnect as waDisconnect, getStatus as waStatus } from "../lib/whatsapp.js";

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

export default router;
