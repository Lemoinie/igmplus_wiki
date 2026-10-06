<script setup lang="ts">
import type { PetDefinition } from '../types';
import { base } from '../lib/base';

defineProps<{
  pet: PetDefinition;
  basePath?: string;
}>();
</script>

<template>
  <div class="petCard">
    <div class="cardTop">
      <div class="spriteBox">
        <img
          :src="`${basePath ?? base}/images/${pet.sprite}.png`"
          :alt="pet.name"
          class="sprite"
          width="60"
          height="60"
        />
      </div>

      <div class="header">
        <div class="nameRow">
          <strong class="name">{{ pet.name }}</strong>
          <span class="typeTag">{{ pet.type }}</span>
        </div>
        <div class="tierTag">Tier {{ pet.tier }}</div>
      </div>
    </div>

    <p v-if="pet.description" class="desc">{{ pet.description }}</p>

    <!-- Stats -->
    <div v-if="pet.stats && Object.keys(pet.stats).length" class="statsGrid">
      <div v-for="(val, key) in pet.stats" :key="key" class="statCell">
        <span class="statKey">{{ key }}</span>
        <span class="statVal">{{ val }}</span>
      </div>
    </div>

    <!-- Skills or Traits -->
    <div v-if="pet.skills?.length" class="skills">
      <span class="sectionTitle">Skills:</span>
      <span v-for="sk in pet.skills" :key="sk" class="skillChip">⚡ {{ sk }}</span>
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
  gap: 0.65rem;
}

.cardTop {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.spriteBox {
  width: 68px;
  height: 68px;
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
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nameRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.name {
  font-size: 1.05rem;
  color: var(--text-primary);
}

.typeTag {
  font-size: 0.7rem;
  text-transform: capitalize;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(110, 168, 254, 0.15);
  color: var(--brand-primary);
}

.tierTag {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  background: var(--bg-inset);
  padding: 6px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.statCell {
  display: flex;
  justify-content: space-between;
  padding: 2px 4px;
}

.statKey {
  color: var(--text-muted);
}

.statVal {
  font-weight: 700;
  color: var(--text-primary);
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 0.78rem;
}

.sectionTitle {
  color: var(--text-muted);
}

.skillChip {
  padding: 2px 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-gold);
}
</style>
