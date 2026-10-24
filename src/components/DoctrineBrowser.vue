<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { DoctrineDefinition, DoctrineAbilityDefinition } from '../types';

const props = withDefaults(
  defineProps<{
    doctrines: DoctrineDefinition[];
    abilities: DoctrineAbilityDefinition[];
    basePath?: string;
  }>(),
  {
    basePath: '',
  }
);

// Map of abilities by key
const abilityByKey = computed(() => {
  const map = new Map<string, DoctrineAbilityDefinition>();
  for (const ab of props.abilities) {
    map.set(ab.key, ab);
  }
  return map;
});

// Doctrine Theme Colors & Meta
interface DoctrineMeta {
  color: string;
  accentGlow: string;
  roleTag: string;
  primaryPlaystyle: string;
  recommendedClasses: string[];
}

const DOCTRINE_META: Record<string, DoctrineMeta> = {
  DoctrineOfAffliction: {
    color: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.25)',
    roleTag: 'Lifesteal & Darkness',
    primaryPlaystyle: 'Sacrificial bloodletting, Darkness scaling, and overheal shielding.',
    recommendedClasses: ['Blood Knight', 'Shadow Mage', 'Reaver', 'Vampire Lord', 'Dark Hunter'],
  },
  DoctrineOfControl: {
    color: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    roleTag: 'Crowd Control & Immunities',
    primaryPlaystyle: 'Bypassing enemy immunities, inflicting Freeze, Petrify, and Entangle roots.',
    recommendedClasses: ['Singularity Magus', 'Frost Mage', 'Alchemist', 'Star Weaver', 'Archmage'],
  },
  DoctrineOfFortitude: {
    color: '#eab308',
    accentGlow: 'rgba(234, 179, 8, 0.25)',
    roleTag: 'Defense & Retaliation',
    primaryPlaystyle: 'High threat generation, dual damage retaliation, and amplified armor DEF/MDEF.',
    recommendedClasses: ['Guardian', 'Paladin', 'Ironclad', 'Juggernaut', 'Knight Slime'],
  },
  DoctrineOfGrace: {
    color: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    roleTag: 'Healing & Revival',
    primaryPlaystyle: 'Mass resuscitation chance, overheal barrier shielding, and death-triggered ally heal novae.',
    recommendedClasses: ['Bishop', 'High Priest', 'Cleric', 'Divine Herald', 'White Mage'],
  },
  DoctrineOfIllusion: {
    color: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.25)',
    roleTag: 'Dodge & Trickery',
    primaryPlaystyle: 'Triple-rolled damage variance, False Life damage-negation shields, and evasive counterstrikes.',
    recommendedClasses: ['Rogue', 'Trickster', 'Assassin', 'Duelist', 'Wind Walker'],
  },
  DoctrineOfKnowledge: {
    color: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    roleTag: 'Omni-Stats & Accessories',
    primaryPlaystyle: 'Exalted 4-stat scaling, doubling all accessory statistics, and full skill mana refunds.',
    recommendedClasses: ['Red Mage', 'Battlemage', 'Arcane Archer', 'Outlander', 'All-Rounder Hybrids'],
  },
  DoctrineOfRuin: {
    color: '#f97316',
    accentGlow: 'rgba(249, 115, 22, 0.25)',
    roleTag: 'Hypercarry & Burst Crits',
    primaryPlaystyle: 'Massive Critical multiplier stacking, end-of-turn extra attacks, and high-recoil annihilation.',
    recommendedClasses: ['Assassin', 'Berserker', 'Sniper', 'Dreadnought', 'Chaos Mage'],
  },
  DoctrineOfWar: {
    color: '#ef4444',
    accentGlow: 'rgba(239, 68, 68, 0.25)',
    roleTag: 'Dueling & Weapon Master',
    primaryPlaystyle: 'Armor penetration, forcing enemy counterattacks, universal weapon equipping, and CON-to-DMG scaling.',
    recommendedClasses: ['Titan', 'Weapon Master', 'Swordmaster', 'Gladiator', 'Heavy Bruisers'],
  },
};

// Active State
const activeDoctrineKey = ref<string>('DoctrineOfFortitude');

// LP Simulation State
const simLevel = ref<number>(45);
const simMaxLevel = ref<number>(45);
const simTempleQuest = ref<number>(5);

// User-allocated ability levels per doctrine: Record<doctrineKey, Record<abilityKey, level>>
const allocations = ref<Record<string, Record<string, number>>>({});

