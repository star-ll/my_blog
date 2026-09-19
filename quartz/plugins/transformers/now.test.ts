import assert from "node:assert/strict"
import { test } from "node:test"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkFrontmatter from "remark-frontmatter"
import { parseNow } from "./now"

test("Now survives Syncer frontmatter without custom properties", () => {
  const source =
    '---\n{"title":"Now","publish":true,"modified":"2026-09-19"}\n---\n\nIntro excluded.\n\n## Build **Agent**\n\nFirst paragraph.\n\nSecond paragraph.\n\n> 进行中\n\n## Read\n\nLearn architecture.\n\n> 学习与实验'
  const tree = unified().use(remarkParse).use(remarkFrontmatter).parse(source)
  assert.deepEqual(parseNow(tree), [
    {
      title: "Build Agent",
      description: "First paragraph. Second paragraph.",
      status: "进行中",
      active: true,
    },
    { title: "Read", description: "Learn architecture.", status: "学习与实验", active: false },
  ])
})

test("missing entries are empty; higher-level headings end a section", () => {
  const parse = (source: string) => parseNow(unified().use(remarkParse).parse(source))
  assert.deepEqual(parse("Only a paragraph."), [])
  assert.deepEqual(parse("## Build\n\nDescription\n\n# Footer\n\nNot a description"), [
    { title: "Build", description: "Description", status: "进行中", active: true },
  ])
})
