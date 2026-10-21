<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TraitDefinition } from '../types';
import TraitCard from './TraitCard.vue';

const props = defineProps<{
  traits: TraitDefinition[];
  basePath?: string;
}>();

const activeTab = ref<'all' | 'basic' | 'rare'>('basic');
const viewMode = ref<'pairs' | 'grid'>('pairs');
const searchQuery = ref('');

// Sort alphabetically helper
const sortByName = (a: TraitDefinition, b: TraitDefinition) => a.name.localeCompare(b.name);

// Map traits by key
const traitByKey = computed(() => {
  const map = new Map<string, TraitDefinition>();
  for (const t of props.traits) {
    if (t.key) map.set(t.key, t);
  }
  return map;
});

// Basic traits: base traits that have an upgrade
const basicPairs = computed(() => {
  return props.traits
    .filter((t) => t.category === 'basic' && !t.plus)
    .sort(sortByName)
    .map((baseTrait) => ({
      base: baseTrait,
      upgrade: baseTrait.upgrades_to ? traitByKey.value.get(baseTrait.upgrades_to) : null,
    }));
});

// Rare traits: upgradable base traits
const rareUpgradablePairs = computed(() => {
  return props.traits
    .filter((t) => t.category === 'rare' && !t.plus && t.upgrades_to)
    .sort(sortByName)
    .map((baseTrait) => ({
      base: baseTrait,
      upgrade: baseTrait.upgrades_to ? traitByKey.value.get(baseTrait.upgrades_to) : null,
    }));
});

// Rare traits: standard traits without upgrades
const rareStandard = computed(() => {
  return props.traits
    .filter((t) => t.category === 'rare' && !t.plus && !t.upgrades_to)
    .sort(sortByName);
});

// Filtered traits for Grid View or Search
const filteredTraits = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  let list = props.traits;

  if (activeTab.value === 'basic') {
    list = list.filter((t) => t.category === 'basic');
  } else if (activeTab.value === 'rare') {
    list = list.filter((t) => t.category === 'rare');
  }

  if (q) {
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.upgrade_name && t.upgrade_name.toLowerCase().includes(q)) ||
        (t.base_name && t.base_name.toLowerCase().includes(q))
    );
  }

  return [...list].sort(sortByName);
});

// Filtered pairs for Pairs View
const filteredBasicPairs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return basicPairs.value;
  return basicPairs.value.filter(
    (p) =>
      p.base.name.toLowerCase().includes(q) ||
      p.base.description?.toLowerCase().includes(q) ||
      (p.upgrade && p.upgrade.name.toLowerCase().includes(q)) ||
      (p.upgrade && p.upgrade.description?.toLowerCase().includes(q))
  );
});

const filteredRarePairs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return rareUpgradablePairs.value;
  return rareUpgradablePairs.value.filter(
    (p) =>
      p.base.name.toLowerCase().includes(q) ||
      p.base.description?.toLowerCase().includes(q) ||
      (p.upgrade && p.upgrade.name.toLowerCase().includes(q)) ||
      (p.upgrade && p.upgrade.description?.toLowerCase().includes(q))
  );
});

const filteredRareStandard = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return rareStandard.value;
  return rareStandard.value.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
  );
});

const countBasic = computed(() => props.traits.filter((t) => t.category === 'basic').length);
const countRare = computed(() => props.traits.filter((t) => t.category === 'rare').length);
</script>

