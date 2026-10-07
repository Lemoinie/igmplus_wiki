<script setup lang="ts">
import { base } from '../lib/base';

defineProps<{
  enemy: {
    id: string;
    name: string;
    sprite: string;
    type?: string;
    isBoss?: boolean;
    expGiven?: number;
    places?: Array<{ id?: string; name: string; type?: string }>;
    drops?: Array<{
      item: string;
      name?: string;
      qty: number;
      chance: number;
      sprite?: string;
    }>;
  };
  basePath?: string;
}>();

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function getDropSprite(drop: any): string {
  if (drop.sprite) return drop.sprite;
  const id = drop.item || '';
  if (id.endsWith('Egg')) {
    return 'egg_' + id.replace('Egg', '').toLowerCase();
  }
  return toSnakeCase(id);
}

function getDropName(drop: any): string {
  if (drop.name) return drop.name;
  const id = drop.item || '';
  return id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}
function isValidExp(val: any): boolean {
  return typeof val === 'number' && !isNaN(val) && val > 0;
}
</script>

<template>
  <div class="enemyCard" :class="{ isBoss: enemy.isBoss }">
    <!-- Top Header: Sprite, Name & Badges -->
    <div class="cardTop">
      <div class="spriteBox" :class="{ isBoss: enemy.isBoss }">
        <img
          :src="`${basePath ?? base}/images/${enemy.sprite}.png`"
          :alt="enemy.name"
          class="enemySprite sprite"
          width="54"
          height="54"
          loading="lazy"
        />
      </div>

      <div class="header">
        <div class="nameRow">
          <strong class="name" :class="{ bossName: enemy.isBoss }">{{ enemy.name }}</strong>
        </div>

        <div class="badgeRow">
          <span v-if="enemy.isBoss" class="badge bossTag">Boss</span>
          <span class="badge typeTag" :class="`type-${(enemy.type || 'Humanoid').toLowerCase()}`">{{ enemy.type || 'Humanoid' }}</span>
          <span v-if="isValidExp(enemy.expGiven)" class="badge expTag">{{ enemy.expGiven }} EXP</span>
        </div>
      </div>
    </div>

    <!-- Places / Locations Section -->
    <div class="placesSection">
      <div class="sectionHeader">
        <span class="sectionTitle">Location</span>
      </div>
      <div v-if="enemy.places?.length" class="placesList">
        <span
          v-for="place in enemy.places"
          :key="place.id || place.name"
          class="placeChip"
          :class="`place-${place.type || 'dungeon'}`"
        >
          {{ place.name }}
        </span>
      </div>
      <div v-else class="emptyPlace">
        <span>Special / Unknown</span>
      </div>
    </div>

    <!-- Drops Section -->
    <div class="dropsSection">
      <div class="sectionHeader">
        <span class="sectionTitle">Drops ({{ enemy.drops?.length || 0 }})</span>
      </div>

      <div v-if="enemy.drops?.length" class="dropsGrid">
        <div
          v-for="(drop, idx) in enemy.drops"
          :key="`${drop.item}-${idx}`"
          class="dropCard"
          :title="`${getDropName(drop)} ×${drop.qty} (${drop.chance}%)`"
        >
          <div class="dropSpriteBox">
            <img
              :src="`${basePath ?? base}/images/${getDropSprite(drop)}.png`"
              :alt="getDropName(drop)"
              class="dropSprite sprite"
              width="20"
              height="20"
              loading="lazy"
            />
          </div>
          <span class="dropQty">×{{ drop.qty }}</span>
          <span class="dropChance">{{ drop.chance }}%</span>
        </div>
      </div>

      <div v-else class="noDrops">
        <span>No item drops</span>
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
  height: 100%;
  box-sizing: border-box;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.enemyCard:hover {
  transform: translateY(-2px);
  border-color: var(--brand-primary);
}

.enemyCard.isBoss {
  border-color: rgba(245, 158, 11, 0.45);
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.08);
}

.enemyCard.isBoss:hover {
  border-color: #f59e0b;
  box-shadow: 0 4px 18px rgba(245, 158, 11, 0.22);
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

.spriteBox.isBoss {
  border-color: rgba(245, 158, 11, 0.45);
  background: radial-gradient(circle at center, rgba(245, 158, 11, 0.1) 0%, var(--bg-inset) 80%);
}

.enemySprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.header {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nameRow {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name.bossName {
  color: #fbbf24;
}

.badgeRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  line-height: 1.3;
}

.typeTag {
  background: var(--bg-inset);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.type-construct {
  border-color: rgba(148, 163, 184, 0.4);
  color: #cbd5e1;
}
.type-undead {
  border-color: rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
}
.type-demon {
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}
.type-dragon {
  border-color: rgba(249, 115, 22, 0.4);
  color: #fdba74;
}
.type-beast {
  border-color: rgba(234, 179, 8, 0.4);
  color: #fde047;
}
.type-aberration {
  border-color: rgba(236, 72, 153, 0.4);
  color: #f472b6;
}
.type-elemental {
  border-color: rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
}
.type-plant {
  border-color: rgba(34, 197, 94, 0.4);
  color: #86efac;
}
.type-slime {
  border-color: rgba(20, 184, 166, 0.4);
  color: #5eead4;
}
.type-humanoid {
  border-color: rgba(161, 161, 170, 0.4);
  color: #e4e4e7;
}

.bossTag {
  background: rgba(245, 158, 11, 0.18);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.45);
  font-weight: 700;
}

.expTag {
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

/* Sections */
.sectionHeader {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.sectionTitle {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.placesSection {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.55rem;
}

.placesList {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.placeChip {
  display: inline-flex;
  align-items: center;
  font-size: 0.74rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  line-height: 1.4;
}

.placeChip.place-raid {
  border-color: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.08);
}

.placeChip.place-dungeon {
  border-color: rgba(56, 189, 248, 0.28);
  color: #bae6fd;
  background: rgba(56, 189, 248, 0.07);
}

.emptyPlace {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-style: italic;
}

.dropsSection {
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.55rem;
  flex: 1;
}

.dropsGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dropCard {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 7px 2px 3px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  min-width: 0;
  transition: all 0.15s ease;
}

.dropCard:hover {
  border-color: var(--brand-primary);
  background: var(--bg-card-hover);
}

.dropSpriteBox {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dropSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.dropQty {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
  line-height: 1;
}

.dropChance {
  font-size: 0.72rem;
  color: var(--text-gold);
  font-weight: 700;
  line-height: 1;
}

.noDrops {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
  padding: 4px 0;
}
</style>