// Initialize allocations
function ensureAllocations(doctrineKey: string) {
  if (!allocations.value[doctrineKey]) {
    allocations.value[doctrineKey] = {};
  }
}

// Level-based LP Formula from Adventurer.kt
// ((((maxLevel - 5) * 0.5 * (maxLevel / 5)) + level) / 15) + 3
const levelLoyaltyPoints = computed(() => {
  const maxLvl = Number(simMaxLevel.value) || 45;
  const curLvl = Number(simLevel.value) || 45;
  const effectiveProgress = Math.floor((maxLvl - 5) * 0.5 * (maxLvl / 5)) + curLvl;
  return Math.floor(effectiveProgress / 15) + 3;
});

const totalAvailableLP = computed(() => {
  return levelLoyaltyPoints.value + (Number(simTempleQuest.value) || 0);
});

// Currently selected doctrine object
const currentDoctrine = computed(() => {
  return props.doctrines.find((d) => d.key === activeDoctrineKey.value) || props.doctrines[0];
});

const currentMeta = computed(() => {
  return DOCTRINE_META[currentDoctrine.value?.key] || {
    color: '#6ea8fe',
    accentGlow: 'rgba(110, 168, 254, 0.25)',
    roleTag: 'Temple Doctrine',
    primaryPlaystyle: 'Sacred progression tree.',
    recommendedClasses: [],
  };
});

// Abilities belonging to the current doctrine
const currentAbilities = computed(() => {
  if (!currentDoctrine.value) return [];
  return (currentDoctrine.value.abilities || [])
    .map((k) => abilityByKey.value.get(k))
    .filter(Boolean) as DoctrineAbilityDefinition[];
});

// Group abilities by row
const row1Abilities = computed(() => currentAbilities.value.filter((a) => a.row === 1));
const row2Abilities = computed(() => currentAbilities.value.filter((a) => a.row === 2));
const row3Abilities = computed(() => currentAbilities.value.filter((a) => a.row === 3));

// Get allocated level for an ability in current doctrine
function getAbilityLevel(doctrineKey: string, abilityKey: string): number {
  return allocations.value[doctrineKey]?.[abilityKey] ?? 0;
}

// Set ability level with safety checks
function setAbilityLevel(doctrineKey: string, abilityKey: string, level: number) {
  ensureAllocations(doctrineKey);
  const ab = abilityByKey.value.get(abilityKey);
  if (!ab) return;
  const clamped = Math.max(0, Math.min(ab.max_level, level));
  allocations.value[doctrineKey][abilityKey] = clamped;
}

function incrementAbility(doctrineKey: string, abilityKey: string) {
  const current = getAbilityLevel(doctrineKey, abilityKey);
  const ab = abilityByKey.value.get(abilityKey);
  if (!ab || current >= ab.max_level) return;
  setAbilityLevel(doctrineKey, abilityKey, current + 1);
}

function decrementAbility(doctrineKey: string, abilityKey: string) {
  const current = getAbilityLevel(doctrineKey, abilityKey);
  if (current <= 0) return;
  setAbilityLevel(doctrineKey, abilityKey, current - 1);
}

// Calculate total spent LP for active doctrine
const totalSpentLP = computed(() => {
  const docKey = currentDoctrine.value?.key;
  if (!docKey || !allocations.value[docKey]) return 0;
  let spent = 0;
  for (const ab of currentAbilities.value) {
    const lvl = allocations.value[docKey][ab.key] ?? 0;
    spent += lvl * ab.cost;
  }
  return spent;
});

const remainingLP = computed(() => totalAvailableLP.value - totalSpentLP.value);

// Max all abilities in active doctrine
function maxAllAllocations() {
  const docKey = currentDoctrine.value?.key;
  if (!docKey) return;
  ensureAllocations(docKey);
  for (const ab of currentAbilities.value) {
    allocations.value[docKey][ab.key] = ab.max_level;
  }
}

// Reset active doctrine allocations
function resetAllocations() {
  const docKey = currentDoctrine.value?.key;
  if (!docKey) return;
  allocations.value[docKey] = {};
}

// Total LP required to max the entire tree
const totalLPToMaxTree = computed(() => {
  return currentAbilities.value.reduce((acc, ab) => acc + ab.cost * ab.max_level, 0);
});

