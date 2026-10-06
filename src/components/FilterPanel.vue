<script setup lang="ts">
defineProps<{
  options: {
    categories?: string[];
    selectedCategory?: string;
    rarities?: number[];
    selectedRarity?: string | number;
    sortBy?: string;
  };
}>();

const emit = defineEmits<{
  (e: 'update:search', val: string): void;
  (e: 'update:category', val: string): void;
  (e: 'update:rarity', val: string): void;
  (e: 'update:sortBy', val: string): void;
}>();
</script>

<template>
  <div class="filterPanel">
    <div class="searchBox">
      <input
        type="search"
        placeholder="Filter by name, stats, or text…"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="selects">
      <select
        v-if="options.categories?.length"
        :value="options.selectedCategory || 'all'"
        @change="emit('update:category', ($event.target as HTMLSelectElement).value)"
      >
        <option value="all">All Types</option>
        <option v-for="c in options.categories" :key="c" :value="c">{{ c }}</option>
      </select>

      <select
        v-if="options.rarities?.length"
        :value="options.selectedRarity ?? 'all'"
        @change="emit('update:rarity', ($event.target as HTMLSelectElement).value)"
      >
        <option value="all">All Rarities</option>
        <option v-for="r in options.rarities" :key="r" :value="String(r)">Rarity {{ r }}</option>
      </select>

      <select
        :value="options.sortBy || 'name'"
        @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
      >
        <option value="name">Name A–Z</option>
        <option value="name-desc">Name Z–A</option>
        <option value="price">Price ↑</option>
        <option value="price-desc">Price ↓</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.filterPanel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
}

.searchBox {
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

.selects {
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
</style>
