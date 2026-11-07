# IGM+ Wiki Maintenance & Contributor Guide

This wiki is built using **Astro**, **Vue 3**, **TypeScript**, **JSON for structured game data**, and **Markdown for long-form guides**.

The goal of this architecture is **zero-code maintenance**: you can add and update classes, weapons, armors, pets, enemies, status effects, locations, traits, and guides solely by editing **JSON** and **Markdown** files without touching Vue components.

---

## 📁 Repository & Directory Layout

```text
igmplus_wiki/
├── public/
│   └── images/              # Pixel-art sprites (PNG files: unit_*.png, item_*.png, icon_effect_*.png)
│
├── scripts/
│   └── validate.mjs         # Fast data integrity & reference checker (npm run validate)
│
├── src/
│   ├── data/                # Modular Game Data (JSON files)
│   │   ├── adventurers/     # Adventurer classes, summons, skills, traits
│   │   │   ├── units/       # Base & advanced classes (WyrmRider.json, etc.)
│   │   │   ├── summons/     # Minions & summons (Skeleton.json, etc.)
│   │   │   ├── skills/      # Active & passive skill definitions
│   │   │   └── traits/      # Class traits
│   │   ├── items/           # Weapons, armors, accessories, materials
│   │   ├── pets/            # Guild pets & egg types
│   │   ├── enemies/         # Monster bestiary stats, drops, and skills
│   │   ├── places/          # Locations
│   │   │   ├── dungeons/    # Regular dungeons (TheSunkenCitadel.json, etc.)
│   │   │   ├── raids/       # Multi-room raids & epic raids (TheSlimePond.json, etc.)
│   │   │   └── guildactivities/ # Guild activities (TheSlumberingShallowsArea.json, etc.)
│   │   ├── doctrines.json   # Temple doctrines & progression trees
│   │   ├── doctrine_abilities.json # Doctrine ability nodes
│   │   └── status_effects.json # Centralized status effects catalog
│   │
│   ├── content/             # Long-Form Written Content (Markdown)
│   │   ├── mechanics/       # Combat formulas, defense scaling, attack speed
│   │   └── notices/         # Patch notes and announcements
│   │
│   ├── components/          # Reusable Vue UI Presentation Components
│   │   ├── LocationBrowser.vue
│   │   ├── ClassBrowser.vue
│   │   ├── EquipmentBrowser.vue
│   │   ├── PetTable.vue
│   │   ├── EnemyCard.vue
│   │   ├── EnemyBrowser.vue
│   │   ├── EffectBrowser.vue
│   │   ├── TraitBrowser.vue
│   │   ├── DoctrineBrowser.vue
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
│       ├── dungeons/        # Locations, Monster encounters & loot
│       ├── effects/         # Status effects & combat conditions
│       ├── doctrines/       # Temple doctrines & loyalty trees
│       ├── notices/         # Official patch notes & developer notes
│       └── mechanics/       # Dynamic Markdown mechanics renderer
```

---

## ⚡ Useful Commands for Contributors

```bash
npm run dev        # Launch local preview server with instant hot-reload
npm run validate   # Check for broken item IDs, missing skills, or stat typos
npm run build      # Build static site bundle to test compilation
```

---

## 🛠️ How to Add or Edit Game Content

The wiki stores all data as individual, modular JSON files for ease of editing without dealing with massive monolithic files:

### 1. How to Add a New Item / Equipment
Create a new file in `src/data/items/<Id>.json` (e.g. `src/data/items/MoonlightGreatsword.json`):

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

### 2. How to Add a New Class or Summon
- **Adventurer Classes**: Create a new file in `src/data/adventurers/units/<Id>.json` (e.g. `src/data/adventurers/units/SpiritEngraver.json`).
- **Summons**: Create a new file in `src/data/adventurers/summons/<Id>.json`.

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
* The class automatically appears in `/classes` under its category tab. Promotion links come from `promotesTo` / `promotesFrom`.

---

### 3. How to Add a New Pet
Create a new file in `src/data/pets/units/<Id>.json` (e.g. `src/data/pets/units/FrostDrake.json`):

```json
{
  "id": "FrostDrake",
  "name": "Frost Drake",
  "family": "Wild",
  "eggSprite": "egg_wild",
  "abilitySlots": 3,
  "sprite": "unit_snow_wyvern",
  "description": "A young ice drake born from frozen mountain peaks.",
  "guaranteedAbilities": ["Bloodthirsty", "Savage"]
}
```

---

### 4. How to Add a New Enemy / Bestiary Monster
Create a new file in `src/data/enemies/<Id>.json` (e.g. `src/data/enemies/TigerShark.json`):

```json
{
  "id": "TigerShark",
  "name": "Tiger Shark",
  "type": "Beast",
  "isBoss": false,
  "sprite": "tiger_shark",
  "stats": {
    "hp": 1650,
    "constitution": 52,
    "intelligence": 10,
    "dexterity": 155,
    "defense": 18,
    "magicDefense": 12
  },
  "damage": {
    "min": "430",
    "max": "510"
  },
  "expGiven": 230,
  "drops": [
    {
      "item": "SharkTeeth",
      "qty": 1,
      "chance": 35
    },
    {
      "item": "SharkFin",
      "qty": 1,
      "chance": 25
    }
  ],
  "isMagic": false,
  "isRanged": false,
  "attackType": "Melee, Physical",
  "activeSkill": "ACTIVE_NONE",
  "passiveSkill": "PASSIVE_PELAGIC_FRENZY"
}
```

