# YU / LAB publishing

## Notes

The navigation label is Notes; the existing URL remains `/writing`.
The archive is generated from published Markdown at build time; there is no manually maintained article URL list.
Homepage selections are resolved against Quartz's actual article slugs.

## Now

Edit `content/now.md` in GitHub, or maintain the corresponding `now.md` in Obsidian and publish through Quartz Syncer.
Do not maintain two independent copies. Before publishing from Obsidian, copy the latest remote file into the correct local publishing path.

Edit `updated` (a quoted YYYY-MM-DD date) and the `items` list in source mode. Each item has `title`, `description`, `status`, and `active` (boolean). The homepage reads these fields when rebuilt. Deleting all items leaves the section empty; deleting the file does not break the build.

## Sync boundaries

Remotely Save/WebDAV synchronizes your vault. Quartz Syncer publishes to GitHub; a push to `v4` triggers the repository's deployment workflow.
The supplied screenshot establishes branch `v4` and vault root `/`, but does not establish destination mapping, publish selection, or deletion behaviour. Verify those settings before bulk publishing.
Ensure remote-only landing files (`index.md`, `writing.md`, `lab.md`, `lab/deco.md`, `now.md`) are preserved or deliberately imported into the vault. Never bulk overwrite the vault with the repository's content folder.

## Checks

Run `npx quartz build`, then `node scripts/check-editorial-links.mjs`.
This validates every rendered local anchor on Home and Notes against build output, including percent-encoded paths and fragments.
