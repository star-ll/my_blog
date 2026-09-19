# YU / LAB publishing

## Notes

Site Markdown uses the visible `site-` prefix in the Obsidian publishing root. Notes lives at `/site-notes`; `/writing` redirects there.
The archive is generated from published Markdown at build time; there is no manually maintained article URL list.
Homepage selections are resolved against Quartz's actual article slugs.

## Now

Maintain `site-now.md` in Obsidian and publish it through Quartz Syncer to `content/site-now.md`.
Obsidian is the source of truth. Keep the five site files in your publishing selection, since your current sync process deletes remote Markdown absent locally.

Use ordinary Markdown in the body: `##` for each item's title, paragraphs for its description, and a blockquote (`>`) for its status. The homepage reads these sections at build time. `进行中` or `In progress` gives the active indicator; other statuses use a neutral indicator. Text before the first item is ignored. Do not append unrelated paragraphs inside an item.

The actual Syncer-published file dropped custom `items` and `updated` properties. Use the preserved `modified` property for the update date instead. Existing frontmatter items remain supported for users whose publishing tools preserve them. Missing content shows “近况整理中。” rather than a blank section.

Notes displays each article's modified date, using Quartz's existing priority: frontmatter, Git history, then filesystem. For meaningful editorial dates, maintain `modified` locally; sync metadata may otherwise reflect the last file edit rather than a substantive article revision.

## Sync boundaries

Remotely Save/WebDAV synchronizes your vault. Quartz Syncer publishes to GitHub; a push to `v4` triggers the repository's deployment workflow.
Before merging the accompanying code change, copy these five files next to your local publishing `index.md`:

| Local file    | Repository destination | Legacy redirect |
| ------------- | ---------------------- | --------------- |
| site-notes.md | content/site-notes.md  | /writing        |
| site-lab.md   | content/site-lab.md    | /lab            |
| site-deco.md  | content/site-deco.md   | /lab/deco       |
| site-now.md   | content/site-now.md    | /now            |
| site-about.md | content/site-about.md  | /about          |

All five carry `publish: true`. Confirm the publishing preview shows these exact destinations, then publish and merge the code PR. If GitHub reports file conflicts because you published first, resolve by keeping the same prefixed files from both sides.
Keep your existing `index.md`: it is still the Home entrypoint, though its Markdown body is not rendered by the custom homepage. Its metadata and extracted links may still affect search and graph data.
Do not create unprefixed duplicates: they would conflict with the alias redirects. Site-prefixed files are excluded from the Notes archive.
Never bulk overwrite the vault with the repository's content folder.

## Checks

Run `npx quartz build`, then `node scripts/check-editorial-links.mjs`.
This validates local anchors on Home, Notes, Lab, Deco and About against build output, plus the five legacy redirects.
