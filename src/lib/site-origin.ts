import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/** Adres, pod którym działa strona (np. https://twoja-domena.pl) – potrzebny do pełnych linków w og:image. */
export const getSiteOrigin = createServerFn({ method: "GET" }).handler(async () => {
  const req = getRequest();
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
});
