import { FullSlug, resolveRelative } from "../../util/path"
import Darkmode from "../Darkmode"
import Search from "../Search"
import { QuartzComponent } from "../types"

const SiteSearch = Search({ enablePreview: true })
const SiteDarkmode = Darkmode()

const SiteNav: QuartzComponent = (props) => {
  const link = (slug: string) => resolveRelative(props.fileData.slug!, slug as FullSlug)
  return (
    <header class="home-nav" aria-label="Primary navigation">
      <a class="home-brand" href={link("index")} aria-label="YU / LAB home">
        YU / LAB
      </a>
      <span class="home-mantra">Build · Learn · Share</span>
      <nav>
        <a
          href={link("writing")}
          aria-current={props.fileData.slug === "writing" ? "page" : undefined}
        >
          Notes
        </a>
        <a href={link("lab")}>Lab</a>
        <a href={`${link("index")}#about`}>About</a>
        <a href="https://github.com/star-ll" class="external">
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