<template>
  <div class="traitBrowser">
    <!-- Summary Header Cards -->
    <div class="summaryRow">
      <div class="summaryCard">
        <span class="summaryLabel">Basic Traits</span>
        <span class="summaryVal emerald">7 Base + 7 Upgrades</span>
        <span class="summarySub">Evo-22</span>
      </div>
      <div class="summaryCard">
        <span class="summaryLabel">Upgradable Rare</span>
        <span class="summaryVal purple">7 Base + 7 Upgrades</span>
        <span class="summarySub">Evo-24</span>
      </div>
      <div class="summaryCard">
        <span class="summaryLabel">Standard Rare</span>
        <span class="summaryVal blue">12 Traits</span>
        <span class="summarySub">Unique Standalone Effects</span>
      </div>
      <div class="summaryCard">
        <span class="summaryLabel">Total Traits</span>
        <span class="summaryVal gold">40 Total</span>
        <span class="summarySub">In Plus Version</span>
      </div>
    </div>

    <!-- Navigation & Controls -->
    <div class="controlsBar">
      <div class="categoryTabs">
        <button
          type="button"
          class="tabBtn"
          :class="{ active: activeTab === 'basic' }"
          @click="activeTab = 'basic'"
        >
          <span class="tabDot emeraldDot"></span>
          Basic Traits & Upgrades
          <span class="tabBadge">{{ countBasic }}</span>
        </button>
        <button
          type="button"
          class="tabBtn"
          :class="{ active: activeTab === 'rare' }"
          @click="activeTab = 'rare'"
        >
          <span class="tabDot purpleDot"></span>
          Rare Traits & Upgrades
          <span class="tabBadge">{{ countRare }}</span>
        </button>
        <button
          type="button"
          class="tabBtn"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          <span class="tabDot goldDot"></span>
          All Traits
          <span class="tabBadge">{{ traits.length }}</span>
        </button>
      </div>

      <div class="rightControls">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search traits or effects…"
          class="searchInput"
        />

        <div class="viewToggle">
          <button
            type="button"
            class="viewBtn"
            :class="{ active: viewMode === 'pairs' }"
            title="Show Base → Upgrade pairs side-by-side"
            @click="viewMode = 'pairs'"
          >
            Pairs View
          </button>
          <button
            type="button"
            class="viewBtn"
            :class="{ active: viewMode === 'grid' }"
            title="Show flat grid"
            @click="viewMode = 'grid'"
          >
            Grid View
          </button>
        </div>
      </div>
    </div>

    <!-- PAIRS VIEW -->
    <div v-if="viewMode === 'pairs'" class="pairsContainer">
      <!-- BASIC TRAITS SECTION -->
      <section v-if="activeTab === 'basic' || activeTab === 'all'" class="traitSection">
        <div class="sectionHeader emeraldHeader">
          <div class="sectionTitleWrap">
            <h2>Basic (Common) Traits & Upgrades</h2>
            <p class="sectionDesc">
              Common physical attributes rolled upon recruit. Each basic trait can be upgraded into its enhanced (+) variant.
            </p>
          </div>
          <span class="sectionCount">{{ filteredBasicPairs.length }} Pairs</span>
        </div>

        <div class="pairGrid">
          <div v-for="pair in filteredBasicPairs" :key="pair.base.key" class="pairCard">
            <div class="pairColumn">
              <span class="colLabel">Base Trait</span>
              <TraitCard :trait="pair.base" :base-path="basePath" />
            </div>

            <div class="upgradeArrow">
              <span class="arrowIcon">➔</span>
              <span class="upgradeTag">Evo-22 Vial</span>
            </div>

            <div class="pairColumn">
              <span class="colLabel">Upgraded Form</span>
              <TraitCard v-if="pair.upgrade" :trait="pair.upgrade" :base-path="basePath" />
              <div v-else class="noUpgradeNotice">No upgrade</div>
            </div>
          </div>
        </div>

        <div v-if="!filteredBasicPairs.length" class="emptyNotice">
          No basic traits found matching "{{ searchQuery }}".
        </div>
      </section>

      <!-- RARE TRAITS SECTION -->
      <section v-if="activeTab === 'rare' || activeTab === 'all'" class="traitSection">
        <div class="sectionHeader purpleHeader">
          <div class="sectionTitleWrap">
            <h2>Rare Traits with Upgrades</h2>
            <p class="sectionDesc">
              Rare personality & magical affinities. These 7 base rare traits can be permanently upgraded to their Plus (+) variants via Evo-24 Phylactery.
            </p>
          </div>
          <span class="sectionCount">{{ filteredRarePairs.length }} Pairs</span>
        </div>

        <div class="pairGrid">
          <div v-for="pair in filteredRarePairs" :key="pair.base.key" class="pairCard">
            <div class="pairColumn">
              <span class="colLabel">Base Rare Trait</span>
              <TraitCard :trait="pair.base" :base-path="basePath" />
            </div>

            <div class="upgradeArrow purpleArrow">
              <span class="arrowIcon">➔</span>
              <span class="upgradeTag">Evo-24 Vial</span>
            </div>

            <div class="pairColumn">
              <span class="colLabel">Upgraded Form</span>
              <TraitCard v-if="pair.upgrade" :trait="pair.upgrade" :base-path="basePath" />
              <div v-else class="noUpgradeNotice">No upgrade</div>
            </div>
          </div>
        </div>

        <!-- STANDARD RARE TRAITS (WITHOUT UPGRADES) -->
        <div class="subSectionHeader">
          <div class="sectionTitleWrap">
            <h3>Standard Rare Traits</h3>
            <p class="sectionDesc">
              Rare traits with unique mechanics that do not have an upgraded Plus variant.
            </p>
          </div>
          <span class="sectionCount">{{ filteredRareStandard.length }} Traits</span>
        </div>

        <div class="standardGrid">
          <TraitCard
            v-for="t in filteredRareStandard"
            :key="t.key"
            :trait="t"
            :base-path="basePath"
          />
        </div>

        <div v-if="!filteredRarePairs.length && !filteredRareStandard.length" class="emptyNotice">
          No rare traits found matching "{{ searchQuery }}".
        </div>
      </section>
    </div>

    <!-- GRID VIEW -->
    <div v-else class="gridContainer">
      <div class="traitsGrid">
        <TraitCard
          v-for="t in filteredTraits"
          :key="t.key"
          :trait="t"
          :base-path="basePath"
        />
      </div>

      <div v-if="!filteredTraits.length" class="emptyNotice">
        No traits found matching "{{ searchQuery }}".
      </div>
    </div>
  </div>
