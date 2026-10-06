# igmplus_wiki

Auto-generated mod wiki for **Idle Guild Master Modded**, built with
[VitePress](https://vitepress.dev/) and deployed to GitHub Pages by
`.github/workflows/deploy-wiki.yml`.

- Game data (classes, items, recipes, dungeons, bestiary, changelog) is
  extracted from the [Lemoinie/IGM-Modded](https://github.com/Lemoinie/IGM-Modded)
  Kotlin sources — never edit the generated tables by hand.
- Local update: run the npm scripts below from this directory (Python 3 for the
  pipeline, Node.js LTS for the site).

```bash
npm install           # once
npm run update-wiki   # extract → generate → sprites
npm run dev           # local preview
npm run build         # static build to .vitepress/dist
```

Pipeline scripts live in IGM-Modded at `scripts/igmplus_wiki/` and are
documented in [`docs/scripts.md`](https://github.com/Lemoinie/IGM-Modded/blob/main/docs/scripts.md).
