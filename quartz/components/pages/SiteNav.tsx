import { FullSlug, resolveRelative } from "../../util/path"
import Darkmode from "../Darkmode"
import Search from "../Search"
import { QuartzComponent } from "../types"
import { isSitePage, sitePages } from "./sitePages"

const SiteSearch = Search({ enablePreview: true })
const SiteDarkmode = Darkmode()

const SiteNav: QuartzComponent = (props) => {
  const link = (slug: string) => resolveRelative(props.fileData.slug!, slug as FullSlug)
  return (
    <header class="home-nav" aria-label="Primary navigation">
      <a class="home-brand" href={link("index")} aria-label="YU / LAB home">
        <img
          class="brand-mark"
          src={link("static/brand/yu-mark.png")}
          width="38"
          height="38"
          alt=""
          aria-hidden="true"
        />
        <span>YU / LAB</span>
      </a>
      <span class="home-mantra">Build · Learn · Share</span>
      <nav>
        {[
          { label: "Home", slug: sitePages.home },
          { label: "Notes", slug: sitePages.notes },
          { label: "Lab", slug: sitePages.lab },
          { label: "About", slug: sitePages.about },
        ].map(({ label, slug }) => (
          <a
            href={link(slug)}
            aria-current={
              props.fileData.slug === slug ||
              (slug === sitePages.notes && !isSitePage(props.fileData.slug)) ||
              (slug === sitePages.lab && props.fileData.slug === sitePages.deco)
                ? "page"
                : undefined
            }
          >
            {label}
          </a>
        ))}
        <a href="https://github.com/star-ll" class="external home-nav-github">
          GitHub
        </a>
        <SiteSearch {...props} />
        <span class="home-nav-divider" aria-hidden="true" />
        <SiteDarkmode {...props} />
      </nav>
    </header>
  )
}

export default SiteNav
