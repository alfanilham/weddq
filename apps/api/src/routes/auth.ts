import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { HttpError } from "../middleware/error.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(120),
  phone: z.string().max(40).optional(),
});

router.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) throw new HttpError(409, "Email sudah terdaftar");
    const hash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, phone: body.phone, password: hash },
    });
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new HttpError(401, "Email atau kata sandi salah");
    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) throw new HttpError(401, "Email atau kata sandi salah");
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
    });
    if (!user) throw new HttpError(404, "User not found");
    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;
