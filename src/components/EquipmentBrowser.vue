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

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  pages.push(1);
  if (current > 3) {
    pages.push('...');
  }
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) {
    pages.push('...');
  }
  pages.push(total);
  return pages;
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
      <div class="pageSummary">
        <span>{{ itemRangeText }}</span>
        <div class="pageSizeSelectWrap">
          <label for="pageSizeSelect">Per page:</label>
          <select id="pageSizeSelect" v-model.number="pageSize" class="pageSizeSelect">
            <option :value="12">12</option>
            <option :value="24">24</option>
            <option :value="48">48</option>
            <option :value="filtered.length">All</option>
          </select>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pageNav">
        <button
          type="button"
          class="pageBtn navArrow"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          aria-label="Previous page"
        >
          ‹ Prev
        </button>

        <template v-for="(p, idx) in visiblePages" :key="idx">
          <span v-if="p === '...'" class="pageEllipsis">…</span>
          <button
            v-else
            type="button"
            class="pageBtn"
            :class="{ active: p === currentPage }"
            @click="goToPage(Number(p))"
          >
            {{ p }}
          </button>
        </template>

        <button
          type="button"
          class="pageBtn navArrow"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          aria-label="Next page"
        >
          Next ›
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
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
}

.pageSummary {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pageSizeSelectWrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pageSizeSelect {
  padding: 4px 8px;
  font-size: 0.82rem;
}

.pageNav {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pageBtn {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pageBtn:hover:not(:disabled) {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--brand-primary);
}

.pageBtn.active {
  background: var(--brand-primary);
  color: #fff;
  border-color: var(--brand-primary);
  font-weight: 700;
}

.pageBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.navArrow {
  font-weight: 600;
  padding: 0 10px;
}

.pageEllipsis {
  padding: 0 4px;
  color: var(--text-muted);
  font-size: 0.85rem;
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
    align-items: stretch;
    gap: 0.85rem;
    padding: 0.85rem;
  }
  .pageSummary {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .pageNav {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
