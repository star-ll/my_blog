import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import HomePage from "./HomePage"
import NotesPage from "./NotesPage"
import SiteContentPage from "./SiteContentPage"
import { isSitePage, sitePages } from "./sitePages"

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree } = props
  if (fileData.slug === "index") {
    return <HomePage {...props} />
  }
  if (fileData.slug === sitePages.notes) {
    return <NotesPage {...props} />
  }
  if (isSitePage(fileData.slug)) return <SiteContentPage {...props} />

  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")
  return <article class={classString}>{content}</article>
}

Content.css = HomePage.css

export default (() => Content) satisfies QuartzComponentConstructor