// Format ability descriptions dynamically based on level
function formatAbilityDesc(ab: DoctrineAbilityDefinition, level: number): string {
  if (ab.format_mode === 0) {
    return ab.description;
  }

  const isMax = level >= ab.max_level;

  if (ab.format_mode === 1) {
    const totalVal = ab.increase_per_level * level;
    const incArg = isMax ? '' : ` (+${ab.increase_per_level})`;
    const formatted = level === 0 
      ? `0 (+${ab.increase_per_level})`
      : isMax 
        ? `${totalVal}` 
        : `${totalVal}${incArg}`;
    return ab.description.replace('%s', formatted);
  }

  if (ab.format_mode === 2) {
    const totalVal = ab.increase_per_level * level;
    const incArg = isMax ? '' : ` (+${ab.increase_per_level}%)`;
    const formatted = level === 0 
      ? `0% (+${ab.increase_per_level}%)` 
      : isMax 
        ? `${totalVal}%` 
        : `${totalVal}%${incArg}`;
    return ab.description.replace('%s', formatted);
  }

  if (ab.format_mode === 3) {
    const totalVal = (ab.increase_per_level * level * 0.1).toFixed(1);
    const incVal = (ab.increase_per_level * 0.1).toFixed(1);
    const incArg = isMax ? '' : ` (+${incVal}%)`;
    const formatted = level === 0 
      ? `0% (+${incVal}%)` 
      : isMax 
        ? `${totalVal}%` 
        : `${totalVal}%${incArg}`;
    return ab.description.replace('%s', formatted);
  }

  return ab.description;
}

// Select doctrine and update URL hash
function selectDoctrine(key: string) {
  activeDoctrineKey.value = key;
  if (typeof window !== 'undefined') {
    window.location.hash = key;
  }
}

// Synchronize with URL hash on mount
onMounted(() => {
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.replace('#', '');
    const matched = props.doctrines.find(
      (d) => d.key.toLowerCase() === hash.toLowerCase() || d.key.replace('DoctrineOf', '').toLowerCase() === hash.toLowerCase()
    );
    if (matched) {
      activeDoctrineKey.value = matched.key;
    }
  }
});
</script>

