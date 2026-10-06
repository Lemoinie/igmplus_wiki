<script setup lang="ts">
import type { EnemyDefinition } from '../types';
import { base } from '../lib/base';

defineProps<{
  enemy: EnemyDefinition;
  basePath?: string;
}>();
</script>

<template>
  <div class="enemyCard" :class="{ isBoss: enemy.isBoss }">
    <div class="cardTop">
      <div class="spriteBox">
        <img
          :src="`${basePath ?? base}/images/${enemy.sprite}.png`"
          :alt="enemy.name"
          class="sprite"
          width="52"
          height="52"
        />
      </div>

      <div class="header">
        <div class="nameRow">
          <strong class="name">{{ enemy.name }}</strong>
          <span v-if="enemy.isBoss" class="bossTag">👑 BOSS</span>
        </div>
        <div class="damageRow">
          Damage: <strong>{{ enemy.damage.min }} – {{ enemy.damage.max }}</strong>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="enemy.stats" class="statsGrid">
      <div class="statCell"><span class="statK">HP</span><span class="statV">{{ enemy.stats.hp }}</span></div>
      <div class="statCell"><span class="statK">CON</span><span class="statV">{{ enemy.stats.constitution }}</span></div>
      <div class="statCell"><span class="statK">INT</span><span class="statV">{{ enemy.stats.intelligence }}</span></div>
      <div class="statCell"><span class="statK">DEX</span><span class="statV">{{ enemy.stats.dexterity }}</span></div>
      <div class="statCell"><span class="statK">DEF</span><span class="statV">{{ enemy.stats.defense }}</span></div>
      <div class="statCell"><span class="statK">MDEF</span><span class="statV">{{ enemy.stats.magicDefense }}</span></div>
    </div>

    <!-- Drops -->
    <div v-if="enemy.drops?.length" class="drops">
      <span class="dropTitle">Drops:</span>
      <div class="dropList">
        <span v-for="d in enemy.drops" :key="d.item" class="dropChip">
          {{ d.item }} ×{{ d.qty }} ({{ d.chance }}%)
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.enemyCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.enemyCard.isBoss {
  border-color: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
}

.cardTop {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.spriteBox {
  width: 60px;
  height: 60px;
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
  gap: 8px;
}

.name {
  font-size: 1.05rem;
  color: var(--text-primary);
}

.bossTag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.18);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.damageRow {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.damageRow strong {
  color: var(--text-primary);
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  background: var(--bg-inset);
  border-radius: 6px;
  padding: 6px;
  text-align: center;
}

.statCell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.statK {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 700;
}

.statV {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.drops {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px dashed var(--border-subtle);
  padding-top: 6px;
}

.dropTitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.dropList {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dropChip {
  font-size: 0.75rem;
  padding: 2px 6px;
  background: var(--bg-inset);
  border-radius: 4px;
  color: var(--text-secondary);
}
</style>
