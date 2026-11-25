<script setup lang="ts">
import { computed } from 'vue';
import type { EquipmentDefinition } from '../types';
import { base } from '../lib/base';
import { filterDisplayStats, formatStat } from '../lib/stats';
import { parseCoins } from '../lib/currency';

interface ItemRecipeIngredient {
  id: string;
  name: string;
  sprite?: string;
  qty: number;
  hasPage: boolean;
}

interface ItemUsedInRecipe {
  id: string;
  name: string;
  sprite?: string;
  hasPage: boolean;
  ingredients: ItemRecipeIngredient[];
}

type EquipmentCardItem = EquipmentDefinition & {
  ownRecipe?: ItemRecipeIngredient[];
  usedInRecipes?: ItemUsedInRecipe[];
};

const props = defineProps<{
  item: EquipmentCardItem;
  basePath?: string;
  showRecipes?: boolean;
}>();

const resolvedBase = computed(() => props.basePath ?? base);

function getItemSpriteUrl(sprite?: string, id?: string): string {
  const s = sprite || (id || '').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  return `${resolvedBase.value}/images/${s}.png`;
}

function getItemUrl(id: string): string {
  return `${resolvedBase.value}/items/${id}`;
}

const displayStats = computed(() => filterDisplayStats(props.item.stats));

const coins = computed(() => parseCoins(props.item.price));
const priceTooltip = computed(() => {
  if (props.item.price === null || props.item.price === undefined) return 'Price: Unknown';
  return `Price: ${props.item.price.toLocaleString('en-US')} copper`;
});

