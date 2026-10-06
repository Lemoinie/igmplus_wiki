<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ClassDefinition } from '../types';
import ClassCard from './ClassCard.vue';
import ClassTreeNode from './ClassTreeNode.vue';
import { base } from '../lib/base';

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


const byId = computed(() => new Map(props.classes.map((c) => [c.id, c])));

/** Promotions of a class: its own promotesTo plus any class that lists it in promotesFrom. */
const childrenMap = computed(() => {
  const map = new Map<string, ClassDefinition[]>();
  const add = (parent: string, child: ClassDefinition) => {
    const list = map.get(parent) ?? [];
    if (!list.some((x) => x.id === child.id)) list.push(child);
    map.set(parent, list);
  };
  for (const c of props.classes) {
    for (const id of c.promotesTo ?? []) {
      const child = byId.value.get(id);
      if (child) add(c.id, child);
    }
    for (const id of c.promotesFrom ?? []) {
      if (byId.value.has(id)) add(id, c);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  }
  return map;
});

function childrenOf(id: string): ClassDefinition[] {
  return childrenMap.value.get(id) ?? [];
}

const hasParent = computed(() => {
  const s = new Set<string>();
  for (const list of childrenMap.value.values()) for (const c of list) s.add(c.id);
  return s;
});

const roots = computed(() =>
  props.classes
    .filter((c) => c.category === activeCategory.value && !hasParent.value.has(c.id))
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name)),
);

// Ids whose promotion cards are shown. Roots start expanded (shows T2).
const expanded = ref(new Set<string>(
  props.classes.filter((c) => !hasParent.value.has(c.id)).map((c) => c.id),
));

function toggle(id: string) {
  const next = new Set(expanded.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expanded.value = next;
}

function expandAll() {
  expanded.value = new Set(props.classes.map((c) => c.id));
}

function collapseAll() {
  expanded.value = new Set();
}

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];
  return props.classes
    .filter((c) => c.category === activeCategory.value)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.activeSkill && c.activeSkill.toLowerCase().includes(q)) ||
        (c.passiveSkill && c.passiveSkill.toLowerCase().includes(q)),
    )
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
});

function getCatCount(cat: string): number {
  return props.classes.filter((c) => c.category === cat).length;
}
</script>

<template>
  <div class="classBrowser">
    <!-- Category Tabs (Desktop / Wide screens) -->
    <div class="categoryTabs desktopTabs">
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
            :src="`${basePath ?? base}/images/${categoryIcons[cat]}.png`"
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

    <!-- Category Dropdown (Mobile / Narrow screens when width is constrained) -->
    <div class="categoryDropdownWrap mobileDropdown">
      <div class="dropdownIconBox">
        <img
          :src="`${basePath ?? base}/images/${categoryIcons[activeCategory]}.png`"
          :alt="activeCategory"
          class="sprite"
          width="36"
          height="36"
        />
      </div>
      <div class="selectBox">
        <label for="classCategorySelect" class="dropdownLabel">Class Category</label>
        <select
          id="classCategorySelect"
          v-model="activeCategory"
          class="categorySelect"
          @change="searchQuery = ''"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }} Tree ({{ getCatCount(cat) }} classes)
          </option>
        </select>
      </div>
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
        <button type="button" class="actionBtn" @click="expandAll">Expand All</button>
        <button type="button" class="actionBtn" @click="collapseAll">Collapse All</button>
      </div>
    </div>

    <!-- Search results (flat) -->
    <div v-if="searchQuery.trim()" class="tree">
      <ClassCard
        v-for="c in searchResults"
        :key="c.id"
        :class-data="c"
        :base-path="basePath"
      />
      <div v-if="!searchResults.length" class="emptyNotice">
        No classes found matching "{{ searchQuery }}" in {{ activeCategory }}.
      </div>
    </div>

    <!-- Promotion tree -->
    <div v-else class="tree">
      <ClassTreeNode
        v-for="r in roots"
        :key="r.id"
        :node="r"
        :children-of="childrenOf"
        :expanded="expanded"
        :base-path="basePath"
        @toggle="toggle"
      />
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
  flex-shrink: 0;
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

.tree {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.emptyNotice {
  padding: 2.5rem;
  text-align: center;
  background: var(--bg-card);
  border-radius: 8px;
  color: var(--text-muted);
}

.desktopTabs {
  display: flex;
}

.mobileDropdown {
  display: none;
}

@media (max-width: 820px) {
  .desktopTabs {
    display: none;
  }

  .mobileDropdown {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: 10px;
    padding: 0.65rem 1rem;
    margin-bottom: 1.25rem;
  }

  .dropdownIconBox {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-inset);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
  }

  .selectBox {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .dropdownLabel {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .categorySelect {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    padding: 2px 0;
  }

  .categorySelect option {
    background: var(--bg-sidebar);
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.95rem;
  }

  .controlsBar {
    gap: 8px;
  }

  .searchInput {
    flex: 1 1 100%;
  }
}
</style>
