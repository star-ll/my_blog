import { Root } from "hast"
import { ComponentChildren } from "preact"
import { visit } from "unist-util-visit"
import readingTime from "reading-time"
import { clone } from "../../util/clone"
import { htmlToJsx } from "../../util/jsx"
import { FullSlug, resolveRelative } from "../../util/path"
import { QuartzComponent } from "../types"
import { Date as ArticleDate } from "../Date"
import SiteNav from "./SiteNav"
import { sitePages, isSitePage } from "./sitePages"

const ArticlePage: QuartzComponent = (props) => {
  const { fileData } = props
  const link = (slug: string) => resolveRelative(fileData.slug!, slug as FullSlug)
  const folder = fileData.slug!.split("/").slice(0, -1).join("/")
  const category = (fileData.relativePath ?? fileData.slug!).split("/").slice(0, -1).join(" / ")
  const toc = fileData.toc ?? []
  let section = 0
  const entries = toc.map((entry) => ({
    ...entry,
    number: entry.depth === 0 ? String(++section).padStart(2, "0") : "",
  }))
  const numbers = new Map(entries.filter((e) => e.number).map((e) => [e.slug, e.number]))
  const tree = clone(props.tree) as Root
  visit(tree, "element", (node) => {
    const number = numbers.get(String(node.properties?.id ?? ""))
    if (/^h[1-6]$/.test(node.tagName) && number) node.properties["data-section"] = number
  })
  const related = props.allFiles
    .filter(
      (f) =>
        f.slug &&
        f.slug !== fileData.slug &&
        !isSitePage(f.slug) &&
        !f.slug.startsWith("site/") &&
        f.slug.split("/").slice(0, -1).join("/") === folder,
    )
    .slice(0, 3)
  const minutes = Math.max(1, Math.ceil(readingTime(fileData.text ?? "").minutes))
  const date = fileData.dates?.created ?? fileData.dates?.modified
  const modified = fileData.dates?.modified
  return (
    <article class="home-page article-page">
      <SiteNav {...props} />
      <div class="article-progress" aria-hidden="true">
        <span />
      </div>
      <div class="article-layout">
        <aside class="article-rail" aria-label="文章导航">
          <a class="article-back internal" href={link(sitePages.notes)}>
            返回 Notes
          </a>
          {entries.length > 0 && (
            <details class="article-toc" open>
              <summary>本文目录</summary>
              <nav aria-label="本文目录">
                {entries.map((entry) => (
                  <a
                    key={entry.slug}
                    href={`#${entry.slug}`}
                    data-article-heading={entry.slug}
                    class={`article-toc-depth-${entry.depth}`}
                  >
                    <span aria-hidden="true">{entry.number}</span>
                    {entry.text}
                  </a>
                ))}
              </nav>
            </details>
          )}
          {related.length > 0 && (
            <a class="article-related-jump" href="#article-related">
              同主题文章
            </a>
          )}
        </aside>
        <div class="article-main">
          <header class="article-heading">
            <p class="article-breadcrumb">
              <a class="internal" href={link(sitePages.notes)}>
                Notes
              </a>
              {category && <> / {category}</>}
            </p>
            <p class="home-kicker">ENGINEERING NOTES</p>
            <h1>{fileData.frontmatter?.title}</h1>
            <div class="article-meta">
              {date && <ArticleDate date={date} locale="zh-CN" />}
              <span>{minutes} 分钟阅读</span>
              {modified && date && modified.toDateString() !== date.toDateString() && (
                <span>
                  更新于 <ArticleDate date={modified} locale="zh-CN" />
                </span>
              )}
            </div>
          </header>
          <div
            class={`article-prose popover-hint ${(fileData.frontmatter?.cssclasses ?? []).join(" ")}`}
          >
            {htmlToJsx(fileData.filePath!, tree) as ComponentChildren}
          </div>
          {related.length > 0 && (
            <section id="article-related" class="article-related">
              <h2>同主题文章</h2>
              {related.map((file) => (
                <a class="internal" href={link(file.slug!)}>
                  {file.frontmatter?.title}
                </a>
              ))}
            </section>
          )}
          <footer class="article-footer">
            <a class="internal" href={link(sitePages.notes)}>
              返回 Notes
            </a>
            <a href="#" class="article-top">
              回到顶部
            </a>
          </footer>
        </div>
      </div>
    </article>
  )
}
export default ArticlePage
