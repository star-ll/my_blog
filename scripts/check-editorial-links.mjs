import { readFileSync, existsSync, statSync } from "node:fs"
import { resolve } from "node:path"
import assert from "node:assert/strict"

let checked = 0
for (const page of ["index", "writing"]) {
  const html = readFileSync(`public/${page}.html`, "utf8")
  assert.match(html, />Notes</)
  if (page === "index") {
    assert.equal((html.match(/class="home-writing-item internal"/g) ?? []).length, 3)
    assert.match(html, /Building lightweight agent systems in Rust/)
  } else {
    assert.match(html, /notes-archive/)
    assert.ok(!html.includes('class="graph"'), "Notes should not mount Graph")
  }
  for (const [, raw] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const url = new URL(
      raw.replaceAll("&amp;", "&"),
      `https://test.local/${page === "index" ? "" : page}`,
    )
    if (url.origin !== "https://test.local") continue
    const pathname = decodeURIComponent(url.pathname)
    const target = resolve("public", `.${pathname}`)
    const paths = [target + ".html", resolve(target, "index.html"), target]
    const file = paths.find((path) => existsSync(path) && statSync(path).isFile())
    assert.ok(file, `${page}: broken link ${raw}`)
    if (url.hash && file.endsWith(".html")) {
      const targetHtml = readFileSync(file, "utf8")
      assert.ok(
        targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
        `${page}: missing fragment ${raw}`,
      )
    }
    checked++
  }
}
console.log(`Passed: ${checked} local links on Home and Notes resolve to built output.`)
