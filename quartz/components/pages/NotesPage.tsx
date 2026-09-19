import { resolveRelative } from "../../util/path"
import { QuartzComponent } from "../types"
import SiteNav from "./SiteNav"
import { isSitePage } from "./sitePages"
import { Date as ArticleDate } from "../Date"

const NotesPage: QuartzComponent = (props) => {
  const posts = props.allFiles.filter(
    (file) =>
      file.slug &&
      !isSitePage(file.slug) &&
      !file.slug.startsWith("site-") &&
      !["index", "writing", "now", "lab"].includes(file.slug) &&
      !file.slug.startsWith("lab/") &&
      !file.slug.startsWith("tags/") &&
      !file.slug.endsWith("/index"),
  )
  const groups = new Map<string, typeof posts>()
  for (const post of posts) {
    const category =
      (post.relativePath ?? post.slug!).split("/").slice(0, -1).join(" / ") || "Notes"
    groups.set(category, [...(groups.get(category) ?? []), post])
  }
  const categories = [...groups.keys()].sort((a, b) => a.localeCompare(b, "zh-CN"))
  return (
    <article class="home-page notes-page">
      <SiteNav {...props} />
      <section class="notes-hero">
        <p class="home-kicker">LEARN / EXPLORE / WRITE</p>
        <h1>
          Notes<span>.</span>
        </h1>
        <p class="notes-intro">把理解写下来，让思考更清晰。</p>
        <p class="notes-description">
          关于 AI 系统、Web 内部机制与软件设计的深入探索。记录实现，也记录设计背后的权衡。
        </p>
        <div class="notes-summary">
          {posts.length} NOTES <span>·</span> {categories.length} TOPICS
        </div>
      </section>
      <div class="notes-layout">
        <aside class="notes-topics" aria-label="Note topics">
          <div class="home-section-label">
            EXPLORE <span />
          </div>
          {categories.map((category, i) => (
            <a href={`#topic-${i}`}>
              <span>{category}</span>
              <small>{groups.get(category)!.length}</small>
            </a>
          ))}
        </aside>
        <div class="notes-archive">
          {categories.map((category, i) => (
            <section id={`topic-${i}`} class="notes-group">
              <div class="home-section-label">
                <h2>{category}</h2>
                <span />
              </div>
              {groups
                .get(category)!
                .sort((a, b) =>
                  String(a.frontmatter?.title).localeCompare(String(b.frontmatter?.title), "zh-CN"),
                )
                .map((post) => (
                  <a
                    class="notes-entry internal"
                    href={resolveRelative(props.fileData.slug!, post.slug!)}
                  >
                    <div>
                      {post.dates?.modified && (
                        <div class="notes-entry-date">
                          更新于 <ArticleDate date={post.dates.modified} locale="zh-CN" />
                        </div>
                      )}
                      <h3>{post.frontmatter?.title}</h3>
                      <p>
                        {String(post.frontmatter?.description ?? post.description ?? "").slice(
                          0,
                          140,
                        )}
                      </p>
                    </div>
                    <span class="notes-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ))}
            </section>
          ))}
        </div>
      </div>
      <footer class="notes-footer">
        <span>Build to learn. Write to think clearly.</span>
        <a
          href={resolveRelative(
            props.fileData.slug!,
            "index" as import("../../util/path").FullSlug,
          )}
        >
          Back home ↗
        </a>
      </footer>
    </article>
  )
}

export default NotesPage
