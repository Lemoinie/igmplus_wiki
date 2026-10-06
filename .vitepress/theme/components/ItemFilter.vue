<script setup>
/**
 * Searchable/filterable item browser for weapons, armors and accessories.
 * Displays items in both Table and Grid card modes with large crisp sprites,
 * rarity styling, stat chips, and instant filtering.
 */
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import itemsData from '../../../data/items.json'
import manifest from '../../../data/sprites_manifest.json'

const props = defineProps({
  category: { type: String, default: 'weapon' },
})

const CATEGORY_MAP = {
  weapon: ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger', 'Weapon'],
  armor: ['LightArmor', 'MediumArmor', 'HeavyArmor', 'Armor'],
  accessory: ['Accessory'],
}
const allowed = CATEGORY_MAP[props.category] || CATEGORY_MAP.weapon

const query = ref('')
const type = ref('all')
const rarity = ref('all')
const sortBy = ref('price')
const viewMode = ref('table') // 'table' | 'grid'

const items = computed(() =>
  itemsData.items.filter((i) => allowed.includes(i.category)),
)
const types = computed(() =>
  [...new Set(items.value.map((i) => i.category))].sort(),
)
const rarities = computed(() =>
  [...new Set(items.value.map((i) => i.rarity ?? 0))].sort((a, b) => a - b),
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let out = items.value.filter((i) => {
    if (type.value !== 'all' && i.category !== type.value) return false
    if (rarity.value !== 'all' && (i.rarity ?? 0) !== Number(rarity.value)) return false
    if (q) {
      const hay = `${i.name} ${i.key} ${i.description || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
  const dir = sortBy.value.endsWith('-desc') ? -1 : 1
  const key = sortBy.value.replace('-desc', '')
  out = [...out].sort((a, b) => {
    if (key === 'name') return dir * a.name.localeCompare(b.name)
    const av = a[key] ?? -1
    const bv = b[key] ?? -1
    return dir * (av - bv)
  })
  return out
})

function spriteFile(name) {
  const entry = manifest.exported[name]
  return entry ? withBase(`/images/${entry.file}`) : null
}

const STAT_NAMES = {
  constitution: 'CON',
  intelligence: 'INT',
  dexterity: 'DEX',
  defense: 'DEF',
  magicDefense: 'MDEF',
  maxHp: 'Max HP',
  criticalChance: 'Crit Chance',
  criticalDamage: 'Crit Damage',
  counterattack: 'Counterattack',
  flatDodgeChance: 'Dodge',
  dodgeChance: 'Dodge',
  immunityToStatus: 'Status Immunity',
  lifesteal: 'Lifesteal',
  threat: 'Threat',
  attackSpeed: 'Attack Speed',
  regeneration: 'Regen',
  bonusExperience: 'Bonus EXP',
  damageDealtModifier: 'Damage Dealt',
  damageTakenModifier: 'Damage Taken',
  normalAttackAmpModifier: 'Normal Atk Amp',
  skillAmpModifier: 'Skill Amp',
  healingModifier: 'Healing Bonus',
}
const PERCENT_FIELDS = new Set([
  'criticalChance',
  'criticalDamage',
  'counterattack',
  'flatDodgeChance',
  'dodgeChance',
  'immunityToStatus',
  'damageDealtModifier',
  'damageTakenModifier',
  'normalAttackAmpModifier',
  'skillAmpModifier',
  'healingModifier',
])

function fmtStats(s) {
  if (!s || Object.keys(s).length === 0) return '—'
  return Object.entries(s)
    .map(([k, v]) => {
      const name = STAT_NAMES[k] || k
      if (PERCENT_FIELDS.has(k) && typeof v === 'number') {
        const pct = Math.abs(v) <= 1.0 ? v * 100 : v
        const sign = pct > 0 ? '+' : ''
        return `${name} ${sign}${Number(pct.toFixed(1))}%`
      }
      if (typeof v === 'number') {
        const sign = v > 0 && k !== 'maxHp' ? '+' : ''
        return `${name} ${sign}${v}`
      }
      return `${name} ${v}`
    })
    .join(' · ')
}

function statChips(s) {
  if (!s || Object.keys(s).length === 0) return []
  return Object.entries(s).map(([k, v]) => {
    const name = STAT_NAMES[k] || k
    let label = ''
    if (PERCENT_FIELDS.has(k) && typeof v === 'number') {
      const pct = Math.abs(v) <= 1.0 ? v * 100 : v
      const sign = pct > 0 ? '+' : ''
      label = `${name} ${sign}${Number(pct.toFixed(1))}%`
    } else if (typeof v === 'number') {
      const sign = v > 0 && k !== 'maxHp' ? '+' : ''
      label = `${name} ${sign}${v}`
    } else {
      label = `${name} ${v}`
    }
    return label
  })
}
</script>

<template>
  <div class="itemFilter">
    <div class="ifControls">
      <div class="ifSearchWrap">
        <input v-model="query" type="search" placeholder="Search name or stats…" />
      </div>

      <div class="ifSelectWrap">
        <select v-model="type">
          <option value="all">All types</option>
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="rarity">
          <option value="all">All rarities</option>
          <option v-for="r in rarities" :key="r" :value="String(r)">Rarity {{ r }}</option>
        </select>
        <select v-model="sortBy">
          <option value="price">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="name">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </div>

      <div class="ifViewToggle">
        <button
          type="button"
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
          title="Table View"
        >
          ☰ Table
        </button>
        <button
          type="button"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          title="Grid / Card View"
        >
          ⊞ Grid
        </button>
      </div>

      <span class="ifCount">{{ filtered.length }} items</span>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="ifScroll">
      <table>
        <thead>
          <tr>
            <th class="col-sprite">Sprite</th>
            <th>Name & Details</th>
            <th>Type</th>
            <th>Rarity</th>
            <th>Price</th>
            <th>Equipment Stats</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in filtered" :key="i.key">
            <td class="ifSpriteCell">
              <div class="ifSpriteBox" :class="'border-rarity-' + (i.rarity ?? 0)">
                <img
                  v-if="i.sprite && spriteFile(i.sprite)"
                  class="sprite"
                  :src="spriteFile(i.sprite)"
                  :alt="i.name"
                  width="56"
                  height="56"
                />
              </div>
            </td>
            <td>
              <strong class="ifName" :class="'rarity-color-' + (i.rarity ?? 0)">{{ i.name }}</strong>
              <div v-if="i.description" class="ifDesc">{{ i.description }}</div>
              <div v-if="i.flags?.isRareDrop" class="ifTag ifTagRare">Rare Drop</div>
            </td>
            <td><span class="ifTypeBadge">{{ i.category }}</span></td>
            <td><span class="ifRarityBadge" :class="'rarity-' + (i.rarity ?? 0)">★ {{ i.rarity ?? 0 }}</span></td>
            <td><span class="ifPrice">🪙 {{ i.price ?? '—' }}</span></td>
            <td class="ifStats">{{ fmtStats(i.stats) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Grid / Cards View -->
    <div v-else class="ifGrid">
      <div
        v-for="i in filtered"
        :key="i.key"
        class="ifCard"
        :class="'border-rarity-' + (i.rarity ?? 0)"
      >
        <div class="ifCardTop">
          <div class="ifCardSpriteBox" :class="'border-rarity-' + (i.rarity ?? 0)">
            <img
              v-if="i.sprite && spriteFile(i.sprite)"
              class="sprite"
              :src="spriteFile(i.sprite)"
              :alt="i.name"
              width="60"
              height="60"
            />
          </div>
          <div class="ifCardHeader">
            <div class="ifCardTitle" :class="'rarity-color-' + (i.rarity ?? 0)">{{ i.name }}</div>
            <div class="ifCardBadges">
              <span class="ifTypeBadge">{{ i.category }}</span>
              <span class="ifRarityBadge" :class="'rarity-' + (i.rarity ?? 0)">★ {{ i.rarity ?? 0 }}</span>
              <span class="ifPrice">🪙 {{ i.price ?? '—' }}</span>
            </div>
          </div>
        </div>

        <div v-if="i.description" class="ifCardDesc">{{ i.description }}</div>

        <div v-if="statChips(i.stats).length" class="ifCardChips">
          <span v-for="chip in statChips(i.stats)" :key="chip" class="ifChip">
            {{ chip }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.itemFilter {
  margin: 20px 0;
}

.ifControls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.ifSearchWrap {
  flex: 1 1 200px;
}

.ifSearchWrap input[type='search'] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.ifSelectWrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ifSelectWrap select {
  padding: 7px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 13px;
}

.ifViewToggle {
  display: flex;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.ifViewToggle button {
  padding: 6px 12px;
  border: 0;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ifViewToggle button.active {
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
}

.ifCount {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-left: auto;
}

/* ================= Table View ================= */
.ifScroll {
  max-height: 620px;
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.ifScroll table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.ifScroll th,
.ifScroll td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
  vertical-align: middle;
}

.ifScroll thead th {
  position: sticky;
  top: 0;
  background: var(--vp-c-bg-alt);
  z-index: 2;
  font-weight: 600;
  font-size: 13px;
}

.col-sprite {
  width: 76px;
}

.ifSpriteCell {
  width: 76px;
  padding: 8px 10px !important;
}

.ifSpriteBox {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.22);
  border-radius: 8px;
  border: 2px solid var(--vp-c-divider);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
}

.ifName {
  font-size: 15px;
  display: block;
}

.ifDesc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 2px;
}

.ifTag {
  display: inline-block;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  margin-top: 4px;
}

.ifTagRare {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.ifTypeBadge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
}

.ifRarityBadge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.ifPrice {
  font-weight: 600;
  color: #f59e0b;
  white-space: nowrap;
}

.ifStats {
  font-size: 13px;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

/* ================= Grid / Cards View ================= */
.ifGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.ifCard {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.ifCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.ifCardTop {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ifCardSpriteBox {
  width: 68px;
  height: 68px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  border: 2px solid var(--vp-c-divider);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
}

.ifCardHeader {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ifCardTitle {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ifCardBadges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.ifCardDesc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.35;
  font-style: italic;
}

.ifCardChips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.ifChip {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

/* ================= Rarity Colors & Borders ================= */
.rarity-0 { color: var(--vp-c-text-2); background: rgba(128, 128, 128, 0.12); }
.rarity-1 { color: #4ade80; background: rgba(74, 222, 128, 0.12); }
.rarity-2 { color: #60a5fa; background: rgba(96, 165, 250, 0.12); }
.rarity-3 { color: #c084fc; background: rgba(192, 132, 252, 0.12); }
.rarity-4 { color: #f59e0b; background: rgba(245, 158, 11, 0.12); }
.rarity-5 { color: #ef4444; background: rgba(239, 68, 68, 0.12); }

.rarity-color-0 { color: var(--vp-c-text-1); }
.rarity-color-1 { color: #4ade80; }
.rarity-color-2 { color: #60a5fa; }
.rarity-color-3 { color: #c084fc; }
.rarity-color-4 { color: #f59e0b; }
.rarity-color-5 { color: #ef4444; }

.border-rarity-0 { border-color: rgba(128, 128, 128, 0.3) !important; }
.border-rarity-1 { border-color: rgba(74, 222, 128, 0.45) !important; }
.border-rarity-2 { border-color: rgba(96, 165, 250, 0.45) !important; }
.border-rarity-3 { border-color: rgba(192, 132, 252, 0.45) !important; }
.border-rarity-4 { border-color: rgba(245, 158, 11, 0.5) !important; }
.border-rarity-5 { border-color: rgba(239, 68, 68, 0.5) !important; }

.sprite {
  image-rendering: pixelated;
}
</style>
