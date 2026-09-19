document.addEventListener("nav", () => {
  const page = document.querySelector<HTMLElement>(".article-page")
  if (!page) return
  const progress = page.querySelector<HTMLElement>(".article-progress span")
  const prose = page.querySelector<HTMLElement>(".article-prose")
  const links = Array.from(page.querySelectorAll<HTMLAnchorElement>("[data-article-heading]"))
  const sections = links.flatMap((link) => {
    const heading = document.getElementById(link.dataset.articleHeading!)
    return heading ? [{ link, heading }] : []
  })
  let frame = 0
  const update = () => {
    frame = 0
    const top = prose ? prose.getBoundingClientRect().top + window.scrollY : 0
    const height = prose?.offsetHeight ?? 0
    const value = Math.max(
      0,
      Math.min(1, (window.scrollY + window.innerHeight - top) / Math.max(1, height)),
    )
    if (progress) progress.style.transform = `scaleX(${value})`
    let active = sections[0]
    for (const section of sections)
      if (section.heading.getBoundingClientRect().top <= 140) active = section
    for (const section of sections) {
      if (section === active) section.link.setAttribute("aria-current", "location")
      else section.link.removeAttribute("aria-current")
    }
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  const details = page.querySelector<HTMLDetailsElement>(".article-toc")
  const media = window.matchMedia("(max-width: 800px)")
  const adapt = () => {
    if (details) details.open = !media.matches
  }
  adapt()
  update()
  media.addEventListener("change", adapt)
  window.addEventListener("scroll", schedule, { passive: true })
  window.addEventListener("resize", schedule)
  window.addCleanup(() => {
    cancelAnimationFrame(frame)
    media.removeEventListener("change", adapt)
    window.removeEventListener("scroll", schedule)
    window.removeEventListener("resize", schedule)
  })
})
