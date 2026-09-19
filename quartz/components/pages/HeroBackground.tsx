import { FullSlug, resolveRelative } from "../../util/path"

export default function HeroBackground({
  slug,
  page,
}: {
  slug: FullSlug
  page: "notes" | "about"
}) {
  return (
    <img
      class="blueprint-hero-image"
      src={resolveRelative(slug, `site/img/${page}-blueprint.png` as FullSlug)}
      alt=""
      aria-hidden="true"
      width="1935"
      height="813"
      decoding="async"
      draggable={false}
    />
  )
}