const ALLOWED_DESC_CATEGORIES = new Set(['potion', 'upgrade', 'rune']);
const displayDescription = computed(() => {
  if (!props.item.description) return '';
  const cat = (props.item.category || '').toLowerCase().trim();
  if (!ALLOWED_DESC_CATEGORIES.has(cat)) return '';
  return props.item.description.replace(/^"|"$/g, '');
});
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
          <div class="priceGroup" :title="priceTooltip">
            <template v-if="coins.length">
              <span
                v-for="coin in coins"
                :key="coin.type"
                class="coinChip"
                :class="`coin-${coin.type}`"
              >
                <img
                  :src="`${basePath ?? base}/images/${coin.sprite}`"
                  :alt="coin.label"
                  class="coinIcon"
                  width="15"
                  height="15"
                />
                <span class="coinVal">{{ coin.amount }}</span>
              </span>
            </template>
            <span v-else class="coinEmpty">—</span>
          </div>
        </div>
      </div>
    </div>

    <p v-if="displayDescription" class="desc">{{ displayDescription }}</p>

    <!-- Stats chips -->
    <div v-if="Object.keys(displayStats).length" class="statsChips">
      <span
        v-for="(val, key) in displayStats"
        :key="key"
        class="statChip"
      >
        {{ formatStat(String(key), Number(val)) }}
      </span>
    </div>

    <div v-if="item.notes" class="notes">
      {{ item.notes }}
    </div>

    <!-- Own Crafting Recipe -->
    <div v-if="showRecipes && item.ownRecipe?.length" class="recipeBlock">
      <div class="recipeBlockLabel">Recipe</div>
      <div class="recipeEquationRow">
        <template v-for="(ing, iIdx) in item.ownRecipe" :key="ing.id">
          <span v-if="iIdx > 0" class="recipeOp">+</span>
          <a
            v-if="ing.hasPage"
            :href="getItemUrl(ing.id)"
            class="recipeSlot"
            :title="`${ing.name} ×${ing.qty}`"
          >
            <img
              :src="getItemSpriteUrl(ing.sprite, ing.id)"
              :alt="ing.name"
              class="recipeSlotSprite sprite"
              width="26"
              height="26"
              loading="lazy"
            />
            <span class="recipeSlotQty">{{ ing.qty }}</span>
          </a>
          <span v-else class="recipeSlot" :title="`${ing.name} ×${ing.qty}`">
            <img
              :src="getItemSpriteUrl(ing.sprite, ing.id)"
              :alt="ing.name"
              class="recipeSlotSprite sprite"
              width="26"
              height="26"
              loading="lazy"
            />
            <span class="recipeSlotQty">{{ ing.qty }}</span>
          </span>
        </template>

        <span class="recipeArrow">→</span>

        <a :href="getItemUrl(item.id)" class="recipeSlot recipeSlotOutput" :title="item.name">
          <img
            :src="getItemSpriteUrl(item.sprite, item.id)"
            :alt="item.name"
            class="recipeSlotSprite sprite"
            width="26"
            height="26"
            loading="lazy"
          />
        </a>
      </div>
    </div>

    <!-- Used in Recipes -->
    <div v-if="showRecipes && item.usedInRecipes?.length" class="recipeBlock">
      <div class="recipeBlockLabel">Used in Recipes ({{ item.usedInRecipes.length }})</div>
      <div class="recipeList">
        <div v-for="rec in item.usedInRecipes" :key="rec.id" class="recipeEquationRow">
          <template v-for="(ing, iIdx) in rec.ingredients" :key="ing.id">
            <span v-if="iIdx > 0" class="recipeOp">+</span>
            <a
              v-if="ing.hasPage"
              :href="getItemUrl(ing.id)"
              class="recipeSlot"
              :title="`${ing.name} ×${ing.qty}`"
            >
              <img
                :src="getItemSpriteUrl(ing.sprite, ing.id)"
                :alt="ing.name"
                class="recipeSlotSprite sprite"
                width="26"
                height="26"
                loading="lazy"
              />
              <span class="recipeSlotQty">{{ ing.qty }}</span>
            </a>
            <span v-else class="recipeSlot" :title="`${ing.name} ×${ing.qty}`">
              <img
                :src="getItemSpriteUrl(ing.sprite, ing.id)"
                :alt="ing.name"
                class="recipeSlotSprite sprite"
                width="26"
                height="26"
                loading="lazy"
              />
              <span class="recipeSlotQty">{{ ing.qty }}</span>
            </span>
          </template>

          <span class="recipeArrow">→</span>

          <a
            v-if="rec.hasPage"
            :href="getItemUrl(rec.id)"
            class="recipeSlot recipeSlotOutput"
            :title="rec.name"
          >
            <img
              :src="getItemSpriteUrl(rec.sprite, rec.id)"
              :alt="rec.name"
              class="recipeSlotSprite sprite"
              width="26"
              height="26"
              loading="lazy"
            />
          </a>
          <span v-else class="recipeSlot recipeSlotOutput" :title="rec.name">
            <img
              :src="getItemSpriteUrl(rec.sprite, rec.id)"
              :alt="rec.name"
              class="recipeSlotSprite sprite"
              width="26"
              height="26"
              loading="lazy"
            />
          </span>
        </div>
      </div>
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

.priceGroup {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.coinChip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.coinIcon {
  width: 15px;
  height: 15px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  display: block;
}

.coinVal {
  color: var(--text-primary);
}

.coin-copper .coinVal { color: #f97316; }
.coin-silver .coinVal { color: #cbd5e1; }
.coin-gold .coinVal { color: #fbbf24; }
.coin-platinum .coinVal { color: #67e8f9; }
.coin-diamond .coinVal { color: #a78bfa; }

.coinEmpty {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
  white-space: pre-line;
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
  color: var(--text-primary);
  border-top: 1px dashed var(--border-subtle);
  padding-top: 4px;
  white-space: pre-line;
}

.recipeBlock {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--border-subtle);
}

.recipeBlockLabel {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.recipeList {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.recipeEquationRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
}

.recipeOp,
.recipeArrow {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  user-select: none;
  line-height: 1;
}

.recipeArrow {
  color: var(--text-gold);
  padding: 0 2px;
}

.recipeSlot {
  position: relative;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  text-decoration: none;
  flex-shrink: 0;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

a.recipeSlot:hover {
  border-color: var(--brand-primary);
  transform: translateY(-1px);
}

.recipeSlotOutput {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.08);
}

.recipeSlotSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.recipeSlotQty {
  position: absolute;
  right: 2px;
  bottom: 1px;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
  text-shadow: 0 1px 2px #000000, 0 0 3px #000000;
  pointer-events: none;
}
</style>
