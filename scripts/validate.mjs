/**
 * IGM+ Wiki Data Integrity Validator
 *
 * Fast verification tool for human contributors.
 * Checks for:
 *  - Broken sprite references (missing image files in public/images/)
 *  - Unknown stat keys or typos
 *  - Broken cross-references (missing items in drops/loot, missing skills, missing promotion targets)
 *
 * Usage:
 *   npm run validate
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wikiRoot = path.resolve(__dirname, '..');
const srcData = path.join(wikiRoot, 'src', 'data');
const publicImages = path.join(wikiRoot, 'public', 'images');

const errors = [];
const warnings = [];

function error(file, msg) {
  errors.push(`[ERROR] ${path.relative(wikiRoot, file)}: ${msg}`);
}

function warn(file, msg) {
  warnings.push(`[WARN]  ${path.relative(wikiRoot, file)}: ${msg}`);
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    error(filePath, `Failed to parse JSON: ${err.message}`);
    return null;
  }
}

function checkSprite(filePath, spriteName) {
  if (!spriteName) return;
  const imgPath = path.join(publicImages, `${spriteName}.png`);
  if (!fs.existsSync(imgPath)) {
    warn(filePath, `Sprite "${spriteName}.png" not found in public/images/`);
  }
}

// Collect existing sets
const existingItems = new Set();
const existingSkills = new Set();
const existingClasses = new Set();
const existingEnemies = new Set();

// 1. Gather all Items
function gatherItems(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      gatherItems(full);
    } else if (entry.name.endsWith('.json')) {
      const data = readJson(full);
      if (data?.id) existingItems.add(data.id);
    }
  }
}
gatherItems(path.join(srcData, 'items'));

// Also gather items/materials from data/items.json if available
const dataItemsFile = path.join(wikiRoot, 'data', 'items.json');
if (fs.existsSync(dataItemsFile)) {
  const dItems = readJson(dataItemsFile);
  if (Array.isArray(dItems?.items)) {
    for (const item of dItems.items) {
      if (item.key) existingItems.add(item.key);
    }
  }
}

// 2. Gather all Skills
const skillsDir = path.join(srcData, 'adventurers', 'skills');
if (fs.existsSync(skillsDir)) {
  for (const f of fs.readdirSync(skillsDir)) {
    if (f.endsWith('.json')) {
      const data = readJson(path.join(skillsDir, f));
      if (data?.key) existingSkills.add(data.key);
      existingSkills.add(f.replace('.json', ''));
    }
  }
}

// 3. Gather all Classes (units + summons)
for (const sub of ['units', 'summons']) {
  const cDir = path.join(srcData, 'adventurers', sub);
  if (fs.existsSync(cDir)) {
    for (const f of fs.readdirSync(cDir)) {
      if (f.endsWith('.json')) {
        const data = readJson(path.join(cDir, f));
        if (data?.id) existingClasses.add(data.id);
      }
    }
  }
}

// 4. Gather all Enemies
const enemiesDir = path.join(srcData, 'enemies');
if (fs.existsSync(enemiesDir)) {
  for (const f of fs.readdirSync(enemiesDir)) {
    if (f.endsWith('.json')) {
      const data = readJson(path.join(enemiesDir, f));
      if (data?.id) existingEnemies.add(data.id);
    }
  }
}

console.log(`\n🔍 Validating IGM+ Wiki Data Integrity...`);
console.log(`   Found ${existingClasses.size} Classes, ${existingItems.size} Items, ${existingSkills.size} Skills, ${existingEnemies.size} Enemies\n`);

// 5. Validate Adventurers & Summons
const VALID_CLASS_STATS = new Set([
  'maxLevel', 'baseMaxHp', 'baseConstitution', 'baseIntelligence',
  'baseDexterity', 'baseDefense', 'baseMagicDefense', 'baseLifesteal',
  'attackSpeed', 'counterattack', 'criticalDamage', 'criticalChance',
  'regeneration', 'flatDodgeChance', 'immunityToStatus', 'healingModifier',
  'retaliationPhysicalDamage', 'retaliationMagicalDamage', 'darknessDamageAmplification'
]);

for (const sub of ['units', 'summons']) {
  const cDir = path.join(srcData, 'adventurers', sub);
  if (!fs.existsSync(cDir)) continue;
  for (const f of fs.readdirSync(cDir)) {
    if (!f.endsWith('.json')) continue;
    const p = path.join(cDir, f);
    const d = readJson(p);
    if (!d) continue;

    if (!d.id) error(p, `Missing required "id" field`);
    if (!d.name) error(p, `Missing required "name" field`);
    if (d.sprite) checkSprite(p, d.sprite);

    // Validate stat names
    if (d.stats && typeof d.stats === 'object') {
      for (const k of Object.keys(d.stats)) {
        if (!VALID_CLASS_STATS.has(k)) {
          warn(p, `Unknown or uncommon stat key "${k}" in stats object`);
        }
      }
    }

    // Check promotion targets
    if (Array.isArray(d.promotesTo)) {
      for (const target of d.promotesTo) {
        if (!existingClasses.has(target)) {
          error(p, `promotesTo target "${target}" does not exist in adventurer classes`);
        }
      }
    }
  }
}

// 6. Validate Enemies
const VALID_ENEMY_STATS = new Set([
  'hp', 'constitution', 'intelligence', 'dexterity', 'defense', 'magicDefense'
]);

if (fs.existsSync(enemiesDir)) {
  for (const f of fs.readdirSync(enemiesDir)) {
    if (!f.endsWith('.json')) continue;
    const p = path.join(enemiesDir, f);
    const d = readJson(p);
    if (!d) continue;

    if (!d.id) error(p, `Missing required "id" field`);
    if (!d.name) error(p, `Missing required "name" field`);
    if (d.sprite) checkSprite(p, d.sprite);

    // Validate enemy stats
    if (d.stats && typeof d.stats === 'object') {
      for (const k of Object.keys(d.stats)) {
        if (!VALID_ENEMY_STATS.has(k)) {
          warn(p, `Unknown enemy stat key "${k}"`);
        }
      }
    }

    // Validate drops
    if (Array.isArray(d.drops)) {
      for (const drop of d.drops) {
        if (!drop.item) {
          error(p, `Drop entry is missing "item" ID`);
        } else if (!existingItems.has(drop.item)) {
          warn(p, `Drop item "${drop.item}" not found in items catalog`);
        }
        if (typeof drop.chance !== 'number') {
          warn(p, `Drop chance for "${drop.item}" should be a number (got ${typeof drop.chance})`);
        }
      }
    }

    // Validate skills
    if (d.activeSkill && d.activeSkill !== 'ACTIVE_NONE' && !existingSkills.has(d.activeSkill)) {
      warn(p, `activeSkill "${d.activeSkill}" not found in skills catalog`);
    }
    if (d.passiveSkill && d.passiveSkill !== 'PASSIVE_NONE' && !existingSkills.has(d.passiveSkill)) {
      warn(p, `passiveSkill "${d.passiveSkill}" not found in skills catalog`);
    }
  }
}

// 7. Validate Locations
const placesDir = path.join(srcData, 'places');
let placeCount = 0;
function validatePlaces(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      validatePlaces(full);
    } else if (entry.name.endsWith('.json')) {
      placeCount++;
      const d = readJson(full);
      if (!d) continue;

      if (!d.id) error(full, `Missing "id" field`);
      if (!d.name) error(full, `Missing "name" field`);
      if (d.sprite) checkSprite(full, d.sprite);

      // Check monsters
      if (Array.isArray(d.enemies)) {
        for (const m of d.enemies) {
          const eid = typeof m === 'string' ? m : m.id || m.name;
          if (eid && !existingEnemies.has(eid)) {
            error(full, `Enemy "${eid}" in encounters does not exist in src/data/enemies/`);
          }
        }
      }

      // Check loot
      if (Array.isArray(d.loot)) {
        for (const item of d.loot) {
          if (!existingItems.has(item)) {
            warn(full, `Loot item "${item}" not found in items catalog`);
          }
        }
      }
    }
  }
}
validatePlaces(placesDir);

// 8. Validate Pets
const petsDir = path.join(srcData, 'pets', 'units');
let petCount = 0;
if (fs.existsSync(petsDir)) {
  for (const f of fs.readdirSync(petsDir)) {
    if (!f.endsWith('.json')) continue;
    petCount++;
    const p = path.join(petsDir, f);
    const d = readJson(p);
    if (!d) continue;
    if (!d.id) error(p, `Missing "id" field`);
    if (!d.name) error(p, `Missing "name" field`);
    if (d.sprite) checkSprite(p, d.sprite);
    if (d.eggSprite) checkSprite(p, d.eggSprite);
  }
}

// Summary Report
console.log(`───────────────────────────────────────────`);
console.log(`✓ Checked ${existingClasses.size} Classes & Summons`);
console.log(`✓ Checked ${existingEnemies.size} Enemy Units`);
console.log(`✓ Checked ${existingItems.size} Equipment & Items`);
console.log(`✓ Checked ${petCount} Pets`);
console.log(`✓ Checked ${placeCount} Locations`);
console.log(`───────────────────────────────────────────`);

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} Warnings:`);
  for (const w of warnings.slice(0, 15)) console.log(`   ${w}`);
  if (warnings.length > 15) {
    console.log(`   ...and ${warnings.length - 15} more warnings`);
  }
}

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} Critical Errors found:`);
  for (const e of errors) console.log(`   ${e}`);
  console.log(`\nFix the errors above to maintain wiki integrity.\n`);
  process.exit(1);
} else {
  console.log(`\n✨ All wiki data is valid! 0 critical errors.\n`);
  process.exit(0);
}