<template>
  <div class="doctrineBrowser">
    <!-- Compact Doctrine Selector Tabs -->
    <div class="doctrineSelectorWrapper">
      <button
        v-for="doc in doctrines"
        :key="doc.key"
        class="doctrineTabBtn"
        :class="{ active: activeDoctrineKey === doc.key }"
        :style="{
          '--doc-color': DOCTRINE_META[doc.key]?.color || 'var(--brand-primary)',
          '--doc-glow': DOCTRINE_META[doc.key]?.accentGlow || 'var(--brand-glow)'
        }"
        @click="selectDoctrine(doc.key)"
      >
        <img
          :src="`${basePath}/images/${doc.sprite}.png`"
          :alt="doc.name"
          class="doctrineTabSprite sprite"
          width="24"
          height="24"
        />
        <div class="doctrineTabInfo">
          <span class="doctrineTabName">{{ doc.name.replace('Doctrine of ', '') }}</span>
        </div>
      </button>
    </div>

    <!-- Loyalty Points Simulation Bar -->
    <div class="calculatorBar">
      <div class="calcHeader">
        <div class="calcTitle">
          <span class="calcIcon">⚡</span>
          <h3>Loyalty Points (LP) Builder Sandbox</h3>
        </div>
        <div class="calcActions">
          <button class="actionBtn maxBtn" @click="maxAllAllocations">Max Entire Tree</button>
          <button class="actionBtn resetBtn" @click="resetAllocations">Reset Points</button>
        </div>
      </div>

      <div class="calcControlsGrid">
        <div class="controlItem">
          <label>Adventurer Level: <strong>{{ simLevel }}</strong></label>
          <input v-model.number="simLevel" type="range" min="1" max="45" step="1" />
          <span class="controlSub">1 - 45</span>
        </div>

        <div class="controlItem">
          <label>Class Promotion Tier: <strong>Tier {{ Math.ceil(simMaxLevel / 5) }} (Max Lvl {{ simMaxLevel }})</strong></label>
          <select v-model.number="simMaxLevel" class="tierSelect">
            <option :value="20">Tier 4 (Max Lvl 20)</option>
            <option :value="25">Tier 5 (Max Lvl 25)</option>
            <option :value="30">Tier 6 (Max Lvl 30)</option>
            <option :value="35">Tier 7 (Max Lvl 35)</option>
            <option :value="40">Tier 8 (Max Lvl 40)</option>
            <option :value="45">Tier 9 (Max Lvl 45)</option>
          </select>
          <span class="controlSub">Determines level progression curve</span>
        </div>

        <div class="controlItem">
          <label>Temple Quest Level: <strong>+{{ simTempleQuest }} LP</strong></label>
          <input v-model.number="simTempleQuest" type="range" min="0" max="10" step="1" />
          <span class="controlSub">Max 10 LP (+1 LP per quest level completed)</span>
        </div>

        <div class="lpSummaryBox">
          <div class="lpStat">
            <span class="lpLabel">Available LP:</span>
            <span class="lpVal text-available">{{ totalAvailableLP }}</span>
          </div>
          <div class="lpStat">
            <span class="lpLabel">Remaining:</span>
            <span class="lpVal" :class="remainingLP < 0 ? 'text-over' : 'text-remaining'">
              {{ remainingLP }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tree Section: 3 Tiers -->
    <div class="treeSection">
      <!-- Row 1: Core Stat Attributes -->
      <div class="tierRow">
        <div class="rowHeader">
          <span class="tierBadge">Tier 1</span>
          <h4>Core Stat Attributes</h4>
          <span class="tierDesc">Primary foundation nodes enhancing baseline statistics.</span>
        </div>
        <div class="abilityCardsGrid">
          <div
            v-for="ab in row1Abilities"
            :key="ab.key"
            class="abilityCard"
            :class="{
              allocated: getAbilityLevel(currentDoctrine.key, ab.key) > 0,
              maxed: getAbilityLevel(currentDoctrine.key, ab.key) === ab.max_level
            }"
          >
            <div class="cardTop">
              <img
                :src="`${basePath}/images/${ab.sprite}.png`"
                :alt="ab.name"
                class="abilitySprite sprite"
                width="32"
                height="32"
              />
              <div class="cardCostBadge">{{ ab.cost }} LP/lvl</div>
            </div>
            <div class="cardName">{{ ab.name }}</div>
            <div class="cardLevelRow">
              <button
                class="levelBtn minusBtn"
                :disabled="getAbilityLevel(currentDoctrine.key, ab.key) <= 0"
                @click.stop="decrementAbility(currentDoctrine.key, ab.key)"
              >
                −
              </button>
              <span class="levelText">
                Lvl <strong>{{ getAbilityLevel(currentDoctrine.key, ab.key) }}</strong> / {{ ab.max_level }}
              </span>
              <button
                class="levelBtn plusBtn"
                :disabled="getAbilityLevel(currentDoctrine.key, ab.key) >= ab.max_level"
                @click.stop="incrementAbility(currentDoctrine.key, ab.key)"
              >
                +
              </button>
            </div>
            <div class="cardDescPreview">
              {{ formatAbilityDesc(ab, getAbilityLevel(currentDoctrine.key, ab.key)) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Tactical Passives -->
      <div class="tierRow">
        <div class="rowHeader">
          <span class="tierBadge">Tier 2</span>
          <h4>Tactical Passives & Defenses</h4>
          <span class="tierDesc">Combat utilities, resistances, and secondary scaling triggers.</span>
        </div>
        <div class="abilityCardsGrid">
          <div
            v-for="ab in row2Abilities"
            :key="ab.key"
            class="abilityCard"
            :class="{
              allocated: getAbilityLevel(currentDoctrine.key, ab.key) > 0,
              maxed: getAbilityLevel(currentDoctrine.key, ab.key) === ab.max_level
            }"
          >
            <div class="cardTop">
              <img
                :src="`${basePath}/images/${ab.sprite}.png`"
                :alt="ab.name"
                class="abilitySprite sprite"
                width="32"
                height="32"
              />
              <div class="cardCostBadge">{{ ab.cost }} LP/lvl</div>
            </div>
            <div class="cardName">{{ ab.name }}</div>
            <div class="cardLevelRow">
              <button
                class="levelBtn minusBtn"
                :disabled="getAbilityLevel(currentDoctrine.key, ab.key) <= 0"
                @click.stop="decrementAbility(currentDoctrine.key, ab.key)"
              >
                −
              </button>
              <span class="levelText">
                Lvl <strong>{{ getAbilityLevel(currentDoctrine.key, ab.key) }}</strong> / {{ ab.max_level }}
              </span>
              <button
                class="levelBtn plusBtn"
                :disabled="getAbilityLevel(currentDoctrine.key, ab.key) >= ab.max_level"
                @click.stop="incrementAbility(currentDoctrine.key, ab.key)"
              >
                +
              </button>
            </div>
            <div class="cardDescPreview">
              {{ formatAbilityDesc(ab, getAbilityLevel(currentDoctrine.key, ab.key)) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: Keystones & 7th Expansion Ability -->
      <div class="tierRow">
        <div class="rowHeader">
          <span class="tierBadge goldBadge">Tier 3</span>
          <h4>Keystones & Expansion Abilities</h4>
          <span class="tierDesc">Capstones and the v1.3.17.3 Temple Doctrine expansion nodes.</span>
        </div>
        <div class="abilityCardsGrid">
          <div
            v-for="ab in row3Abilities"
            :key="ab.key"
            class="abilityCard"
            :class="{
              allocated: getAbilityLevel(currentDoctrine.key, ab.key) > 0,
              maxed: getAbilityLevel(currentDoctrine.key, ab.key) === ab.max_level,
              expansionCard: ab === row3Abilities[row3Abilities.length - 1]
            }"
          >
            <div class="cardTop">
              <img
                :src="`${basePath}/images/${ab.sprite}.png`"
                :alt="ab.name"
                class="abilitySprite sprite"
                width="32"
                height="32"
              />
              <div class="cardCostBadge">{{ ab.cost }} LP/lvl</div>
            </div>
            <div class="cardName">
              {{ ab.name }}
            </div>
            <div class="cardLevelRow">
              <button
                class="levelBtn minusBtn"
                :disabled="getAbilityLevel(currentDoctrine.key, ab.key) <= 0"
                @click.stop="decrementAbility(currentDoctrine.key, ab.key)"
              >
                −
              </button>
              <span class="levelText">
                Lvl <strong>{{ getAbilityLevel(currentDoctrine.key, ab.key) }}</strong> / {{ ab.max_level }}
              </span>
              <button
                class="levelBtn plusBtn"
                :disabled="getAbilityLevel(currentDoctrine.key, ab.key) >= ab.max_level"
                @click.stop="incrementAbility(currentDoctrine.key, ab.key)"
              >
                +
              </button>
            </div>
            <div class="cardDescPreview">
              {{ formatAbilityDesc(ab, getAbilityLevel(currentDoctrine.key, ab.key)) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mechanics Guide & Rules -->
    <section class="mechanicsExplainer">
      <h3>Doctrines System & Progression Rules</h3>
      <div class="rulesGrid">
        <div class="ruleCard">
          <div class="ruleCardHeader">
            <span class="ruleIcon">🏛️</span>
            <h4>Ascension Requirement</h4>
          </div>
          <p>
            Doctrines are exclusive to <strong>Ascended</strong> adventurers. An adventurer can ascend by reaching max level or through an <strong>Intercession</strong> consumable. Ascended adventurers gain access to the Temple Doctrine tree and increased base stats, but require twice the experience to level up.
          </p>
        </div>

        <div class="ruleCard">
          <div class="ruleCardHeader">
            <span class="ruleIcon">📜</span>
            <h4>Loyalty Points Formula</h4>
          </div>
          <p>
            Loyalty Points (LP) are generated through two sources:
          </p>
          <ul class="ruleList">
            <li><strong>Base & Level Progression:</strong> <code>(((maxLevel - 5) * 0.5 * (maxLevel / 5) + level) / 15) + 3</code> (starts at 3 base LP, gaining +1 LP every 15 effective progress points).</li>
            <li><strong>Guild Temple Quests:</strong> Every quest tier completed in that doctrine grants +1 LP across all followers.</li>
          </ul>
        </div>

        <div class="ruleCard">
          <div class="ruleCardHeader">
            <span class="ruleIcon">🔄</span>
            <h4>Non-Destructive Respecs</h4>
          </div>
          <p>
            Adventurers can freely reset their invested Loyalty Points at any time from their character sheet. All invested LP is immediately refunded into their available pool without penalty or gold cost.
          </p>
        </div>

        <div class="ruleCard">
          <div class="ruleCardHeader">
            <span class="ruleIcon">🌟</span>
            <h4>7th Node Expansion (v1.3.17.3)</h4>
          </div>
          <p>
            In update v1.3.17.3, every one of the 8 Temple Doctrines received a dedicated 7th ability node (e.g. Bloodletting, Verdant Briars, Armor Master, Titans Might), offering build-defining end-game synergies.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.doctrineBrowser {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Compact Doctrine Selector Tabs */
.doctrineSelectorWrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.4rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.4rem;
}

.doctrineTabBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.45rem 0.65rem;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
}

.doctrineTabBtn:hover {
  background: var(--bg-card-hover);
  border-color: var(--doc-color);
}

.doctrineTabBtn.active {
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(20, 28, 42, 0.95) 100%);
  border-color: var(--doc-color);
  box-shadow: 0 0 8px var(--doc-glow);
}

.doctrineTabBtn.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--doc-color);
}

