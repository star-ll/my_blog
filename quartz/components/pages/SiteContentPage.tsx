import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent } from "../types"
import SiteNav from "./SiteNav"

const SiteContentPage: QuartzComponent = (props) => (
  <article class="home-page site-content-page">
    <SiteNav {...props} />
    <header class="site-content-heading">
      <p class="home-kicker">BUILD · LEARN · SHARE</p>
      <h1>{props.fileData.frontmatter?.title}</h1>
      <p>{props.fileData.frontmatter?.description}</p>
    </header>
    <div class="site-content-body popover-hint">
      {htmlToJsx(props.fileData.filePath!, props.tree) as ComponentChildren}
    </div>
  </article>
)

export default SiteContentPage
