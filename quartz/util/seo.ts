import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, simplifySlug } from "./path"
import { unescapeHTML } from "./escape"
import { isSitePage } from "../components/pages/sitePages"

const pages: Record<string, [string, string]> = {
  index: [
    "余烬 Yujin · 前端、Rust 与 AI Agent",
    "余烬的个人网站，分享前端工程、Web 内部机制、Rust 与 AI Agent 的学习和实践。通过项目实验理解系统，通过写作记录设计思想与工程权衡。",
  ],
  "site/notes": [
    "Notes · 技术文章",
    "关注 AI 系统、Web 内部机制与软件设计的深入探索。记录实现，也记录设计背后的权衡。",
  ],
  "site/about": [
    "About · 关于余烬",
    "了解余烬 Yujin：关注前端工程、Rust 与 AI Agent 的软件工程师，以及他的技术经验与工程实践。",
  ],
  "site/lab": [
    "Lab · 项目与实验",
    "为学习和理解系统而构建的项目与实验，探索前端框架、Rust 和 AI Agent 的设计思想与工程权衡。",
  ],
  "site/lab/deco": [
    "Deco · 前端框架设计实验",
    "借鉴 Vue 原理实现的 Web Component 框架，通过构建理解响应式、渲染与调度，记录框架设计中的思考和权衡。",
  ],
  "site/now": [
    "Now · 近况",
    "余烬最近正在构建、学习和思考的事情：Rust、轻量 Agent 与 AI 工程实践。",
  ],
}

export function pageUrl(baseUrl: string, slug: string): string {
  const base = new URL(`https://${baseUrl.replace(/\/$/, "")}/`)
  const path = simplifySlug(slug as FullSlug)
    .split("/")
    .map(encodeURIComponent)
    .join("/")
  return new URL(path, base).href
}

export function pageSeo(cfg: GlobalConfiguration, data: QuartzPluginData) {
  const slug = data.slug ?? "index"
  const defaults = pages[slug]
  const fm = data.frontmatter
  const rawTitle = String(fm?.title ?? "").trim()
  const generic = /^(index|home|notes|about|lab|deco|now)$/i.test(rawTitle)
  const name = defaults && (!rawTitle || generic) ? defaults[0] : rawTitle || "页面"
  const title = name + (cfg.pageTitleSuffix || ` | ${cfg.pageTitle}`)
  const clean = (value: unknown) =>
    unescapeHTML(String(value ?? ""))
      .replace(/\s+/g, " ")
      .trim()
  const fallback = defaults?.[1] ?? clean(data.description) ?? ""
  const description = clean(fm?.description) || fallback || `${name}：余烬的技术文章与学习记录。`
  const socialDescription = clean(fm?.socialDescription) || description
  const article =
    !!data.filePath &&
    !isSitePage(slug) &&
    !slug.endsWith("/index") &&
    slug !== "404" &&
    !slug.startsWith("tags/")
  return {
    name,
    title,
    description,
    socialDescription,
    article,
    url: pageUrl(cfg.baseUrl ?? "blog.yujin123.cn", slug),
  }
}
