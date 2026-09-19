# Design QA — YU / LAB Homepage

## Evidence

- Source visual truth: `/workspace/scratch/894f51c523d3/generated_images/exec-307498ff-2119-4aa1-a50f-5339b2b8e7f0.png`
- Source pixels: `1024 × 1536`
- Browser-rendered implementation, top: `/workspace/scratch/yu-lab-home-top-light-final.jpg`
- Browser-rendered implementation, lower content: `/workspace/scratch/yu-lab-home-lower-final.jpg`
- Implementation pixels: `1348 × 926` (top) and `1363 × 936` (lower)
- CSS viewport: `1363 × 936`, desktop, device density unchanged
- Normalized comparison: `/workspace/scratch/yu-lab-design-comparison.png`
- Normalization: source top was cropped to `1024 × 700`; source and implementation were each scaled to approximately `674 × 462` and placed side by side.
- Route/state: `/`, light theme, signed-out public state

## Full-view comparison

The implementation preserves the source hierarchy and proportions: compact masthead, large identity-led hero, narrow editorial aside, full-width divider, Deco as the dominant featured lab, an architecture/repository panel, selected writing, a Now rail, and the closing philosophy statement. The final layout has the same restrained off-white surface, near-black type, blue accent, thin rules, square geometry, and whitespace-led section separation.

The implementation intentionally uses real Quartz typography and functional controls rather than rasterizing the concept. Copy was adjusted only where needed to avoid invented claims while preserving the same visual density.

## Focused-region comparison

- Hero and masthead: compared in `yu-lab-design-comparison.png`. Heading scale, two-column balance, topic rail, navigation density, and section transition match the source closely.
- Featured Deco area: compared in the same composite and the browser top capture. Project title, metadata chips, two actions, and the repository structure panel retain the source hierarchy.
- Writing / Now / Philosophy: checked in `yu-lab-home-lower-final.jpg`. Rows use light separators without card fills; the Now rail and philosophy block maintain the intended editorial rhythm.

## Required fidelity surfaces

- Fonts and typography: Schibsted Grotesk, Source Sans Pro, and IBM Plex Mono are reused from the existing Quartz theme. Display weights, mono labels, line lengths, hierarchy, and wrapping are consistent with the visual target.
- Spacing and layout rhythm: desktop outer margins, hero proportions, section gaps, dividers, and two-column tracks closely follow the source. Responsive rules collapse the major grids and retain Writing and Lab navigation on mobile.
- Colors and visual tokens: warm off-white Quartz surface, near-black foreground, muted gray metadata, and `#1268e8` accent match the concept. Dark mode remains functional.
- Image quality and asset fidelity: the selected concept contains no raster hero or decorative image assets. Existing Quartz search and theme icons are reused; no placeholder imagery or CSS illustration substitutes were introduced.
- Copy and content: Deco capabilities and repository facts are grounded in the public project. Selected writing links resolve to existing content. Current work is clearly marked as in progress or research.

## Interaction and runtime checks

- Search opens and closes with Escape.
- Theme control toggles between light and dark.
- Writing navigation resolves to `/writing` and renders its page.
- Lab and Deco case-study routes render successfully.
- Homepage contains no Graph component after conditional layout isolation.
- Homepage app-origin console: no warnings or errors. The browser extension emitted an unrelated metadata error.
- TypeScript check passed.
- Quartz production build passed and emitted 90 files from 23 content files.

## Comparison history

### Pass 1

- P2: Quartz's global `.internal` link style added gray card fills to Selected Writing, conflicting with the source's open editorial rows.
- P2: hidden default Graph markup still initialized on the homepage and produced a CanvasRenderer error.

Fixes:

- Added a homepage-specific transparent background override to writing rows.
- Wrapped default content-page header, sidebar, Graph, TOC, and backlink components in `ConditionalRender` so the homepage does not mount them.

### Pass 2

- Writing rows render as open white rows with thin dividers.
- Homepage Graph count is zero.
- Search, theme, Writing, Lab, and Deco interactions pass.
- No remaining actionable P0, P1, or P2 mismatch was found.

## Follow-up polish

- P3: visually recheck the narrowest phone breakpoint on a physical device after deployment; the responsive CSS is implemented, but the available cloud browser had a fixed desktop viewport.

## Final result

final result: passed
