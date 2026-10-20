<script setup lang="ts">
import type { EquipmentDefinition } from '../types';
import { base } from '../lib/base';
import { formatStat } from '../lib/stats';

defineProps<{
  item: EquipmentDefinition;
  basePath?: string;
}>();
</script>

<template>
  <div class="equipCard">
    <div class="cardTop">
      <div class="spriteBox">
        <img
          :src="`${basePath ?? base}/images/${item.sprite}.png`"
          :alt="item.name"
          class="sprite"
          width="56"
          height="56"
        />
      </div>

      <div class="header">
        <div class="nameRow">
          <a :href="`${basePath ?? base}/items/${item.id}`" class="name cardLink">{{ item.name }}</a>
        </div>

        <div class="badgeRow">
          <span class="badge typeBadge">{{ item.category }}</span>
          <span class="price">
            <svg class="coin" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <circle cx="8" cy="8" r="7" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" />
              <circle cx="8" cy="8" r="3.5" fill="none" stroke="#b45309" stroke-width="1.2" />
            </svg>
            {{ item.price ?? '—' }}
          </span>
        </div>
      </div>
    </div>

    <p v-if="item.description" class="desc">{{ item.description }}</p>

    <!-- Stats chips -->
    <div v-if="item.stats && Object.keys(item.stats).length" class="statsChips">
      <span
        v-for="(val, key) in item.stats"
        :key="key"
        class="statChip"
      >
        {{ formatStat(String(key), Number(val)) }}
      </span>
    </div>

    <div v-if="item.notes" class="notes">
      {{ item.notes }}
    </div>
  </div>
</template>

<style scoped>
.equipCard {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: transform 0.15s ease;
}

.equipCard:hover {
  transform: translateY(-2px);
  border-color: var(--brand-primary);
}

/* Stretch the name link over the whole card so the card is clickable */
.cardLink {
  color: var(--text-primary);
  text-decoration: none;
}

.cardLink::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
}

.cardLink:hover {
  color: var(--text-primary);
  text-decoration: none;
}

.cardTop {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.spriteBox {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 2px solid var(--border-subtle);
  border-radius: 8px;
}

.header {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.badgeRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.badge {
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.typeBadge {
  background: var(--bg-inset);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.price {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-gold);
}

.desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.statsChips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.statChip {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.notes {
  font-size: 0.75rem;
  color: var(--text-gold);
  border-top: 1px dashed var(--border-subtle);
  padding-top: 4px;
}
</style>
