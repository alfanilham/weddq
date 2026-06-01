import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import auth from "./routes/auth.js";
import templates from "./routes/templates.js";
import weddings from "./routes/weddings.js";
import guests from "./routes/guests.js";
import rsvp from "./routes/rsvp.js";
import wishes from "./routes/wishes.js";
import admin from "./routes/admin.js";
import whatsapp from "./routes/whatsapp.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? true,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "weddQ-api" }));

app.use("/api/auth", auth);
app.use("/api/templates", templates);
app.use("/api/weddings", weddings);
app.use("/api/guests", guests);
app.use("/api/rsvp", rsvp);
app.use("/api/wishes", wishes);
app.use("/api/admin", admin);
app.use("/api/whatsapp", whatsapp);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`▸ weddQ API ready at http://localhost:${PORT}`);
  // Auto-resume WA bot if a saved session exists on disk
  import("./lib/whatsapp.js").then(async ({ connect }) => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const authDir = path.resolve(process.cwd(), "data", "whatsapp-auth");
    try {
      const files = await fs.readdir(authDir);
      if (files.length > 0 && process.env.WA_DISABLED !== "true") {
        console.log("▸ WhatsApp session detected, auto-connecting…");
        connect().catch((e) => console.error("WA auto-connect failed:", e));
      }
    } catch {
      // no session dir yet — admin will trigger first connect manually
    }
  });
});
