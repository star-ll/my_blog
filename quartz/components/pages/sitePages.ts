// Obsidian site pages live together; index remains the Quartz home entry.
export const sitePages = {
  home: "index",
  notes: "site/notes",
  lab: "site/lab",
  deco: "site/lab/deco",
  now: "site/now",
  about: "site/about",
} as const

export const isSitePage = (slug?: string) => Object.values(sitePages).some((page) => page === slug)
