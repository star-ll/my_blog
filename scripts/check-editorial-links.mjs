import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = path.resolve("public")
const pages = ["index", "site/notes", "site/lab", "site/lab/deco", "site/about", "site/now"]
let checked = 0
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, `${page}.html`), "utf8")
  assert.match(html, /class="home-nav"/)
  assert.match(
    html,
    /href="[^"]*index\.css\?v=[^"]+"/,
    "stylesheet must bypass prior deployment cache",
  )
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(raw)) continue
    const target = decodeURIComponent(
      new URL(raw, `https://test.invalid/${page}`).pathname,
    ).replace(/^\//, "")
    const resolved = path.join(root, target)
    assert.ok(
      [resolved, `${resolved}.html`, path.join(resolved, "index.html")].some((p) =>
        fs.existsSync(p),
      ),
      `${page}: broken link ${raw}`,
    )
    checked++
  }
  if (page === "site/notes" || page === "site/about") {
    const name = page.split("/")[1]
    assert.match(html, new RegExp(`src="[^\"]*static/blueprints/${name}-blueprint.png"`))
    assert.match(html, /blueprint-hero/)
  }
  if (page === "site/notes") {
    assert.ok(
      !/class="notes-entry internal"[^>]*href="[^\"]*site\//.test(html),
      "site pages leaked into Notes",
    )
    assert.match(html, /notes-entry-date/)
  }
  if (page === "index") assert.match(html, /class="home-now-item"/)
}
console.log(
  `Verified ${pages.length} pages, ${checked} local references, hero assets, Notes dates and Now content.`,
)
