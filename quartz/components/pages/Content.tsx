import ArticlePage from "./ArticlePage"
import articleStyle from "../styles/articlePage.scss"
// @ts-ignore
import articleScript from "../scripts/article.inline"
import Search from "../Search"
import Darkmode from "../Darkmode"
import { concatenateResources } from "../../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import HomePage from "./HomePage"
import NotesPage from "./NotesPage"
import SiteContentPage from "./SiteContentPage"
import { isSitePage, sitePages } from "./sitePages"

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData } = props
  if (fileData.slug === "index") {
    return <HomePage {...props} />
  }
  if (fileData.slug === sitePages.notes) {
    return <NotesPage {...props} />
  }
  if (isSitePage(fileData.slug)) return <SiteContentPage {...props} />

  return <ArticlePage {...props} />
}

const search = Search({ enablePreview: true })
const darkmode = Darkmode()
Content.css = concatenateResources(HomePage.css, articleStyle, search.css, darkmode.css)
Content.beforeDOMLoaded = concatenateResources(search.beforeDOMLoaded, darkmode.beforeDOMLoaded)
Content.afterDOMLoaded = concatenateResources(
  search.afterDOMLoaded,
  darkmode.afterDOMLoaded,
  articleScript,
)

export default (() => Content) satisfies QuartzComponentConstructor
