import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import HomePage from "./HomePage"

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree } = props
  if (fileData.slug === "index") {
    return <HomePage {...props} />
  }

  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")
  return <article class={classString}>{content}</article>
}

Content.css = HomePage.css

export default (() => Content) satisfies QuartzComponentConstructor
