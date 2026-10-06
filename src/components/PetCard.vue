<script setup lang="ts">
import type { PetDefinition } from '../types';
import { base } from '../lib/base';

defineProps<{
  pet: PetDefinition;
  basePath?: string;
}>();

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
</script>

<template>
  <div :id="`pet-${pet.id}`" class="petCard" :class="{ isMythic: pet.family === 'Mythic' }">
    <div class="cardTop">
      <div class="spriteBox">
        <img
          :src="`${basePath ?? base}/images/${pet.sprite}.png`"
          :alt="pet.name"
          class="sprite"
          width="64"
          height="64"
        />
      </div>

      <div class="header">
        <div class="nameRow">
          <strong class="name">{{ pet.name }}</strong>
          <span
            class="familyTag"
            :style="{
              background: FAMILY_COLORS[pet.family]?.bg || 'rgba(110, 168, 254, 0.15)',
              color: FAMILY_COLORS[pet.family]?.text || 'var(--brand-primary)',
              borderColor: FAMILY_COLORS[pet.family]?.border || 'transparent',
            }"
          >
            {{ pet.family }}
          </span>
        </div>
        <div class="slotsRow">
          <span class="slotsBadge">{{ pet.abilitySlots }} Trait Slots</span>
        </div>
      </div>
    </div>

    <p v-if="pet.description" class="desc">{{ pet.description }}</p>

    <!-- Guaranteed trait pool -->
    <div v-if="pet.guaranteedAbilities?.length" class="abilitiesSection">
      <span class="sectionTitle">Guaranteed Trait Pool:</span>
      <div class="chipsList">
        <span v-for="ab in pet.guaranteedAbilities" :key="ab" class="traitChip">
          {{ ab }}
        </span>
      </div>
    </div>

    <!-- Exclusive unique trait -->
    <div v-if="pet.exclusiveAbility" class="exclusiveBox">
      <div class="exclusiveHeader">
        <span class="exclusiveBadge">Unique</span>
        <strong class="exclusiveName">{{ pet.exclusiveAbility }}</strong>
      </div>
      <p class="exclusiveDesc">{{ pet.exclusiveDescription }}</p>
    </div>
  </div>
</template>

<style scoped>
.petCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.petCard:hover {
  transform: translateY(-2px);
  border-color: var(--brand-primary);
}

.petCard.isMythic {
  border-color: rgba(245, 158, 11, 0.5);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, var(--bg-card) 60%);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.12);
}

.cardTop {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.spriteBox {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.header {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nameRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.name {
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 700;
}

.familyTag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid transparent;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.slotsRow {
  display: flex;
  align-items: center;
}

.slotsBadge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.desc {
  font-size: 0.83rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.abilitiesSection {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px dashed var(--border-subtle);
  padding-top: 0.6rem;
}

.sectionTitle {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.chipsList {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.traitChip {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 2px 8px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-gold);
}

.exclusiveBox {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.exclusiveHeader {
  display: flex;
  align-items: center;
  gap: 6px;
}

.exclusiveBadge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 3px;
  background: #f59e0b;
  color: #000;
}

.exclusiveName {
  font-size: 0.88rem;
  color: #f59e0b;
}

.exclusiveDesc {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

@media (max-width: 480px) {
  .spriteBox {
    width: 60px;
    height: 60px;
  }
}
</style>
