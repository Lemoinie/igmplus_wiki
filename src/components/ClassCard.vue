<script setup lang="ts">
import type { ClassDefinition } from '../types';

defineProps<{
  classData: ClassDefinition;
  basePath?: string;
}>();

const WEAPON_ICONS: Record<string, string> = {
  sword: '⚔️ Sword',
  axe: '🪓 Axe',
  bow: '🏹 Bow',
  staff: '🪄 Staff',
  dagger: '🗡️ Dagger',
};

const ARMOR_ICONS: Record<string, string> = {
  heavy: '🛡️ Heavy',
  medium: '🥋 Medium',
  light: '🥼 Cloth',
};
</script>

<template>
  <div :id="`class-${classData.id}`" class="classCard">
    <div class="cardTop">
      <div class="spriteFrame">
        <img
          :src="`${basePath || '/igmplus_wiki'}/images/${classData.sprite}.png`"
          :alt="classData.name"
          class="sprite classSprite"
          width="68"
          height="68"
        />
      </div>

      <div class="cardHeader">
        <div class="cardTitleRow">
          <h3 class="cardTitle">{{ classData.name }}</h3>
          <span class="tierBadge">T{{ classData.tier }}</span>
        </div>

        <div class="cardBadges">
          <span class="badge equipBadge">
            {{ WEAPON_ICONS[classData.weaponType] || classData.weaponType }}
          </span>
          <span class="badge equipBadge">
            {{ ARMOR_ICONS[classData.armorType] || classData.armorType }}
          </span>
          <span v-if="classData.maxLevel" class="badge levelBadge">
            Max Lv.{{ classData.maxLevel }}
          </span>
        </div>
      </div>
    </div>

    <p v-if="classData.description" class="description">
      {{ classData.description }}
    </p>

    <!-- Base Stats -->
    <div v-if="classData.stats" class="statsGrid">
      <div class="statCell">
        <span class="statLabel">HP</span>
        <span class="statVal hp">{{ classData.stats.baseMaxHp ?? classData.stats.maxHp ?? '—' }}</span>
      </div>
      <div class="statCell">
        <span class="statLabel">CON</span>
        <span class="statVal con">{{ classData.stats.baseConstitution ?? '—' }}</span>
      </div>
      <div class="statCell">
        <span class="statLabel">INT</span>
        <span class="statVal int">{{ classData.stats.baseIntelligence ?? '—' }}</span>
      </div>
      <div class="statCell">
        <span class="statLabel">DEX</span>
        <span class="statVal dex">{{ classData.stats.baseDexterity ?? '—' }}</span>
      </div>
      <div class="statCell">
        <span class="statLabel">DEF</span>
        <span class="statVal def">{{ classData.stats.baseDefense ?? '—' }}</span>
      </div>
      <div class="statCell">
        <span class="statLabel">MDEF</span>
        <span class="statVal mdef">{{ classData.stats.baseMagicDefense ?? '—' }}</span>
      </div>
    </div>

    <!-- Skills -->
    <div class="skillsList">
      <div v-if="classData.activeSkill" class="skillRow activeSkill">
        <span class="skillTag">⚡ Active</span>
        <span class="skillName">{{ classData.activeSkill }}</span>
      </div>
      <div v-if="classData.passiveSkill" class="skillRow passiveSkill">
        <span class="skillTag">🛡️ Passive</span>
        <span class="skillName">{{ classData.passiveSkill }}</span>
      </div>
    </div>

    <!-- Promotions -->
    <div v-if="classData.promotesTo?.length || classData.promotesFrom?.length" class="promotions">
      <div v-if="classData.promotesFrom?.length" class="promoLine">
        <span class="promoLabel">From:</span>
        <span class="promoNames">{{ classData.promotesFrom.join(', ') }}</span>
      </div>
      <div v-if="classData.promotesTo?.length" class="promoLine">
        <span class="promoLabel">Promotes to:</span>
        <span class="promoNames">{{ classData.promotesTo.join(', ') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.classCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.classCard:hover {
  transform: translateY(-2px);
  border-color: var(--brand-primary);
}

.cardTop {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.spriteFrame {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.classSprite {
  width: 68px;
  height: 68px;
}

.cardHeader {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.cardTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cardTitle {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.tierBadge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--brand-glow);
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}

.cardBadges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  font-size: 0.75rem;
  padding: 2px 7px;
  border-radius: 4px;
}

.equipBadge {
  background: var(--bg-inset);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.levelBadge {
  background: rgba(245, 158, 11, 0.12);
  color: var(--text-gold);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.description {
  font-size: 0.82rem;
  font-style: italic;
  color: var(--text-muted);
  line-height: 1.35;
  margin: 0;
}

/* Stats */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 4px;
  text-align: center;
}

.statCell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.statLabel {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
}

.statVal {
  font-size: 0.85rem;
  font-weight: 700;
}

.hp { color: #4ade80; }
.con { color: #f97316; }
.int { color: #38bdf8; }
.dex { color: #facc15; }
.def { color: #94a3b8; }
.mdef { color: #c084fc; }

/* Skills */
.skillsList {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  padding: 6px 8px;
}

.skillRow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
}

.skillTag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
}

.activeSkill .skillTag {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}

.passiveSkill .skillTag {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}

.skillName {
  color: var(--text-primary);
  font-weight: 600;
}

/* Promotions */
.promotions {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.78rem;
  border-top: 1px dashed var(--border-subtle);
  padding-top: 6px;
}

.promoLine {
  display: flex;
  gap: 6px;
}

.promoLabel {
  color: var(--text-muted);
  font-weight: 600;
}

.promoNames {
  color: var(--brand-primary);
}
</style>
