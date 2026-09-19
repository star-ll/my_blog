# YU / LAB publishing

## Notes

Site Markdown uses the visible `site-` prefix in the Obsidian publishing root. Notes lives at `/site-notes`; `/writing` redirects there.
The archive is generated from published Markdown at build time; there is no manually maintained article URL list.
Homepage selections are resolved against Quartz's actual article slugs.

## Now

Maintain `site-now.md` in Obsidian and publish it through Quartz Syncer to `content/site-now.md`.
Obsidian is the source of truth. Keep the five site files in your publishing selection, since your current sync process deletes remote Markdown absent locally.

Edit `updated` (a quoted YYYY-MM-DD date) and the `items` list in source mode. Each item has `title`, `description`, `status`, and `active` (boolean). The homepage reads these fields when rebuilt. Deleting all items leaves the section empty; deleting the file does not break the build.

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
