/* WhatsApp bot service (Baileys).
 * Single global session for weddQ's number. Persists auth state in `data/whatsapp-auth/`.
 * Exposes init/status/sendMessage/disconnect.
 *
 * When WA_DISABLED=true, returns a no-op mock that logs to console — useful for
 * local development without a real WA connection. */

import { Boom } from "@hapi/boom";
import path from "node:path";
import fs from "node:fs/promises";
import QRCode from "qrcode";

type Status = "DISABLED" | "DISCONNECTED" | "CONNECTING" | "AWAITING_QR" | "CONNECTED" | "FAILED";

type State = {
  status: Status;
  qrDataUrl?: string;
  lastError?: string;
  connectedNumber?: string;
};

const AUTH_DIR = path.resolve(process.cwd(), "data", "whatsapp-auth");
const DISABLED = process.env.WA_DISABLED === "true";

let sock: any = null;
let state: State = { status: DISABLED ? "DISABLED" : "DISCONNECTED" };

/** Normalize phone to E.164 jid: 6281234567890@s.whatsapp.net */
export function normalizeJid(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  // Indonesian shortcut: leading 0 → 62
  const e164 = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `${e164}@s.whatsapp.net`;
}

export function getStatus(): State {
  return { ...state };
}

export async function connect(): Promise<State> {
  if (DISABLED) {
    state = { status: "DISABLED" };
    return state;
  }
  if (state.status === "CONNECTING" || state.status === "AWAITING_QR" || state.status === "CONNECTED") {
    return state;
  }

  state = { status: "CONNECTING" };

  // Lazy-load Baileys (heavy dep, avoid loading at module import)
  const baileys = await import("@whiskeysockets/baileys");
  const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys as any;

  await fs.mkdir(AUTH_DIR, { recursive: true });
  const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: authState,
    printQRInTerminal: false,
    browser: ["weddQ Bot", "Chrome", "1.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update: any) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      try {
        state.qrDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 1 });
        state.status = "AWAITING_QR";
      } catch (e) {
        state.lastError = e instanceof Error ? e.message : String(e);
      }
    }
    if (connection === "open") {
      state = {
        status: "CONNECTED",
        connectedNumber: sock.user?.id?.split(":")[0]?.split("@")[0],
      };
    } else if (connection === "close") {
      const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const isLoggedOut = reason === DisconnectReason.loggedOut;
      state = {
        status: isLoggedOut ? "DISCONNECTED" : "FAILED",
        lastError: isLoggedOut ? "Logout dari WhatsApp. Hubungkan ulang dan scan QR." : `Koneksi terputus (${reason ?? "unknown"})`,
      };
      sock = null;
      if (!isLoggedOut) {
        // Auto-reconnect for transient failures
        setTimeout(() => { connect().catch(() => {}); }, 5_000);
      }
    }
  });

  return state;
}

export async function disconnect(): Promise<void> {
  if (DISABLED) return;
  try {
    if (sock) {
      await sock.logout();
    }
  } catch {
    // ignore
  }
  sock = null;
  // Wipe auth so the next connect requires a new QR scan
  try {
    await fs.rm(AUTH_DIR, { recursive: true, force: true });
  } catch {
    // ignore
  }
  state = { status: "DISCONNECTED" };
}

export async function sendMessage(phone: string, text: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (DISABLED) {
    console.log(`[wa:disabled] would send to ${phone}:\n${text}\n`);
    return { ok: true };
  }
  if (!sock || state.status !== "CONNECTED") {
    return { ok: false, error: "Bot WhatsApp belum terhubung. Buka panel Admin lalu scan QR." };
  }
  try {
    const jid = normalizeJid(phone);
    await sock.sendMessage(jid, { text });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Substitute variables in a template string. Vars: {nama}, {link}, {tanggal}, {venue}, {brideShort}, {groomShort}. */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => vars[key] ?? m);
}

/** Default invite template used if a wedding has none set. */
export const DEFAULT_WA_TEMPLATE = `Assalamu'alaikum Wr. Wb.

Kepada Yth. *{nama}*

Tanpa mengurangi rasa hormat, dengan penuh kebahagiaan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara pernikahan kami:

*{brideShort} & {groomShort}*
🗓 {tanggal}
📍 {venue}

Detail acara dan konfirmasi kehadiran dapat dibuka melalui tautan undangan digital berikut:
{link}

Merupakan suatu kehormatan bagi kami atas kehadiran dan doa restu Anda.

Hormat kami,
{brideShort} & {groomShort}`;
