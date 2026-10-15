import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Adres, pod którym działa strona (np. https://zdrowa-odbudowa.vercel.app) – potrzebny do pełnych
 * linków: adres kanoniczny, og:image, sitemap.xml, robots.txt.
 * Po podpięciu własnej domeny ustaw w Vercelu zmienną SITE_URL (np. https://zdrowaodbudowa.pl),
 * żeby Google zawsze widział jeden, ten sam adres.
 */
export function originFromRequest(req: Request) {
  const fixed = typeof process !== "undefined" ? process.env["SITE_URL"] : undefined;
  if (fixed) return fixed.replace(/\/+$/, "");
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const getSiteOrigin = createServerFn({ method: "GET" }).handler(async () => originFromRequest(getRequest()));
