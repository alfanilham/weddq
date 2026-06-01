/** Slugs that can never be assigned to a wedding because they collide with
 * frontend routes or system paths. Keep this list synced with App.tsx routes. */
export const RESERVED_SLUGS = new Set<string>([
  "u",
  "api",
  "dashboard",
  "admin",
  "login",
  "register",
  "logout",
  "templates",
  "template",
  "preview-frame",
  "preview",
  "assets",
  "public",
  "static",
  "weddq",
  "www",
  "mail",
  "blog",
  "docs",
  "help",
  "support",
  "about",
  "contact",
  "pricing",
  "terms",
  "privacy",
  "404",
]);

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
