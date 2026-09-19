import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent } from "../types"
import SiteNav from "./SiteNav"
import HeroBackground from "./HeroBackground"
import { sitePages } from "./sitePages"

const SiteContentPage: QuartzComponent = (props) => {
  const isAbout = props.fileData.slug === sitePages.about
  return (
    <article class="home-page site-content-page">
      <SiteNav {...props} />
      <header class={`site-content-heading${isAbout ? " blueprint-hero about-hero" : ""}`}>
        {isAbout && <HeroBackground slug={props.fileData.slug!} page="about" />}
        <p class="home-kicker">{isAbout ? "ENGINEER / BUILDER" : "BUILD · LEARN · SHARE"}</p>
        <h1>
          {props.fileData.frontmatter?.title}
          {isAbout && <span>.</span>}
        </h1>
        <p>{props.fileData.frontmatter?.description}</p>
      </header>
      <div class="site-content-body popover-hint">
        {htmlToJsx(props.fileData.filePath!, props.tree) as ComponentChildren}
      </div>
    </article>
  )
}

export default SiteContentPage
