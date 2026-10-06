---
layout: home

hero:
  name: IGM+ Wiki
  text: Idle Guild Master Modded
  tagline: Auto-generated database and mechanics guides for the IGM-Modded balance overhaul
  actions:
    - theme: brand
      text: Class Tree
      link: /adventurers/class-tree
    - theme: alt
      text: Mechanics
      link: /mechanics/defense-and-armor

features:
  - title: Full class database
    details: Every adventurer class from T1 to T9 with base stats, promotion paths, skills and traits — computed directly from the game's Kotlin sources.
    link: /adventurers/stats-comparison
    linkText: Browse classes
  - title: Items, recipes & shops
    details: Searchable catalogs of weapons, armors and accessories with stats, prices and crafting recipes.
    link: /items/weapons
    linkText: Browse items
  - title: Dungeons, raids & bestiary
    details: Encounter tables with per-enemy probabilities, boss drop tables and loot references for every area.
    link: /enemies/bestiary
    linkText: Open bestiary
  - title: Mechanics deep dives
    details: Hyperbolic defense mitigation, attack speed extra strikes, amplification stacking and status effects — with interactive calculators.
    link: /mechanics/defense-and-armor
    linkText: Read mechanics
---

## About this wiki

Everything in the **data pages** (classes, items, dungeons, bestiary, changelog) is
extracted automatically from the [IGM-Modded](https://github.com/Lemoinie/IGM-Modded)
source tree by Python scripts — no manual entries, no stale tables after a balance
patch. Guides in **Mechanics** are hand-written deep dives.

See the [data pipeline](./data-pipeline) page for how updates flow from Kotlin
sources to this site.
