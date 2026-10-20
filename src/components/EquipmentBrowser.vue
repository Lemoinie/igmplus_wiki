<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
const currentPage = ref(1);
const pageSize = ref(12);

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

watch([query, selectedCategory, selectedRarity, sortBy, pageSize], () => {
  currentPage.value = 1;
});

const totalPages = computed(() => {
  if (pageSize.value <= 0) return 1;
  return Math.max(1, Math.ceil(filtered.value.length / pageSize.value));
});

watch(filtered, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

const paginatedItems = computed(() => {
  if (pageSize.value <= 0) return filtered.value;
  const start = (currentPage.value - 1) * pageSize.value;
  return filtered.value.slice(start, start + pageSize.value);
});

const itemRangeText = computed(() => {
  const total = filtered.value.length;
  if (total === 0) return '0 items';
  const start = (currentPage.value - 1) * pageSize.value + 1;
  const end = Math.min(start + pageSize.value - 1, total);
  return `Showing ${start}–${end} of ${total} items`;
});

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  if (typeof window !== 'undefined') {
    const el = document.querySelector('.equipBrowser');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
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

      <span class="count">{{ itemRangeText }}</span>
    </div>

    <!-- Cards Grid -->
    <div v-if="paginatedItems.length" class="itemsGrid">
      <EquipmentCard
        v-for="item in paginatedItems"
        :key="item.id"
        :item="item"
        :base-path="basePath"
      />
    </div>

    <div v-else class="emptyNotice">
      No equipment found matching criteria.
    </div>

    <!-- Pagination Controls -->
    <div v-if="filtered.length > 0" class="paginationBar">
      <div class="pageSizeControl">
        <label for="pageSizeSelect" class="pageSizeLabel">Show</label>
        <select id="pageSizeSelect" v-model.number="pageSize" class="pageSizeSelect">
          <option :value="12">12</option>
          <option :value="24">24</option>
          <option :value="48">48</option>
        </select>
      </div>

      <div class="pageNav">
        <button
          type="button"
          class="pageNavBtn"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
          title="First page"
          aria-label="First page"
        >
          «
        </button>

        <button
          type="button"
          class="pageNavBtn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          title="Previous page"
          aria-label="Previous page"
        >
          ‹
        </button>

        <div class="pageIndicator">
          <span class="currentPageNum">{{ currentPage }}</span>
          <span class="pageSlash">/</span>
          <span class="totalPagesNum">{{ totalPages }}</span>
        </div>

        <button
          type="button"
          class="pageNavBtn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          title="Next page"
          aria-label="Next page"
        >
          ›
        </button>

        <button
          type="button"
          class="pageNavBtn"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
          title="Last page"
          aria-label="Last page"
        >
          »
        </button>
      </div>
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
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  gap: 1rem;
}

.emptyNotice {
  padding: 2.5rem;
  text-align: center;
  background: var(--bg-card);
  border-radius: 8px;
  color: var(--text-muted);
}

/* Pagination Styles */
.paginationBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding: 0.85rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
}

.pageSizeControl {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.pageSizeLabel {
  font-weight: 600;
  color: var(--text-secondary);
}

.pageSizeSelect {
  background: var(--bg-inset);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pageSizeSelect:hover,
.pageSizeSelect:focus {
  border-color: var(--brand-primary);
  outline: none;
  box-shadow: 0 0 8px rgba(110, 168, 254, 0.2);
}

.pageNav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pageNavBtn {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.pageNavBtn:hover:not(:disabled) {
  background: var(--bg-card-hover);
  color: #fff;
  border-color: var(--brand-primary);
  box-shadow: 0 0 8px rgba(110, 168, 254, 0.25);
}

.pageNavBtn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pageIndicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 34px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  user-select: none;
}

.currentPageNum {
  color: #93c5fd;
  font-weight: 700;
}

.pageSlash {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.totalPagesNum {
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .filterBar {
    padding: 0.6rem 0.75rem;
    gap: 8px;
  }
  .searchWrap {
    flex: 1 1 100%;
  }
  .selectGroup {
    width: 100%;
  }
  select {
    flex: 1 1 calc(50% - 4px);
  }
  .count {
    width: 100%;
    margin-left: 0;
    text-align: right;
  }

  .paginationBar {
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    padding: 0.85rem;
  }
}
</style>
