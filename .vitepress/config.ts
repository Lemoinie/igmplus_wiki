import { defineConfig } from 'vitepress'

/**
 * GitHub Pages project site: https://<user>.github.io/igmplus_wiki/
 * Override with WIKI_BASE when deploying to a custom domain or another root.
 */
const base = process.env.WIKI_BASE ?? '/igmplus_wiki/'

export default defineConfig({
  title: 'IGM+ Wiki',
  description:
    'Auto-generated mod wiki for Idle Guild Master Modded — classes, items, dungeons, mechanics and changelog.',
  base,
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  // dark-first wiki, users can still toggle
  appearance: 'dark',
  head: [['meta', { name: 'robots', content: 'index, follow' }]],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Adventurers', link: '/adventurers/class-tree' },
      { text: 'Items', link: '/items/weapons' },
      { text: 'Dungeons & Raids', link: '/dungeons/dungeons' },
      { text: 'Enemies', link: '/enemies/bestiary' },
      { text: 'Mechanics', link: '/mechanics/defense-and-armor' },
      { text: 'Changelog', link: '/changelog' },
    ],

    sidebar: [
      {
        text: 'Adventurers',
        collapsed: false,
        items: [
          { text: 'Class Tree', link: '/adventurers/class-tree' },
          { text: 'Stats Comparison', link: '/adventurers/stats-comparison' },
          { text: 'Doctrines', link: '/adventurers/doctrines' },
          { text: 'Traits', link: '/adventurers/traits' },
        ],
      },
      {
        text: 'Items & Equipment',
        collapsed: false,
        items: [
          { text: 'Weapons', link: '/items/weapons' },
          { text: 'Armors', link: '/items/armors' },
          { text: 'Accessories', link: '/items/accessories' },
          { text: 'Crafting Recipes', link: '/items/recipes' },
        ],
      },
      {
        text: 'Dungeons & Raids',
        collapsed: false,
        items: [
          { text: 'Dungeons', link: '/dungeons/dungeons' },
          { text: 'Raids', link: '/dungeons/raids' },
        ],
      },
      {
        text: 'Enemies',
        collapsed: false,
        items: [{ text: 'Bestiary', link: '/enemies/bestiary' }],
      },
      {
        text: 'Game Mechanics',
        collapsed: false,
        items: [
          { text: 'Defense & Armor', link: '/mechanics/defense-and-armor' },
          { text: 'Attack Speed', link: '/mechanics/attack-speed' },
          { text: 'Damage Amplification', link: '/mechanics/damage-amplification' },
          { text: 'Status Effects', link: '/mechanics/status-effects' },
        ],
      },
      {
        text: 'Updates',
        collapsed: true,
        items: [{ text: 'Mod Changelog', link: '/changelog' }],
      },
    ],

    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'On this page' },
    lastUpdated: { text: 'Updated' },
    docFooter: { prev: 'Previous', next: 'Next' },
    footer: {
      message: 'Idle Guild Master Modded (IGM+) Community Wiki',
      copyright: 'Community-maintained game database',
    },
  },
})
