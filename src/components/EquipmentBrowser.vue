<script setup lang="ts">
import { ref, computed } from 'vue';
import type { EquipmentDefinition } from '../types';
import EquipmentCard from './EquipmentCard.vue';

const props = defineProps<{
  items: EquipmentDefinition[];
  basePath?: string;
}>();

const query = ref('');
const selectedCategory = ref('all');
const selectedRarity = ref('all');
const sortBy = ref('price');

const categories = computed(() => {
  return [...new Set(props.items.map((i) => i.category))].filter(Boolean).sort();
});

const rarities = computed(() => {
  return [...new Set(props.items.map((i) => i.rarity))].sort((a, b) => a - b);
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  let list = props.items.filter((i) => {
    if (selectedCategory.value !== 'all' && i.category !== selectedCategory.value) return false;
    if (selectedRarity.value !== 'all' && String(i.rarity) !== selectedRarity.value) return false;
    if (q) {
      const match =
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const dir = sortBy.value.endsWith('-desc') ? -1 : 1;
  const key = sortBy.value.replace('-desc', '');

  return list.sort((a, b) => {
    if (key === 'name') return dir * a.name.localeCompare(b.name);
    const av = (a as any)[key] ?? 0;
    const bv = (b as any)[key] ?? 0;
    return dir * (av - bv);
  });
});
</script>

<template>
  <div class="equipBrowser">
    <!-- Filters -->
    <div class="filterBar">
      <div class="searchWrap">
        <input v-model="query" type="search" placeholder="Search equipment by name or text…" />
      </div>

      <div class="selectGroup">
        <select v-model="selectedCategory">
          <option value="all">All Types</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>

        <select v-model="selectedRarity">
          <option value="all">All Rarities</option>
          <option v-for="r in rarities" :key="r" :value="String(r)">Rarity ★{{ r }}</option>
        </select>

        <select v-model="sortBy">
          <option value="price">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="name">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </div>

      <span class="count">{{ filtered.length }} items</span>
    </div>

    <!-- Cards Grid -->
    <div v-if="filtered.length" class="itemsGrid">
      <EquipmentCard
        v-for="item in filtered"
        :key="item.id"
        :item="item"
        :base-path="basePath"
      />
    </div>

    <div v-else class="emptyNotice">
      No equipment found matching criteria.
    </div>
  </div>
</template>

<style scoped>
.filterBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
}

.searchWrap {
  flex: 1 1 220px;
}

input {
  width: 100%;
  padding: 6px 12px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

input:focus {
  border-color: var(--brand-primary);
  outline: none;
}

.selectGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

select {
  padding: 6px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

select:focus {
  border-color: var(--brand-primary);
}

.count {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-left: auto;
}

.itemsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
