<script setup lang="ts">
import { ref, computed } from 'vue';
import type { SearchEntry } from '../types';

const props = defineProps<{
  entries?: SearchEntry[];
  placeholder?: string;
}>();

const query = ref('');
const isOpen = ref(false);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q || !props.entries) return [];
  return props.entries
    .filter((e) => {
      return (
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    })
    .slice(0, 8);
});

function onFocus() {
  isOpen.value = true;
}

function onBlur() {
  // Delay blur so click on dropdown link registers
  setTimeout(() => {
    isOpen.value = false;
  }, 200);
}
</script>

<template>
  <div class="searchContainer">
    <div class="inputWrapper">
      <span class="searchIcon">🔍</span>
      <input
        v-model="query"
        type="search"
        :placeholder="placeholder || 'Search classes, items, skills, traits, enemies…'"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>

    <!-- Dropdown results -->
    <div v-if="isOpen && query.trim() && filtered.length" class="resultsDropdown">
      <a
        v-for="item in filtered"
        :key="item.id"
        :href="item.url"
        class="resultItem"
      >
        <div class="resultLeft">
          <span class="resultCat">{{ item.category }}</span>
          <span class="resultTitle">{{ item.title }}</span>
        </div>
        <span v-if="item.description" class="resultDesc">{{ item.description }}</span>
      </a>
    </div>

    <div v-else-if="isOpen && query.trim() && !filtered.length" class="resultsDropdown noResults">
      No matches found for "{{ query }}"
    </div>
  </div>
</template>

<style scoped>
.searchContainer {
  position: relative;
  width: 100%;
  max-width: 580px;
}

.inputWrapper {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  transition: all 0.2s ease;
}

.inputWrapper:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px var(--brand-glow);
}

.searchIcon {
  font-size: 0.95rem;
  margin-right: 0.5rem;
  opacity: 0.6;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.9rem;
}

input::placeholder {
  color: var(--text-muted);
}

.resultsDropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-sidebar);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  z-index: 100;
  max-height: 380px;
  overflow-y: auto;
}

.resultItem {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  text-decoration: none;
  transition: background 0.15s ease;
}

.resultItem:last-child {
  border-bottom: none;
}

.resultItem:hover {
  background: var(--bg-card-hover);
  text-decoration: none;
}

.resultLeft {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resultCat {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(110, 168, 254, 0.15);
  color: var(--brand-primary);
  text-transform: uppercase;
}

.resultTitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.resultDesc {
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.noResults {
  padding: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center;
}
</style>
