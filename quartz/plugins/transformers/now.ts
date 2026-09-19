import type { Root, RootContent, PhrasingContent } from "mdast"
import { QuartzTransformerPlugin } from "../types"

export interface NowItem {
  title: string
  description: string
  status: string
  active: boolean
}

function text(node: Root | RootContent | PhrasingContent): string {
  if ("value" in node && typeof node.value === "string") return node.value
  return "children" in node ? node.children.map(text).join("") : ""
}

// Ordinary Markdown survives Syncer's filtering of custom frontmatter.
export function parseNow(tree: Root): NowItem[] {
  const items: NowItem[] = []
  let item: NowItem | undefined
  for (const node of tree.children) {
    if (node.type === "heading" && node.depth <= 2) {
      item = undefined
      const title = text(node).trim()
      if (node.depth === 2 && title) {
        item = { title, description: "", status: "进行中", active: true }
        items.push(item)
      }
    } else if (item && node.type === "paragraph") {
      item.description = [item.description, text(node).trim()].filter(Boolean).join(" ")
    } else if (item && node.type === "blockquote") {
      item.status = text(node).trim() || "进行中"
      item.active = /^(进行中|In progress)$/i.test(item.status)
    }
  }
  return items
}

export const NowContent: QuartzTransformerPlugin = () => ({
  name: "NowContent",
  markdownPlugins() {
    return [
      () => (tree, file) => {
        if (file.data.slug === "site-now") file.data.nowItems = parseNow(tree)
      },
    ]
  },
})

declare module "vfile" {
  interface DataMap {
    nowItems: NowItem[]
  }
}
