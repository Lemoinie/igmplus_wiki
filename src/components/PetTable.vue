<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PetDefinition } from '../types';
import { base } from '../lib/base';

const props = defineProps<{
  pets: PetDefinition[];
  basePath?: string;
}>();

const searchQuery = ref('');

const FAMILY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Mythic: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' },
  Avian: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.35)' },
  Wild: { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.35)' },
  Construct: { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.35)' },
  Insect: { bg: 'rgba(163, 230, 53, 0.15)', text: '#a3e635', border: 'rgba(163, 230, 53, 0.35)' },
  Reptile: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.35)' },
  Wooden: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.35)' },
  Esoteric: { bg: 'rgba(192, 132, 252, 0.15)', text: '#c084fc', border: 'rgba(192, 132, 252, 0.35)' },
};

const filteredPets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.pets;

  return props.pets.filter((p) => {
    const matchName = p.name.toLowerCase().includes(q);
    const matchFamily = p.family.toLowerCase().includes(q);
    const matchAbilities = p.guaranteedAbilities?.some((a) => a.toLowerCase().includes(q)) ?? false;
    const matchUnique = p.exclusiveAbility?.toLowerCase().includes(q) ?? false;
    return matchName || matchFamily || matchAbilities || matchUnique;
  });
});
</script>

<template>
  <div class="petTableContainer">
    <!-- Quick Search bar -->
    <div class="searchBarWrapper">
      <div class="searchBox">
        <span class="searchIcon">🔍</span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search pets by name, type, or trait…"
          class="searchInput"
        />
      </div>
      <span class="countBadge">{{ filteredPets.length }} of {{ pets.length }} Pets</span>
    </div>

    <!-- Responsive Table -->
    <div class="tableWrapper">
      <table class="petTable">
        <thead>
          <tr>
            <th class="thNo">NO.</th>
            <th class="thImage">IMAGE</th>
            <th class="thName">NAME</th>
            <th class="thType">TYPE</th>
            <th class="thSlots">TRAIT AMOUNT</th>
            <th class="thFirstTrait">FIRST TRAIT</th>
            <th class="thUniqueTrait">UNIQUE TRAIT</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(pet, idx) in filteredPets"
            :key="pet.id"
            :class="{ isMythicRow: pet.family === 'Mythic' }"
          >
            <!-- NO. -->
            <td class="tdNo">{{ idx + 1 }}</td>

            <!-- IMAGE -->
            <td class="tdImage">
              <div class="spriteBox">
                <img
                  :src="`${basePath ?? base}/images/${pet.sprite}.png`"
                  :alt="pet.name"
                  class="petSprite sprite"
                  width="44"
                  height="44"
                />
              </div>
            </td>

            <!-- NAME -->
            <td class="tdName">
              <span class="petName">{{ pet.name }}</span>
            </td>

            <!-- TYPE (EGG + FAMILY) -->
            <td class="tdType">
              <div
                class="typeBadge"
                :style="{
                  background: FAMILY_COLORS[pet.family]?.bg,
                  borderColor: FAMILY_COLORS[pet.family]?.border,
                  color: FAMILY_COLORS[pet.family]?.text,
                }"
              >
                <img
                  v-if="pet.eggSprite"
                  :src="`${basePath ?? base}/images/${pet.eggSprite}.png`"
                  :alt="pet.family"
                  class="eggSprite sprite"
                  width="22"
                  height="22"
                />
                <span>{{ pet.family }} Egg</span>
              </div>
            </td>

            <!-- TRAIT AMOUNT -->
            <td class="tdSlots">
              <span class="slotsValue">{{ pet.abilitySlots }}</span>
            </td>

            <!-- FIRST TRAIT -->
            <td class="tdFirstTrait">
              <div class="traitList">
                <span
                  v-for="trait in pet.guaranteedAbilities"
                  :key="trait"
                  class="traitChip"
                >
                  {{ trait }}
                </span>
              </div>
            </td>

            <!-- UNIQUE TRAIT -->
            <td class="tdUniqueTrait">
              <div v-if="pet.exclusiveAbility" class="uniqueTraitBox">
                <div class="uniqueHeader">
                  <span class="uniqueTag">Unique</span>
                  <strong class="uniqueName">{{ pet.exclusiveAbility }}</strong>
                </div>
                <p v-if="pet.exclusiveDescription" class="uniqueDesc">
                  {{ pet.exclusiveDescription }}
                </p>
              </div>
              <span v-else class="emptyTrait">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.petTableContainer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.searchBarWrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.searchBox {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  max-width: 380px;
  flex: 1 1 240px;
}

.searchIcon {
  font-size: 0.9rem;
  opacity: 0.6;
  margin-right: 8px;
}

.searchInput {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.searchInput::placeholder {
  color: var(--text-muted);
}

.countBadge {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.tableWrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
}

.petTable {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
  margin: 0;
}

.petTable thead {
  background: var(--bg-sidebar);
  border-bottom: 2px solid var(--border-card);
}

.petTable th {
  padding: 0.85rem 1rem;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-gold);
  white-space: nowrap;
}

.thNo { width: 50px; text-align: center; }
.thImage { width: 70px; text-align: center; }
.thName { width: 140px; }
.thType { width: 150px; }
.thSlots { width: 110px; text-align: center; }
.thFirstTrait { width: 220px; }
.thUniqueTrait { min-width: 260px; }

.petTable tbody tr {
  border-bottom: 1px solid var(--border-subtle);
  transition: background-color 0.15s ease;
}

.petTable tbody tr:hover {
  background-color: var(--bg-card-hover);
}

.petTable tbody tr:last-child {
  border-bottom: none;
}

.isMythicRow {
  background: rgba(245, 158, 11, 0.04);
}

.isMythicRow:hover {
  background: rgba(245, 158, 11, 0.08) !important;
}

.petTable td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

.tdNo {
  text-align: center;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.85rem;
}

.tdImage {
  text-align: center;
}

.spriteBox {
  width: 52px;
  height: 52px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.petSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.tdName {
  font-weight: 700;
}

.petName {
  font-size: 1rem;
  color: var(--text-primary);
}

.tdType {
  white-space: nowrap;
}

.typeBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 0.82rem;
  font-weight: 600;
}

.eggSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.tdSlots {
  text-align: center;
}

.slotsValue {
  display: inline-block;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.tdFirstTrait {
  vertical-align: middle;
}

.traitList {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.traitChip {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 2px 8px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-gold);
  white-space: nowrap;
}

.tdUniqueTrait {
  vertical-align: middle;
}

.uniqueTraitBox {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 6px;
  padding: 0.45rem 0.65rem;
}

.uniqueHeader {
  display: flex;
  align-items: center;
  gap: 6px;
}

.uniqueTag {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 3px;
  background: #f59e0b;
  color: #000;
}

.uniqueName {
  font-size: 0.85rem;
  color: #f59e0b;
}

.uniqueDesc {
  margin: 0;
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

.emptyTrait {
  color: var(--text-muted);
  font-size: 1.1rem;
}

@media (max-width: 640px) {
  .petTable th,
  .petTable td {
    padding: 0.6rem 0.65rem;
  }
  .spriteBox {
    width: 44px;
    height: 44px;
  }
  .petSprite {
    width: 36px;
    height: 36px;
  }
}
</style>