.doctrineTabSprite {
  flex-shrink: 0;
}

.doctrineTabInfo {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.doctrineTabName {
  font-weight: 700;
  font-size: 0.8rem;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doctrineTabSub {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Calculator Bar */
.calculatorBar {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.calcHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.4rem;
}

.calcTitle {
  display: flex;
  align-items: center;
  gap: 6px;
}

.calcTitle h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #f1f5f9;
}

.calcActions {
  display: flex;
  gap: 0.4rem;
}

.actionBtn {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 5px;
  padding: 0.25rem 0.65rem;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.actionBtn:hover {
  background: var(--bg-card-hover);
  color: #f1f5f9;
}

.maxBtn:hover {
  border-color: #10b981;
  color: #34d399;
}

.resetBtn:hover {
  border-color: #ef4444;
  color: #f87171;
}

.calcControlsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  align-items: center;
}

.controlItem {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.controlItem label {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.controlItem label strong {
  color: #f1f5f9;
}

.controlItem input[type="range"] {
  width: 100%;
  accent-color: var(--brand-primary);
  cursor: pointer;
}

.tierSelect {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 0.35rem 0.55rem;
  color: #f1f5f9;
  font-size: 0.8rem;
  outline: none;
}

.controlSub {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.lpSummaryBox {
  background: var(--bg-inset);
  border: 1px solid var(--border-card);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  display: flex;
  justify-content: space-around;
  gap: 0.6rem;
}

.lpStat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lpLabel {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.lpVal {
  font-size: 1.05rem;
  font-weight: 800;
}

.text-available {
  color: #38bdf8;
}

.text-spent {
  color: #f59e0b;
}

.text-remaining {
  color: #10b981;
}

.text-over {
  color: #ef4444;
}

/* Tree Section */
.treeSection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tierRow {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.rowHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.35rem;
}

.tierBadge {
  background: rgba(110, 168, 254, 0.15);
  border: 1px solid rgba(110, 168, 254, 0.35);
  color: var(--brand-primary);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 4px;
}

.goldBadge {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(234, 179, 8, 0.4);
  color: #eab308;
}

.rowHeader h4 {
  margin: 0;
  font-size: 0.92rem;
  color: #f1f5f9;
}

.tierDesc {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.abilityCardsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.6rem;
}

.abilityCard {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: all 0.15s ease;
  position: relative;
}

.abilityCard:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-focus);
}

.abilityCard.allocated {
  border-color: #38bdf8;
  background: linear-gradient(180deg, var(--bg-inset) 0%, rgba(56, 189, 248, 0.05) 100%);
}

.abilityCard.maxed {
  border-color: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.15);
}

.cardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.abilitySprite {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 4px;
  padding: 1px;
}

.cardCostBadge {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
}

.cardName {
  font-weight: 700;
  font-size: 0.82rem;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 4px;
}

.vModTag {
  font-size: 0.58rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 1px 3px;
  border-radius: 3px;
}

.cardLevelRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  padding: 2px 5px;
}

.levelBtn {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f1f5f9;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.12s ease;
}

.levelBtn:hover:not(:disabled) {
  background: var(--brand-primary);
  color: #0f1319;
}

.levelBtn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.levelText {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.levelText strong {
  color: #f1f5f9;
}

.cardDescPreview {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

/* Mechanics Section */
.mechanicsExplainer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mechanicsExplainer h3 {
  margin: 0;
  font-size: 1.25rem;
}

.rulesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.ruleCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ruleCardHeader {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ruleIcon {
  font-size: 1.2rem;
}

.ruleCardHeader h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #f1f5f9;
}

.ruleCard p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.ruleList {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ruleList code {
  background: var(--bg-inset);
  padding: 1px 4px;
  border-radius: 3px;
  color: #38bdf8;
  font-size: 0.75rem;
}
</style>
