<script setup lang="ts">
import type { EquipmentDefinition } from '../types';

defineProps<{
  item: EquipmentDefinition;
  basePath?: string;
}>();

const STAT_LABELS: Record<string, string> = {
  constitution: 'CON',
  intelligence: 'INT',
  dexterity: 'DEX',
  defense: 'DEF',
  magicDefense: 'MDEF',
  maxHp: 'Max HP',
  criticalChance: 'Crit Chance',
  criticalDamage: 'Crit DMG',
  flatDodgeChance: 'Dodge',
  dodgeChance: 'Dodge',
  attackSpeed: 'Atk Speed',
  lifesteal: 'Lifesteal',
  counterattack: 'Counter',
  threat: 'Threat',
};

function formatStat(key: string, val: number): string {
  const label = STAT_LABELS[key] || key;
  const isPercent = ['criticalChance', 'criticalDamage', 'dodgeChance', 'flatDodgeChance', 'counterattack'].includes(key);
  if (isPercent) {
    const pct = Math.abs(val) <= 1.0 ? val * 100 : val;
    return `${label} ${pct > 0 ? '+' : ''}${pct}%`;
  }
  return `${label} ${val > 0 && key !== 'maxHp' ? '+' : ''}${val}`;
}
</script>

<template>
  <div class="equipCard" :class="`border-rarity-${item.rarity}`">
    <div class="cardTop">
      <div class="spriteBox" :class="`border-rarity-${item.rarity}`">
        <img
          :src="`${basePath || '/igmplus_wiki'}/images/${item.sprite}.png`"
          :alt="item.name"
          class="sprite"
          width="56"
          height="56"
        />
      </div>

      <div class="header">
        <div class="nameRow">
          <strong class="name" :class="`rarity-${item.rarity}`">{{ item.name }}</strong>
        </div>

        <div class="badgeRow">
          <span class="badge typeBadge">{{ item.category }}</span>
          <span class="badge rarityBadge" :class="`rarity-${item.rarity}`">★ {{ item.rarity }}</span>
          <span class="price">🪙 {{ item.price ?? '—' }}</span>
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

.rarityBadge {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 700;
}

.price {
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