* **ID**: Must match the JSON filename without `.json` and the Android enemy instance key (e.g. `TigerShark`).
* **Type**: Creature family (`Beast`, `Aberration`, `Humanoid`, `Undead`, `Dragon`, `Elemental`, etc.).
* **isBoss**: `true` for dungeon and raid bosses (displays a gold Boss badge and highlighted row in encounter tables), `false` for standard mobs.
* **Sprite**: Pixel-art PNG file placed in `public/images/<sprite>.png` (e.g. `public/images/tiger_shark.png`).
* **Drops**: Array of dropped items. Each `item` ID must match an item defined in `src/data/items/`. The wiki automatically resolves the item's sprite, display name, and links to its equipment page.
* **Skills**: Active and passive skill keys (e.g. `ACTIVE_NONE`, `PASSIVE_PELAGIC_FRENZY`). If registered in `src/data/adventurers/skills/`, the skill's name and description automatically display in tooltips and tables.
* **Auto-Location Linking**: When this enemy is included in any location's `"enemies"` array under `src/data/places/`, the Bestiary (`/enemies`) automatically displays location chips linking the enemy directly to that dungeon, raid, or guild activity.

---

### 5. How to Add a New Status Effect
Status effects are maintained in the centralized catalog [`src/data/status_effects.json`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/data/status_effects.json). Add a new object entry to the array:

```json
{
  "id": "confuse",
  "name": "Confuse",
  "category": "debuff",
  "isMod": true,
  "icon": "icon_effect_confuse",
  "description": "50% chance each turn to attack a random ally instead of an enemy. Replaces standard action.",
  "logText": "confused",
  "duration": "3 turns",
  "cleansable": true,
  "sources": [
    "Tide-Cursed Oracle (Psychic Wave)",
    "Abyssal Scepter"
  ]
}
```

* **id**: Unique lowercase identifier (e.g. `confuse`, `blind`, `bloodflame`, `corrosion`).
* **name**: In-game display name (e.g. `Confuse`, `Bloodflame`).
* **category**: `"buff"` or `"debuff"`.
* **isMod**: `true` if added by the Plus mod, `false` for vanilla effects.
* **icon**: Effect icon placed in `public/images/<icon>.png` (e.g. `public/images/icon_effect_confuse.png`).
* **description**: Detailed mechanics, damage formulas, stat multipliers, and turn behaviors.
* **logText**: In-game combat log phrase (e.g. `"confused"`, `"burning with bloodflame"`).
* **duration**: Standard duration string (e.g. `"3 turns"`, `"1–5 turns"`, `"Permanent"`).
* **cleansable**: `true` if removable by Cleanse / Purify abilities, `false` if non-cleansable.
* **sources**: Array of text strings citing which classes, abilities, monsters, items, or environmental hazards apply this effect.
* **Automatic Display**: The effect automatically appears on the `/effects` browser with full search indexing, category filtering, and direct anchor links (`/effects#confuse`).

---

### 6. How to Add a New Location (Dungeons, Raids, Guild Activities)
Create a new file in the appropriate subfolder under `src/data/places/`:
- **Normal Dungeons**: `src/data/places/dungeons/<Id>.json` (e.g. `TheSunkenCitadel.json`)
- **Raids & Epic Raids**: `src/data/places/raids/<Id>.json` (e.g. `TheSlimePond.json`, `DivineArcheology.json`)
- **Guild Activities**: `src/data/places/guildactivities/<Id>.json` (e.g. `TheSlumberingShallowsArea.json`, `GuildRequestArea.json`)

```json
{
  "id": "TheSunkenCitadel",
  "name": "The Sunken Citadel",
  "type": "dungeon",
  "level": null,
  "encounterChance": 65,
  "sprite": "summary_sunken_citadel",
  "enemies": [
    {
      "id": "TigerShark",
      "name": "Tiger Shark",
      "rate": "16.25%",
      "role": "Regular"
    },
    {
      "id": "CrimsonReefGoliath",
      "name": "Crimson Reef Goliath",
      "rate": "16.25%",
      "role": "Regular"
    },
    {
      "id": "LeviathanHatchling",
      "name": "Leviathan Hatchling",
      "rate": "2.5%",
      "role": "Boss"
    }
  ],
  "loot": [
    "Coral",
    "AbyssalPearl",
    "SunkenDoubloon"
  ]
}
```

