import { pageSeo, pageUrl } from "../util/seo"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { CustomOgImagesEmitterName } from "../plugins/emitters/ogImage"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const seo = pageSeo(cfg, fileData)
    const { title, description } = seo
    const rootUrl = pageUrl(cfg.baseUrl!, "index")
    const person = {
      "@type": "Person",
      "@id": `${rootUrl}#person`,
      name: "余烬 Yujin",
      url: pageUrl(cfg.baseUrl!, "site/about"),
      sameAs: ["https://github.com/star-ll"],
    }
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        person,
        {
          "@type": "WebSite",
          "@id": `${rootUrl}#website`,
          url: rootUrl,
          name: cfg.pageTitle,
          publisher: { "@id": person["@id"] },
        },
        {
          "@type": seo.article
            ? "BlogPosting"
            : fileData.slug === "site/about"
              ? "ProfilePage"
              : "WebPage",
          "@id": `${seo.url}#page`,
          url: seo.url,
          name: seo.name,
          headline: seo.name,
          description,
          inLanguage: fileData.frontmatter?.lang ?? cfg.locale,
          isPartOf: { "@id": `${rootUrl}#website` },
          ...(fileData.slug === "site/about" ? { mainEntity: { "@id": person["@id"] } } : {}),
          ...(seo.article
            ? {
                author: { "@id": person["@id"] },
                mainEntityOfPage: seo.url,
                datePublished: fileData.dates?.created?.toISOString(),
                dateModified: fileData.dates?.modified?.toISOString(),
              }
            : {}),
        },
      ],
    }
    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/brand/yu-mark.png")

    // Url of current page
    const socialUrl = seo.url

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta property="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={seo.article ? "article" : "website"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={seo.socialDescription} />
        <meta property="og:description" content={seo.socialDescription} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath)?.replace(/^\./, "") ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="canonical" href={seo.url} />
        <meta
          property="og:locale"
          content={String(fileData.frontmatter?.lang ?? cfg.locale).replace("-", "_")}
        />
        <meta
          name="robots"
          content={
            fileData.slug === "404" ? "noindex, follow" : "index, follow, max-image-preview:large"
          }
        />
        {fileData.slug !== "404" && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
          />
        )}
        {seo.article && fileData.dates?.created && (
          <meta property="article:published_time" content={fileData.dates.created.toISOString()} />
        )}
        {seo.article && fileData.dates?.modified && (
          <meta property="article:modified_time" content={fileData.dates.modified.toISOString()} />
        )}
        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => {
          // HTML may update before a cached index.css expires on GitHub Pages.
          const versioned =
            !resource.inline && /(?:^|\/)index\.css$/.test(resource.content)
              ? { ...resource, content: `${resource.content}?v=${encodeURIComponent(ctx.buildId)}` }
              : resource
          return CSSResourceToStyleElement(versioned, true)
        })}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
