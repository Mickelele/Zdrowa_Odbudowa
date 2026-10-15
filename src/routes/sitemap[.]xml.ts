import { createFileRoute } from "@tanstack/react-router";
import cennik from "@/data/cennik.json";
import { originFromRequest } from "@/lib/site-origin";

// Mapa strony dla Google: strona główna + najważniejsze zdjęcia (pomaga w Grafice Google).
const IMAGES = [
  ["/og-image.jpg", "Salon Zdrowa Odbudowa w Kobyłce – wnętrze i efekty koloryzacji"],
  ["/salon/lustra.webp", "Lustra w kształcie łuków w salonie Zdrowa Odbudowa"],
  ["/salon/wnetrze-1.webp", "Wnętrze salonu fryzjerskiego Zdrowa Odbudowa w Kobyłce"],
  ["/salon/wnetrze-2.webp", "Stanowiska fryzjerskie w salonie Zdrowa Odbudowa"],
  ...Array.from({ length: 5 }, (_, i) => [`/przed-po/${i + 1}-po.webp`, `Trwała rekonstrukcja włosa – efekt po zabiegu ${i + 1}`]),
  ...Array.from({ length: 13 }, (_, i) => [`/koloryzacja/${i + 1}.webp`, `Koloryzacja włosów w Kobyłce – metamorfoza ${i + 1}`]),
] as const;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = originFromRequest(request);
        const lastmod = (cennik as { aktualizacja: string }).aktualizacja.slice(0, 10);
        const images = IMAGES.map(
          ([src, title]) => `    <image:image><image:loc>${esc(origin + src)}</image:loc><image:title>${esc(title)}</image:title></image:image>`,
        ).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${esc(origin)}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${images}
  </url>
</urlset>
`;
        return new Response(xml, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
