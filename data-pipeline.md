# Data Pipeline

This wiki is generated from the game's source tree — no hand-copied stats.

```text
Kotlin sources + strings.xml + drawables
        │
        ▼  scripts/igmplus_wiki/extract_game_data.py
igmplus_wiki/data/*.json          (units, items, recipes, places, …)
        │
        ├─▶ scripts/igmplus_wiki/export_sprites.py  ─▶ public/images/*.png
        │
        ▼  scripts/igmplus_wiki/generate_pages.py
markdown pages (tables, bestiary, changelog, …)
        │
        ▼  vitepress build
static site published to GitHub Pages
```

## Commands

From the `igmplus_wiki/` directory (Node.js LTS + Python 3 required):

```bash
npm run extract     # Kotlin → JSON
npm run generate    # JSON → markdown pages
npm run sprites     # copy referenced drawables to public/images
npm run update-wiki # all three in order
npm run dev         # local preview with hot reload
npm run build       # production build to .vitepress/dist
```

## What is generated vs. hand-written

| Generated (don't edit) | Hand-written |
| --- | --- |
| Stats comparison, doctrines, traits | Mechanics guides |
| Weapons / armors / accessories / recipes | Class tree guide |
| Bestiary, changelog, dungeon tables | This page, landing page |

Hand-written pages that contain generated sections keep them between
`<!-- BEGIN GENERATED DATA -->` markers — only that block is replaced.

Full script reference:
[`docs/scripts.md`](https://github.com/Lemoinie/IGM-Modded/blob/main/docs/scripts.md)
in the IGM-Modded repository.
