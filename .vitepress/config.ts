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
      { text: 'Mechanics', link: '/mechanics/defense-and-armor' },
      { text: 'Adventurers', link: '/adventurers/class-tree' },
      { text: 'Items', link: '/items/weapons' },
      { text: 'Dungeons', link: '/dungeons/dungeons' },
      { text: 'Enemies', link: '/enemies/bestiary' },
      { text: 'Changelog', link: '/changelog' },
    ],

    sidebar: {
      '/mechanics/': [
        {
          text: 'Mechanics',
          items: [
            { text: 'Defense & Armor', link: '/mechanics/defense-and-armor' },
            { text: 'Attack Speed', link: '/mechanics/attack-speed' },
            { text: 'Damage Amplification', link: '/mechanics/damage-amplification' },
            { text: 'Status Effects', link: '/mechanics/status-effects' },
          ],
        },
      ],
      '/adventurers/': [
        {
          text: 'Adventurers',
          items: [
            { text: 'Class Tree', link: '/adventurers/class-tree' },
            { text: 'Stats Comparison', link: '/adventurers/stats-comparison' },
            { text: 'Doctrines', link: '/adventurers/doctrines' },
            { text: 'Traits', link: '/adventurers/traits' },
          ],
        },
      ],
      '/items/': [
        {
          text: 'Items',
          items: [
            { text: 'Weapons', link: '/items/weapons' },
            { text: 'Armors', link: '/items/armors' },
            { text: 'Accessories', link: '/items/accessories' },
            { text: 'Recipes', link: '/items/recipes' },
          ],
        },
      ],
      '/dungeons/': [
        {
          text: 'Dungeons & Raids',
          items: [
            { text: 'Dungeons', link: '/dungeons/dungeons' },
            { text: 'Raids', link: '/dungeons/raids' },
          ],
        },
      ],
      '/enemies/': [
        {
          text: 'Enemies',
          items: [{ text: 'Bestiary', link: '/enemies/bestiary' }],
        },
      ],
      '/': [
        {
          text: 'Reference',
          items: [
            { text: 'Changelog', link: '/changelog' },
            { text: 'Data Pipeline', link: '/data-pipeline' },
          ],
        },
      ],
    },

    search: { provider: 'local' },
    socialLinks: [
      { icon: 'github', href: 'https://github.com/Lemoinie/igmplus_wiki' },
      { icon: 'github', href: 'https://github.com/Lemoinie/IGM-Modded' },
    ],
    outline: { level: [2, 3], label: 'On this page' },
    editLink: {
      pattern: 'https://github.com/Lemoinie/igmplus_wiki/edit/main/:path',
      text: 'Edit this page',
    },
    lastUpdated: { text: 'Updated' },
    docFooter: { prev: 'Previous', next: 'Next' },
    footer: {
      message: 'Data extracted automatically from the IGM-Modded repository.',
      copyright: 'MIT License',
    },
  },
})
