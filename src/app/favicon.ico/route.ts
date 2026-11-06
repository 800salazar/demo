import { brandIcons } from "@/config/brand";

/** Browsers also request this conventional path without consulting page metadata. */
export function GET() {
  return new Response(null, {
    status: 308,
    headers: { Location: brandIcons.icon.url, "Cache-Control": "public, max-age=86400" },
  });
}