</template>

<style scoped>
.traitBrowser {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

/* Summary Row */
.summaryRow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.summaryCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summaryLabel {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summaryVal {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
}

.summarySub {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.emerald { color: #34d399; }
.purple { color: #c084fc; }
.blue { color: #60a5fa; }
.gold { color: #f59e0b; }

/* Controls Bar */
.controlsBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.categoryTabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tabBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tabBtn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.tabBtn.active {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--brand-primary);
  box-shadow: 0 0 12px var(--brand-glow);
}

.tabDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.emeraldDot { background: #34d399; }
.purpleDot { background: #c084fc; }
.goldDot { background: #f59e0b; }

.tabBadge {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--bg-inset);
  color: var(--text-muted);
}

.rightControls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.searchInput {
  padding: 7px 12px;
  background: var(--bg-inset);
  border: 1px solid var(--border-card);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  min-width: 220px;
}

.searchInput:focus {
  outline: none;
  border-color: var(--border-focus);
}

.viewToggle {
  display: flex;
  background: var(--bg-inset);
  border: 1px solid var(--border-card);
  border-radius: 6px;
  padding: 2px;
}

.viewBtn {
  padding: 5px 10px;
  font-size: 0.78rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.viewBtn:hover {
  color: var(--text-primary);
}

.viewBtn.active {
  background: var(--bg-card-hover);
  color: var(--brand-primary);
  font-weight: 600;
}

/* Sections */
.pairsContainer {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.traitSection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.emeraldHeader {
  background: rgba(16, 185, 129, 0.08);
  border-left-color: #10b981;
}

.purpleHeader {
  background: rgba(168, 85, 247, 0.08);
  border-left-color: #a855f7;
}

.sectionTitleWrap h2 {
  font-size: 1.15rem;
  margin: 0;
  color: var(--text-primary);
}

.sectionTitleWrap h3 {
  font-size: 1.05rem;
  margin: 0;
  color: var(--text-primary);
}

.sectionDesc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

.sectionCount {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--bg-inset);
  color: var(--text-muted);
}

.subSectionHeader {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.6rem 0.85rem;
  background: rgba(96, 165, 250, 0.06);
  border-left: 4px solid #60a5fa;
  border-radius: 8px;
}

/* Pair Card */
.pairGrid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pairCard {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  background: rgba(15, 19, 25, 0.6);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 1rem;
  transition: border-color 0.15s ease;
}

.pairCard:hover {
  border-color: var(--border-card);
}

.pairColumn {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.colLabel {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.upgradeArrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 0.5rem;
  color: #34d399;
}

.purpleArrow {
  color: #c084fc;
}

.arrowIcon {
  font-size: 1.25rem;
  font-weight: bold;
}

.upgradeTag {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--bg-inset);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.noUpgradeNotice {
  padding: 1rem;
  background: var(--bg-card);
  border: 1px dashed var(--border-card);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.82rem;
  text-align: center;
}

/* Standard Rare Grid */
.standardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* Flat Grid */
.traitsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.emptyNotice {
  padding: 2rem;
  text-align: center;
  background: var(--bg-card);
  border: 1px dashed var(--border-card);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .pairCard {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .upgradeArrow {
    flex-direction: row;
    padding: 0.25rem 0;
  }
  .arrowIcon {
    transform: rotate(90deg);
  }
}
</style>
