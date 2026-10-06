<script setup>
/**
 * Interactive promotion tree built from the extracted promotion graph.
 * Flattens a DFS over next_classes into indented rows; clicking a row shows
 * its base stats, skills and promotions in the detail panel.
 */
import { computed, ref } from 'vue'
import data from '../../../data/units_adventurers.json'
import manifest from '../../../data/sprites_manifest.json'

const units = data.units.filter((u) => !u.missing)
const byKey = Object.fromEntries(units.map((u) => [u.key, u]))

const targeted = new Set()
for (const u of units) for (const c of u.next_classes || []) targeted.add(c)
const roots = units
  .filter((u) => !targeted.has(u.key))
  .sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99) || a.key.localeCompare(b.key))

const rows = []
function walk(key, depth) {
  const u = byKey[key]
  if (!u) return
  rows.push({ u, depth })
  for (const c of u.next_classes || []) walk(c, depth + 1)
}
for (const r of roots) walk(r.key, 0)

const selected = ref(null)
function pick(u) {
  selected.value = selected.value && selected.value.key === u.key ? null : u
}

function spriteFile(name) {
  const entry = manifest.exported[name]
  return entry ? `/images/${entry.file}` : null
}
const statOrder = [
  ['baseMaxHp', 'HP'],
  ['baseConstitution', 'CON'],
  ['baseIntelligence', 'INT'],
  ['baseDexterity', 'DEX'],
  ['baseDefense', 'DEF'],
  ['baseMagicDefense', 'MDEF'],
]
function statsOf(u) {
  return statOrder
    .filter(([k]) => u.stats && u.stats[k] !== undefined)
    .map(([k, label]) => `${label} ${u.stats[k]}`)
}
</script>

<template>
  <div class="clTree">
    <div class="clTreeList">
      <button
        v-for="row in rows"
        :key="row.u.key"
        class="clNode"
        :class="{ isActive: selected && selected.key === row.u.key }"
        :style="{ marginLeft: row.depth * 22 + 'px' }"
        type="button"
        @click="pick(row.u)"
      >
        <img
          v-if="row.u.sprite && spriteFile(row.u.sprite)"
          class="sprite"
          :src="spriteFile(row.u.sprite)"
          alt=""
          width="22"
          height="22"
        />
        <span>{{ row.u.name }}</span>
        <span class="tier">T{{ row.u.tier ?? '?' }}</span>
      </button>
    </div>

    <div v-if="selected" class="clDetail">
      <h4>
        <img
          v-if="selected.sprite && spriteFile(selected.sprite)"
          :src="spriteFile(selected.sprite)"
          alt=""
          width="32"
          height="32"
          class="sprite"
        />
        {{ selected.name }}
        <span class="tier">Tier {{ selected.tier ?? '?' }}</span>
      </h4>
      <p v-if="selected.description">{{ selected.description }}</p>
      <p class="clStats">{{ statsOf(selected).join(' · ') || 'No base stats' }}</p>
      <p v-if="selected.weapon_type"><strong>Weapon:</strong> {{ selected.weapon_type.replace('type_', '') }}</p>
      <p v-if="selected.armor_type"><strong>Armor:</strong> {{ selected.armor_type.replace('type_', '') }}</p>
      <p v-if="selected.active_skill"><strong>Active:</strong> {{ selected.active_skill }}</p>
      <p v-if="selected.passive_skill"><strong>Passive:</strong> {{ selected.passive_skill }}</p>
      <p v-if="selected.next_classes && selected.next_classes.length">
        <strong>Promotes to:</strong> {{ selected.next_classes.join(', ') }}
      </p>
      <p v-if="selected.max_level"><strong>Level cap:</strong> {{ selected.max_level }}</p>
    </div>
  </div>
</template>

<style scoped>
.clTree {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
}
.clTreeList {
  max-height: 480px;
  overflow-y: auto;
}
.clNode {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% - 4px);
  padding: 4px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}
.clNode:hover {
  background: var(--vp-c-bg-soft);
}
.clNode.isActive {
  background: var(--vp-c-brand-soft);
}
.clNode .tier {
  margin-left: auto;
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.clDetail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--vp-c-divider);
  font-size: 14px;
}
.clDetail h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
}
.clDetail .tier {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.clStats {
  color: var(--vp-c-text-2);
}
.sprite {
  image-rendering: pixelated;
}
</style>
