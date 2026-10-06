<script setup lang="ts">
import type { ClassDefinition } from '../types';

defineProps<{
  classData: ClassDefinition;
  basePath?: string;
  /** Number of promotion cards under this class. 0 hides the collapse button. */
  childCount?: number;
  /** Whether the promotion cards are currently shown. */
  expanded?: boolean;
}>();

defineEmits<{ (e: 'toggle'): void }>();

/** "Threatening Ii" -> "Threatening II" (roman numerals in raw data). */
function fmtSkill(name?: string): string {
  if (!name || name === 'None') return '';
  return name.replace(/\b(Ii|Iii|Iv|Vi|Vii|Viii|Ix)\b/g, (m) => m.toUpperCase());
}
</script>

<template>
  <div :id="`class-${classData.id}`" class="classCard">
    <div class="row">
      <button
        v-if="childCount"
        type="button"
        class="collapseBtn"
        :title="expanded ? 'Hide promotions' : `Show ${childCount} promotion(s)`"
        @click="$emit('toggle')"
      >
        {{ expanded ? '▾' : '▸' }}
      </button>
      <span v-else class="collapseSpacer"></span>

      <span class="tierBadge">T{{ classData.tier }}</span>

      <a :href="`${basePath || '/igmplus_wiki'}/classes/${classData.id}`" class="identity">
        <span class="spriteFrame">
          <img
            :src="`${basePath || '/igmplus_wiki'}/images/${classData.sprite}.png`"
            :alt="classData.name"
            class="sprite"
            width="56"
            height="56"
          />
        </span>
        <span class="className">{{ classData.name }}</span>
      </a>

      <span v-if="fmtSkill(classData.activeSkill)" class="chip active">{{ fmtSkill(classData.activeSkill) }}</span>
      <span v-if="fmtSkill(classData.passiveSkill)" class="chip passive">{{ fmtSkill(classData.passiveSkill) }}</span>
    </div>
  </div>
</template>

<style scoped>
.classCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-left: 3px solid var(--text-gold);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.classCard:hover {
  background: var(--bg-card-hover);
  border-color: var(--brand-primary);
}

.row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.collapseBtn,
.collapseSpacer {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.collapseBtn {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-gold);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.collapseBtn:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.tierBadge {
  font-size: 0.78rem;
  font-weight: 700;
  min-width: 34px;
  text-align: center;
  padding: 4px 6px;
  border-radius: 6px;
  background: var(--bg-inset);
  color: var(--text-gold);
  border: 1px solid var(--border-subtle);
}

.identity {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  color: var(--text-primary);
  text-decoration: none;
}

.identity:hover .className {
  color: var(--brand-primary);
}

.spriteFrame {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.className {
  font-size: 1.1rem;
  font-weight: 700;
}

.chip {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 14px;
}

.chip.active {
  background: rgba(224, 86, 36, 0.18);
  color: #ff8a65;
}

.chip.passive {
  background: rgba(74, 222, 128, 0.15);
  color: #6ee7a0;
}

</style>
