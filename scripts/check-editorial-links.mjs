import { readFileSync, existsSync, statSync } from "node:fs"
import { resolve } from "node:path"
import assert from "node:assert/strict"

let checked = 0
for (const page of ["index", "site-notes", "site-lab", "site-deco", "site-about"]) {
  const html = readFileSync(`public/${page}.html`, "utf8")
  assert.match(html, />Notes</)
  assert.match(html, />Home</)
  assert.match(html, /href="\.\/site-about"/)
  if (page === "index") {
    assert.equal((html.match(/class="home-writing-item internal"/g) ?? []).length, 3)
    assert.match(html, /用 Rust 构建轻量 Agent/)
  } else if (page === "site-notes") {
    assert.match(html, /notes-archive/)
    const entryCount = (html.match(/class="notes-entry internal"/g) ?? []).length
    assert.ok(entryCount > 0)
    assert.equal(
      (html.match(/class="notes-entry-date"/g) ?? []).length,
      entryCount,
      "Every article needs an update date",
    )
    assert.ok(!html.includes('class="graph"'), "Notes should not mount Graph")
    assert.ok(
      !html.match(/class="notes-entry internal"[^>]*href="[^\"]*site-/),
      "Site pages must not appear as articles",
    )
  } else {
    assert.match(html, /site-content-body/)
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
for (const [alias, target] of Object.entries({
  writing: "site-notes",
  lab: "site-lab",
  "lab/deco": "site-deco",
  now: "site-now",
  about: "site-about",
})) {
  assert.ok(
    readFileSync(`public/${alias}.html`, "utf8").includes(target),
    `Missing redirect: ${alias}`,
  )
}
console.log(`Passed: ${checked} local links and five legacy redirects resolve to built output.`)
