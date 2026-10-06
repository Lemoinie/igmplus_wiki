<script setup lang="ts">
import type { TraitDefinition } from '../types';

defineProps<{
  trait: TraitDefinition;
  basePath?: string;
}>();
</script>

<template>
  <div class="traitCard" :class="`trait-${trait.type}`">
    <div class="top">
      <div v-if="trait.sprite" class="iconBox">
        <img
          :src="`${basePath || '/igmplus_wiki'}/images/${trait.sprite}.png`"
          :alt="trait.name"
          class="sprite"
          width="28"
          height="28"
        />
      </div>
      <strong class="title">{{ trait.name }}</strong>
      <span class="typeBadge">{{ trait.type }}</span>
    </div>

    <p class="desc">{{ trait.description }}</p>

    <div v-if="trait.effects?.length" class="effects">
      <div v-for="eff in trait.effects" :key="eff" class="effLine">
        • {{ eff }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.traitCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.iconBox {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border-radius: 6px;
}

.title {
  font-size: 0.95rem;
  color: var(--text-primary);
  flex: 1;
}

.typeBadge {
  font-size: 0.68rem;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.trait-positive .typeBadge {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.trait-negative .typeBadge {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.trait-unique .typeBadge {
  background: rgba(192, 132, 252, 0.15);
  color: #c084fc;
}

.desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.effects {
  font-size: 0.78rem;
  color: var(--brand-primary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
