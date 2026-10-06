# IGM+ Wiki Maintenance & Contributor Guide

This wiki is built using **Astro**, **Vue 3**, **TypeScript**, **JSON for structured game data**, and **Markdown for long-form guides**.

The goal of this architecture is **zero-code maintenance**: you can add and update classes, weapons, armors, pets, enemies, traits, and guides solely by editing **JSON** and **Markdown** files without touching Vue components.

---

## 📁 Repository & Directory Layout

```text
igmplus_wiki/
├── public/
│   └── images/              # Pixel-art sprites (PNG files: unit_*.png, item_*.png)
│
├── src/
│   ├── data/                # Structured Game Data (JSON)
│   │   ├── classes.json     # All adventurer classes & promotion paths
│   │   ├── equipment.json   # All weapons, armors, and accessories
│   │   ├── pets.json        # Tamer pets and undead summons
│   │   ├── traits.json      # Adventurer recruitment traits
│   │   ├── skills.json      # Skill reference data (no page; kept for future use)
│   │   ├── enemies.json     # Monster bestiary stats and drops
│   │   └── dungeons.json    # Dungeon encounter pools and loot
│   │
│   ├── content/             # Long-Form Written Content (Markdown)
│   │   ├── mechanics/       # Combat formulas, defense scaling, attack speed
│   │   ├── guides/          # Strategy guides and progression notes
│   │   └── changelog/       # Mod patch notes and version logs
│   │
│   ├── components/          # Reusable Vue UI Presentation Components
│   │   ├── ClassCard.vue
│   │   ├── EquipmentCard.vue
│   │   ├── PetCard.vue
│   │   ├── TraitCard.vue
│   │   ├── EnemyCard.vue
│   │   ├── FilterPanel.vue
│   │   ├── SearchBar.vue
│   │   └── Sidebar.vue
│   │
│   ├── layouts/
│   │   └── WikiLayout.astro # Base layout with persistent sidebar & global search
│   │
│   └── pages/               # Route pages consuming data
│       ├── index.astro      # Wiki Home / Dashboard
│       ├── classes/         # Classes & Promotion trees
│       ├── equipment/       # Equipment catalog with live filtering
│       ├── pets/            # Pets & summons
│       ├── traits/          # Adventurer traits
│       ├── enemies/         # Enemies & Bestiary
│       ├── dungeons/        # Dungeons & Raids
│       └── mechanics/       # Dynamic Markdown mechanics renderer
```

---

## 🛠️ How to Add or Edit Game Content

### 1. How to Add a New Item / Equipment
Open [`src/data/equipment.json`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/data/equipment.json) and add an entry:

```json
{
  "id": "MoonlightGreatsword",
  "name": "Moonlight Greatsword",
  "type": "weapon",
  "category": "Sword",
  "rarity": 4,
  "price": 32000,
  "sprite": "moonlight_greatsword",
  "description": "A radiant lunar blade humming with ancient celestial energy.",
  "stats": {
    "constitution": 40,
    "intelligence": 35,
    "criticalChance": 0.15,
    "magicDefense": 15
  },
  "notes": "Rare Drop"
}
```
* **Sprite**: Place the matching `.png` inside `public/images/` (e.g. `public/images/moonlight_greatsword.png`).
* The item automatically appears in the Equipment catalog, search bar, and rarity filter.

---

### 2. How to Add a New Class
Open [`src/data/classes.json`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/data/classes.json) and add an entry:

```json
{
  "id": "SpiritEngraver",
  "name": "Spirit Engraver",
  "category": "Rogue",
  "tier": 9,
  "maxLevel": 45,
  "weaponType": "dagger",
  "armorType": "medium",
  "sprite": "unit_spirit_engraver",
  "description": "An ethereal artisan carving the lifeforce of doomed spirits into lethal strikes.",
  "stats": {
    "baseMaxHp": 410,
    "baseConstitution": 45,
    "baseIntelligence": 55,
    "baseDexterity": 140,
    "baseDefense": 32,
    "baseMagicDefense": 38
  },
  "activeSkill": "Ethereal Carve",
  "passiveSkill": "Spirit Inscription",
  "promotesFrom": [
    "HellishSculptor"
  ],
  "promotesTo": []
}
```
* **Category**: One of `Footman`, `Apprentice`, `Archer`, `Rogue`, `Outlander`, or `Summon`.
* **Weapon & Armor**: `sword`, `axe`, `bow`, `staff`, `dagger` / `heavy`, `medium`, `light`.
* The class automatically appears in `/classes` under its category tab. Promotion links come from `promotesTo` / `promotesFrom`: a class with no parent becomes a tree root (T1 card); click the arrow on a card to show/hide its promotions. Click a class name to see stats and description.

---

### 3. How to Add a New Pet
Open [`src/data/pets.json`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/data/pets.json) and add an entry:

```json
{
  "id": "FrostDrake",
  "name": "Frost Drake",
  "type": "beast",
  "tier": 5,
  "sprite": "unit_snow_wyvern",
  "description": "A young ice drake born from frozen mountain peaks.",
  "stats": {
    "baseMaxHp": 350,
    "baseConstitution": 35,
    "baseDexterity": 40
  },
  "skills": ["Blizzard Breath", "Frostbite Aura"]
}
```

---

### 4. How to Create a Markdown Mechanics Page
Create a new Markdown file inside [`src/content/mechanics/`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/content/mechanics/) (e.g. `status-effects.md`):

```markdown
---
title: "Status Effects & Crowd Control"
description: "Comprehensive guide to Burn, Poison, Freeze, Stun, and Decay."
category: "Combat Mechanics"
lastUpdated: "2026-10-06"
---

# Status Effects & Crowd Control

In **Idle Guild Master Modded**, status effects deal damage over time or manipulate action turns.

## DoT Effects
* **Burn:** Deals Fire damage each tick based on the attacker's INT.
* **Poison:** Deals Nature damage ignoring a portion of DEF.
* **Decay:** Reduces healing received while dealing continuous damage.
```
* It will automatically be accessible at `/igmplus_wiki/mechanics/status-effects` and formatted with dark-fantasy typography.

---

## 🚀 Running & Building the Wiki Locally

### Run Locally (Development Dev Server with Hot-Reload)
From the `igmplus_wiki/` directory:

```bash
npm run dev
```
Open [http://localhost:4321/igmplus_wiki/](http://localhost:4321/igmplus_wiki/) in your browser.

### Build for Production Deployment (Static HTML Output)
```bash
npm run build
```
The output will be generated into the `dist/` directory ready for GitHub Pages or static web hosting.
