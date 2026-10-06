<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ClassDefinition } from '../types';
import ClassCard from './ClassCard.vue';

const props = defineProps<{
  classes: ClassDefinition[];
  basePath?: string;
}>();

const categories = ['Footman', 'Apprentice', 'Archer', 'Rogue', 'Outlander', 'Summon'] as const;
const activeCategory = ref<string>('Footman');
const searchQuery = ref('');

const categoryIcons: Record<string, string> = {
  Footman: 'unit_footman',
  Apprentice: 'unit_apprentice',
  Archer: 'unit_archer',
  Rogue: 'unit_rogue',
  Outlander: 'unit_outlander',
  Summon: 'unit_skeleton',
};

const collapsedTiers = ref(new Set<number>());

function toggleTier(tierNum: number) {
  if (collapsedTiers.value.has(tierNum)) {
    collapsedTiers.value.delete(tierNum);
  } else {
    collapsedTiers.value.add(tierNum);
  }
}

function expandAll() {
  collapsedTiers.value.clear();
}

function collapseAll() {
  if (activeGroupedTiers.value) {
    for (const g of activeGroupedTiers.value) {
      collapsedTiers.value.add(g.tier);
    }
  }
}

const activeGroupedTiers = computed(() => {
  const cat = activeCategory.value;
  const q = searchQuery.value.trim().toLowerCase();

  const tierMap = new Map<number, ClassDefinition[]>();

  for (const c of props.classes) {
    if (c.category !== cat) continue;

    if (q) {
      const match =
        c.name.toLowerCase().includes(q) ||
        c.weaponType.toLowerCase().includes(q) ||
        c.armorType.toLowerCase().includes(q) ||
        (c.activeSkill && c.activeSkill.toLowerCase().includes(q)) ||
        (c.passiveSkill && c.passiveSkill.toLowerCase().includes(q));
      if (!match) continue;
    }

    const t = c.tier || 1;
    if (!tierMap.has(t)) tierMap.set(t, []);
    tierMap.get(t)!.push(c);
  }

  const sortedTiers = [...tierMap.keys()].sort((a, b) => a - b);
  return sortedTiers.map((tier) => ({
    tier,
    units: tierMap.get(tier)!.sort((a, b) => a.name.localeCompare(b.name)),
  }));
});

function getCatCount(cat: string): number {
  return props.classes.filter((c) => c.category === cat).length;
}
</script>

<template>
  <div class="classBrowser">
    <!-- Category Tabs -->
    <div class="categoryTabs">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="catBtn"
        :class="{ active: activeCategory === cat }"
        @click="activeCategory = cat; searchQuery = ''"
      >
        <div class="catIconBox">
          <img
            :src="`${basePath || '/igmplus_wiki'}/images/${categoryIcons[cat]}.png`"
            :alt="cat"
            class="sprite"
            width="32"
            height="32"
          />
        </div>
        <span class="catLabel">{{ cat }}</span>
        <span class="catCount">{{ getCatCount(cat) }}</span>
      </button>
    </div>

    <!-- Controls -->
    <div class="controlsBar">
      <input
        v-model="searchQuery"
        type="search"
        :placeholder="`Search ${activeCategory} classes or skills…`"
        class="searchInput"
      />

      <div class="actions">
        <button type="button" class="actionBtn" @click="expandAll">
          ▼ Expand All
        </button>
        <button type="button" class="actionBtn" @click="collapseAll">
          ▶ Collapse All
        </button>
      </div>
    </div>

    <!-- Tiers List -->
    <div v-if="activeGroupedTiers.length" class="tiersContainer">
      <div v-for="g in activeGroupedTiers" :key="g.tier" class="tierBlock">
        <!-- Tier Header -->
        <button
          type="button"
          class="tierHeader"
          @click="toggleTier(g.tier)"
        >
          <span class="chevron">{{ collapsedTiers.has(g.tier) ? '▶' : '▼' }}</span>
          <span class="tierTitle">Tier {{ g.tier }}</span>
          <span class="countBadge">{{ g.units.length }} {{ g.units.length === 1 ? 'Class' : 'Classes' }}</span>
          <span class="hint">{{ collapsedTiers.has(g.tier) ? 'Click to show' : '' }}</span>
        </button>

        <!-- Tier Grid -->
        <div v-show="!collapsedTiers.has(g.tier)" class="cardsGrid">
          <ClassCard
            v-for="u in g.units"
            :key="u.id"
            :class-data="u"
            :base-path="basePath"
          />
        </div>
      </div>
    </div>

    <div v-else class="emptyNotice">
      No classes found matching "{{ searchQuery }}" in {{ activeCategory }}.
    </div>
  </div>
</template>

<style scoped>
.classBrowser {
  margin-top: 1rem;
}

.categoryTabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 1rem;
}

.catBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.catBtn:hover {
  background: var(--bg-card-hover);
  border-color: var(--brand-primary);
  transform: translateY(-2px);
}

.catBtn.active {
  background: rgba(110, 168, 254, 0.15);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.catIconBox {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border-radius: 6px;
}

.catLabel {
  font-size: 0.95rem;
  font-weight: 700;
}

.catCount {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  background: var(--bg-inset);
  color: var(--text-muted);
}

.catBtn.active .catCount {
  background: var(--brand-primary);
  color: #fff;
}

.controlsBar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1.5rem;
  align-items: center;
}

.searchInput {
  flex: 1 1 240px;
  padding: 8px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.searchInput:focus {
  border-color: var(--brand-primary);
  outline: none;
}

.actions {
  display: flex;
  gap: 8px;
}

.actionBtn {
  padding: 7px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.actionBtn:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.tiersContainer {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tierBlock {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.tierHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.tierHeader:hover {
  border-color: var(--brand-primary);
}

.chevron {
  color: var(--brand-primary);
  font-size: 0.85rem;
}

.tierTitle {
  font-size: 1.05rem;
  font-weight: 700;
}

.countBadge {
  font-size: 0.75rem;
  padding: 2px 7px;
  border-radius: 10px;
  background: rgba(110, 168, 254, 0.15);
  color: var(--brand-primary);
}

.hint {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.cardsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1rem;
}

.emptyNotice {
  padding: 2.5rem;
  text-align: center;
  background: var(--bg-card);
  border-radius: 8px;
  color: var(--text-muted);
}
</style>
