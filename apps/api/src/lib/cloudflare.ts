import { HttpError } from "../middleware/error.js";

/* Cloudflare for SaaS — Custom Hostnames.
 *
 * Karena domain (.my.id) dibeli & dikelola pihak weddQ, alurnya:
 *  1) Domain didaftarkan sebagai "custom hostname" di zona SaaS (CF_SAAS_ZONE_ID).
 *  2) Cloudflare menerbitkan sertifikat (DV) → trafik otomatis lewat edge CF
 *     (proxied / orange-cloud) sehingga origin tersembunyi & anti-MITM.
 *  3) Kita arahkan DNS .my.id (CNAME, proxied) ke fallback origin SaaS.
 *
 * Semua dikontrol via API. Bila env belum diset, modul berjalan "manual mode":
 * domain tetap tersimpan di DB, admin mengelola DNS/cert di dashboard CF sendiri.
 */

const API = "https://api.cloudflare.com/client/v4";
const TOKEN = process.env.CF_API_TOKEN;
const ZONE = process.env.CF_SAAS_ZONE_ID;
/** CNAME target yang harus ditunjuk oleh domain custom (fallback origin SaaS). */
export const CF_FALLBACK_ORIGIN = process.env.CF_FALLBACK_ORIGIN ?? "cname.weddq.id";

export function cloudflareConfigured(): boolean {
  return Boolean(TOKEN && ZONE);
}

type CfHostname = {
  id: string;
  hostname: string;
  status: string; // active | pending | pending_deletion | blocked | moved | ...
  ssl?: { status?: string; method?: string };
  verification_errors?: string[];
};

/** Petakan respons Cloudflare → status domain internal. */
export function mapCfStatus(h: CfHostname): "ACTIVE" | "PENDING" | "ERROR" {
  if (h.status === "active" && (h.ssl?.status ?? "active") === "active") return "ACTIVE";
  if (h.verification_errors && h.verification_errors.length > 0) return "ERROR";
  return "PENDING";
}

async function cf<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await r.json()) as { success: boolean; result: T; errors?: Array<{ message: string }> };
  if (!json.success) {
    const msg = json.errors?.map((e) => e.message).join("; ") || `Cloudflare API ${r.status}`;
    throw new HttpError(502, `Cloudflare: ${msg}`);
  }
  return json.result;
}

export async function createCustomHostname(hostname: string): Promise<CfHostname> {
  return cf<CfHostname>(`/zones/${ZONE}/custom_hostnames`, {
    method: "POST",
    body: JSON.stringify({
      hostname,
      ssl: { method: "http", type: "dv", settings: { min_tls_version: "1.2" } },
    }),
  });
}

export async function getCustomHostname(id: string): Promise<CfHostname> {
  return cf<CfHostname>(`/zones/${ZONE}/custom_hostnames/${id}`, { method: "GET" });
}

export async function deleteCustomHostname(id: string): Promise<void> {
  await cf(`/zones/${ZONE}/custom_hostnames/${id}`, { method: "DELETE" });
}