* **type**: Must be one of `"dungeon"`, `"raid"`, `"epic_raid"`, or `"guildactivity"`.
* **encounterChance**: Room encounter percentage.
* **sprite**: Banner sprite placed in `public/images/<sprite>.png` (e.g. `public/images/summary_sunken_citadel.png`).
* **CRITICAL - Monster Table Order**: The order of entries in the `"enemies"` array directly controls the top-to-bottom sequence in the **Monster Encounters** table on `/dungeons`. Place bosses or desired showcase monsters exactly where you want them in the list.
* **loot**: Array of item IDs that drop in this location. The wiki automatically resolves the item's sprite and display name.
* **Canonical Dropdown Ordering**:
  Register the location in `LOCATION_FRAGMENT_ORDER` inside [`src/lib/data.ts`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/lib/data.ts) matching the Android layout XMLs:
  - **Dungeons (1–99)**: Matches `fragment_dungeons.xml`. Dropdown automatically prepends `D1. `, `D2. `, etc.
  - **Raids (101–199)**: Matches `fragment_raids.xml`. Dropdown automatically prepends `R1. `, `R2. `, etc., and appends ` [E]` if `type: "epic_raid"`.
  - **Guild Activities (201–299)**: Matches `fragment_guild_activities.xml`.

---

### 7. How to Create a Markdown Mechanics Page
Create a new Markdown file inside [`src/content/mechanics/`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/content/mechanics/) (e.g. `status-effects.md`):

```markdown
---
title: "Status Effects & Crowd Control"
description: "Comprehensive guide to Burn, Poison, Freeze, Stun, and Decay."
category: "Combat Mechanics"
lastUpdated: "2026-10-06"
---

# Status Effects & Crowd Control

In **Idle Guild Master Plus**, status effects deal damage over time or manipulate action turns.

## DoT Effects
* **Burn:** Deals Fire damage each tick based on the attacker's INT.
* **Poison:** Deals Nature damage ignoring a portion of DEF.
* **Decay:** Reduces healing received while dealing continuous damage.
```
* It will automatically be accessible at `/igmplus_wiki/mechanics/status-effects` and formatted with dark-fantasy typography.

---

### 8. How to Publish a Notice / Patch Notes (Discord Bypass)
Create a new Markdown file inside [`src/content/notices/`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/content/notices/) (e.g. `v1-3-21-0-patch-notes.md`):

```markdown
---
title: "Update v1.3.21.0: Major Combat Balance & New Items"
date: "2026-10-25"
category: "Updates" # "Updates" | "Developer Notes" | "Notice" | "Maintenance"
version: "v1.3.21.0"
author: "IGM+ Dev Team"
pinned: false
coverImage: "/images/area_the_siege.png"
description: "Comprehensive patch notes including new brawler light armors, bleed formula updates, and bug fixes."
tags: ["Classes", "Combat", "Items"]
---

Write your full announcement here with **zero character limits**:
- Add hundreds of lines of text and design rationale.
- Add formatted Markdown comparison tables.
- Add pixel-art sprites using `<img src="/images/unit_outlander.png" class="sprite" width="32" height="32" />` or markdown images `![Preview](/images/area_kaunis.png)`.
- Add links to items `[Scarlet Sigil](/items#scarlet-sigil)` or classes `[Outlander](/classes/outlander)`.
```

* **Instant Hub Listing**: The notice automatically appears on `/notices` with category filtering, search indexing, and chronological ordering.
* **Discord Integration**: Every notice includes full OpenGraph metadata (`og:title`, `og:description`, `og:image`). When you paste the link into Discord, Discord displays a rich embed card with the banner image, title, and summary. You can also click the **Copy Discord Link** button on the notice page to copy the URL to your clipboard.

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

---

## 🚦 Maintenance Mode (Soft & Full Toggle)

You can toggle maintenance mode anytime via [`src/data/maintenance.json`](file:///c:/Repositories/IGM-Modded/igmplus_wiki/src/data/maintenance.json) or with an environment variable (`PUBLIC_MAINTENANCE_MODE` or `MAINTENANCE_MODE`).

```json
{
  "mode": "off",
  "softMessage": "The wiki is currently undergoing updates and bug fixes. Some stats or formulas may be temporarily inaccurate.",
  "fullTitle": "Under Maintenance",
  "fullMessage": "The IGM+ Wiki is temporarily offline while we fix bugs and update game data.",
  "fullSubtext": "We are working to get everything back up as quickly as possible. Check back soon!",
  "estimatedTime": "",
  "discordUrl": "https://discord.gg/idleguildmaster",
  "githubUrl": "https://github.com/Lemoinie/IGM-Plus"
}
```

### Modes Available:
| Mode | Behavior |
| :--- | :--- |
| `"off"` | Normal live site. No maintenance banners or screens. |
| `"soft"` | **Soft Maintenance:** Displays a dismissible top warning banner across all pages, but users can still browse normally. |
| `"full"` | **Full Lockout:** Completely replaces all wiki content with an animated "Under Maintenance" screen. Sidebars, search bar, and internal pages are hidden and blocked. |

### How to Toggle:
1. **Via Git:** Change `"mode": "soft"` or `"mode": "full"` in `src/data/maintenance.json` and push to `main`.
2. **Via Vercel (Instant without committing):** Set `PUBLIC_MAINTENANCE_MODE=full` (or `soft`/`off`) in Vercel Project Settings → Environment Variables and trigger a redeploy.
