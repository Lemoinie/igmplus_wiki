<script setup lang="ts">
import type { TraitDefinition } from '../types';
import { base } from '../lib/base';

defineProps<{
  trait: TraitDefinition;
  basePath?: string;
}>();
</script>

<template>
  <div
    class="traitCard"
    :class="[
      trait.category ? `cat-${trait.category}` : '',
      trait.plus ? 'is-plus' : '',
      trait.type ? `trait-${trait.type}` : ''
    ]"
  >
    <div class="top">
      <div v-if="trait.sprite" class="iconBox">
        <img
          :src="`${basePath ?? base}/images/${trait.sprite}.png`"
          :alt="trait.name"
          class="sprite"
          width="28"
          height="28"
        />
      </div>
      <div class="titleWrap">
        <strong class="title">{{ trait.name }}</strong>
        <span v-if="trait.plus" class="plusIndicator" title="Upgraded Trait">★ PLUS</span>
      </div>
      <div class="badges">
        <span
          v-if="trait.category"
          class="categoryBadge"
          :class="[trait.category, trait.plus ? 'plusBadge' : '']"
        >
          {{ trait.category === 'basic' ? (trait.plus ? 'Basic+' : 'Basic') : (trait.plus ? 'Rare+' : 'Rare') }}
        </span>
        <span v-if="trait.type" class="typeBadge">{{ trait.type }}</span>
      </div>
    </div>

    <p class="desc">{{ trait.description }}</p>

    <!-- Upgrade Relationship Note -->
    <div v-if="trait.upgrade_name" class="upgradeNote up">
      <span class="noteIcon">▲</span>
      <span class="noteText">Upgrades to: <strong>{{ trait.upgrade_name }}</strong></span>
    </div>
    <div v-else-if="trait.base_name" class="upgradeNote down">
      <span class="noteIcon">★</span>
      <span class="noteText">Upgraded from: <strong>{{ trait.base_name }}</strong></span>
    </div>

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
  position: relative;
  transition: all 0.15s ease;
}

.traitCard:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-focus);
}

.is-plus {
  border-color: rgba(245, 158, 11, 0.35);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.05);
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.titleWrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
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
}

.plusIndicator {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 1px 5px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.categoryBadge {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.3px;
}

.categoryBadge.basic {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.categoryBadge.basic.plusBadge {
  background: rgba(16, 185, 129, 0.22);
  color: #6ee7b7;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.categoryBadge.rare {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.categoryBadge.rare.plusBadge {
  background: rgba(168, 85, 247, 0.22);
  color: #e9d5ff;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.typeBadge {
  font-size: 0.68rem;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.45;
}

.upgradeNote {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  padding: 4px 8px;
  border-radius: 6px;
  margin-top: auto;
}

.upgradeNote.up {
  background: rgba(16, 185, 129, 0.08);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.upgradeNote.down {
  background: rgba(245, 158, 11, 0.08);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.noteIcon {
  font-size: 0.75rem;
}

.effects {
  font-size: 0.78rem;
  color: var(--brand-primary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
