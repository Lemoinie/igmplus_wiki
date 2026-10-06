<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PetDefinition, PetFamily } from '../types';
import PetCard from './PetCard.vue';
import { base } from '../lib/base';

const props = defineProps<{
  pets: PetDefinition[];
  basePath?: string;
}>();

const families: ('All' | PetFamily)[] = [
  'All',
  'Mythic',
  'Avian',
  'Construct',
  'Esoteric',
  'Insect',
  'Reptile',
  'Wild',
  'Wooden',
];

const selectedFamily = ref<'All' | PetFamily>('All');
const searchQuery = ref('');
const sortBy = ref<'name' | 'slots-desc' | 'family'>('family');

const FAMILY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Mythic: { bg: 'rgba(245, 158, 11, 0.18)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.45)' },
  Avian: { bg: 'rgba(56, 189, 248, 0.16)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' },
  Wild: { bg: 'rgba(251, 146, 60, 0.16)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.4)' },
  Construct: { bg: 'rgba(148, 163, 184, 0.16)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.4)' },
  Insect: { bg: 'rgba(163, 230, 53, 0.16)', text: '#a3e635', border: 'rgba(163, 230, 53, 0.4)' },
  Reptile: { bg: 'rgba(52, 211, 153, 0.16)', text: '#34d399', border: 'rgba(52, 211, 153, 0.4)' },
  Wooden: { bg: 'rgba(74, 222, 128, 0.16)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.4)' },
  Esoteric: { bg: 'rgba(192, 132, 252, 0.16)', text: '#c084fc', border: 'rgba(192, 132, 252, 0.4)' },
};

function getFamilyCount(fam: 'All' | PetFamily): number {
  if (fam === 'All') return props.pets.length;
  return props.pets.filter((p) => p.family === fam).length;
}

const filteredPets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  let list = props.pets.filter((p) => {
    if (selectedFamily.value !== 'All' && p.family !== selectedFamily.value) {
      return false;
    }
    if (q) {
      const matchName = p.name.toLowerCase().includes(q);
      const matchFamily = p.family.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q) ?? false;
      const matchAbilities = p.guaranteedAbilities?.some((a) => a.toLowerCase().includes(q)) ?? false;
      const matchUnique = p.exclusiveAbility?.toLowerCase().includes(q) ?? false;
      if (!matchName && !matchFamily && !matchDesc && !matchAbilities && !matchUnique) {
        return false;
      }
    }
    return true;
  });

  return list.sort((a, b) => {
    if (sortBy.value === 'slots-desc') {
      return b.abilitySlots - a.abilitySlots || a.name.localeCompare(b.name);
    }
    if (sortBy.value === 'family') {
      if (a.family === 'Mythic' && b.family !== 'Mythic') return -1;
      if (b.family === 'Mythic' && a.family !== 'Mythic') return 1;
      const famCmp = a.family.localeCompare(b.family);
      if (famCmp !== 0) return famCmp;
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });
});
</script>

<template>
  <div class="petBrowser">
    <!-- Family Filter Pills (horizontally scrollable on touch) -->
    <div class="familyTabs">
      <button
        v-for="fam in families"
        :key="fam"
        type="button"
        class="famBtn"
        :class="{ active: selectedFamily === fam }"
        :style="
          selectedFamily === fam && fam !== 'All'
            ? {
                borderColor: FAMILY_COLORS[fam]?.border,
                color: FAMILY_COLORS[fam]?.text,
                background: FAMILY_COLORS[fam]?.bg,
              }
            : {}
        "
        @click="selectedFamily = fam"
      >
        <span>{{ fam }}</span>
        <span class="countBadge">{{ getFamilyCount(fam) }}</span>
      </button>
    </div>

    <!-- Controls Bar -->
    <div class="controlsBar">
      <div class="searchWrapper">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search pet by name, trait, or description…"
          class="searchInput"
        />
      </div>

      <div class="sortWrapper">
        <label for="petSort" class="sortLabel">Sort:</label>
        <select id="petSort" v-model="sortBy" class="sortSelect">
          <option value="family">Family (Mythic first)</option>
          <option value="name">Name A–Z</option>
          <option value="slots-desc">Trait Slots (High → Low)</option>
        </select>
      </div>

      <span class="resultsCount">{{ filteredPets.length }} Pets</span>
    </div>

    <!-- Pets Grid -->
    <div v-if="filteredPets.length" class="petsGrid">
      <PetCard
        v-for="p in filteredPets"
        :key="p.id"
        :pet="p"
        :base-path="basePath ?? base"
      />
    </div>

    <div v-else class="emptyNotice">
      <p>No pets found matching your query.</p>
      <button
        type="button"
        class="resetBtn"
        @click="selectedFamily = 'All'; searchQuery = ''"
      >
        Reset Filters
      </button>
    </div>
  </div>
</template>

<style scoped>
.petBrowser {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.familyTabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.familyTabs::-webkit-scrollbar {
  display: none;
}

.famBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.famBtn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--brand-primary);
}

.famBtn.active {
  background: rgba(110, 168, 254, 0.18);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.countBadge {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--bg-inset);
  color: var(--text-muted);
}

.famBtn.active .countBadge {
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
}

.controlsBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.searchWrapper {
  flex: 1 1 240px;
}

.searchInput {
  width: 100%;
  padding: 7px 12px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.searchInput:focus {
  border-color: var(--brand-primary);
  outline: none;
}

.sortWrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sortLabel {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.sortSelect {
  padding: 6px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.sortSelect:focus {
  border-color: var(--brand-primary);
}

.resultsCount {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-left: auto;
}

.petsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 1.25rem;
}

.emptyNotice {
  padding: 3rem 1rem;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.resetBtn {
  padding: 6px 16px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--brand-primary);
  cursor: pointer;
  font-weight: 600;
}

.resetBtn:hover {
  border-color: var(--brand-primary);
}

@media (max-width: 640px) {
  .controlsBar {
    padding: 0.6rem 0.75rem;
    gap: 8px;
  }
  .searchWrapper {
    flex: 1 1 100%;
  }
  .resultsCount {
    margin-left: auto;
  }
}
</style>
