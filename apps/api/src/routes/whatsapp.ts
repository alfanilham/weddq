import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { getStatus } from "../lib/whatsapp.js";

/* Lightweight user-facing endpoint so the dashboard can know if the weddQ bot
 * is connected, without exposing QR codes or admin-only diagnostics. */

const router = Router();

router.get("/status", authRequired, (_req, res) => {
  const s = getStatus();
  res.json({ status: s.status, connectedNumber: s.connectedNumber });
});

export default router;
