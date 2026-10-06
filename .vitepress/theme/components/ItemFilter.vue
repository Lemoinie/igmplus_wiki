<script setup>
/**
 * Searchable/filterable item grid for the weapons, armors and accessories
 * pages. Reads the extracted items.json directly; the `category` prop picks
 * which item classes are shown.
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
</script>

<template>
  <div class="itemFilter">
    <div class="ifControls">
      <input v-model="query" type="search" placeholder="Search name or text…" />
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
      <span class="ifCount">{{ filtered.length }} items</span>
    </div>

    <div class="ifScroll">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Type</th>
            <th>Rarity</th>
            <th>Price</th>
            <th>Stats</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in filtered" :key="i.key">
            <td>
              <img
                v-if="i.sprite && spriteFile(i.sprite)"
                class="sprite"
                :src="spriteFile(i.sprite)"
                alt=""
                width="24"
                height="24"
              />
            </td>
            <td>
              <strong>{{ i.name }}</strong>
              <div v-if="i.description" class="ifDesc">{{ i.description }}</div>
            </td>
            <td>{{ i.category }}</td>
            <td>{{ i.rarity ?? 0 }}</td>
            <td>{{ i.price ?? '—' }}</td>
            <td class="ifStats">{{ fmtStats(i.stats) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.itemFilter {
  margin: 16px 0;
}
.ifControls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}
.ifControls input[type='search'] {
  flex: 1 1 220px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}
.ifControls select {
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}
.ifCount {
  font-size: 13px;
  color: var(--vp-c-text-3);
}
.ifScroll {
  max-height: 560px;
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.ifScroll table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.ifScroll th,
.ifScroll td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
  vertical-align: top;
}
.ifScroll thead th {
  position: sticky;
  top: 0;
  background: var(--vp-c-bg-alt);
  z-index: 1;
}
.ifDesc {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.ifStats {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.sprite {
  image-rendering: pixelated;
}
</style>
