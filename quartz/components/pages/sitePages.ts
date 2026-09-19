// Site content has a visible prefix in Obsidian and stays out of the article archive.
export const sitePages = {
  home: "index",
  notes: "site-notes",
  lab: "site-lab",
  deco: "site-deco",
  now: "site-now",
  about: "site-about",
} as const

export const isSitePage = (slug?: string) => Object.values(sitePages).some((page) => page === slug)
