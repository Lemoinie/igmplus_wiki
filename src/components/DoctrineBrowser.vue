<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
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
const selectedAbilityKey = ref<string | null>(null);

// Search & Filter
const searchQuery = ref('');
const activeFilterCategory = ref<'all' | 'offense' | 'defense' | 'utility' | 'stat'>('all');

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

// Currently selected ability
const selectedAbility = computed(() => {
  if (!selectedAbilityKey.value) return currentAbilities.value[0] || null;
  return abilityByKey.value.get(selectedAbilityKey.value) || currentAbilities.value[0] || null;
});

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
  selectedAbilityKey.value = abilityKey;
}

function decrementAbility(doctrineKey: string, abilityKey: string) {
  const current = getAbilityLevel(doctrineKey, abilityKey);
  if (current <= 0) return;
  setAbilityLevel(doctrineKey, abilityKey, current - 1);
  selectedAbilityKey.value = abilityKey;
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
    // Flat value
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
    // Percentage value
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
    // Decimal percentage value (increasePerLevel * 0.1)
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

// Generate progression steps for ability progression table
interface ProgressionStep {
  level: number;
  valueStr: string;
  cumulativeCost: number;
}

function getProgressionSteps(ab: DoctrineAbilityDefinition): ProgressionStep[] {
  const steps: ProgressionStep[] = [];
  for (let lvl = 1; lvl <= ab.max_level; lvl++) {
    let valStr = '';
    if (ab.format_mode === 0) {
      valStr = 'Active';
    } else if (ab.format_mode === 1) {
      valStr = `+${ab.increase_per_level * lvl}`;
    } else if (ab.format_mode === 2) {
      valStr = `+${ab.increase_per_level * lvl}%`;
    } else if (ab.format_mode === 3) {
      valStr = `+${(ab.increase_per_level * lvl * 0.1).toFixed(1)}%`;
    }
    steps.push({
      level: lvl,
      valueStr: valStr,
      cumulativeCost: lvl * ab.cost,
    });
  }
  return steps;
}

// Search across all doctrines and abilities
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];

  const results: Array<{
    doctrine: DoctrineDefinition;
    ability: DoctrineAbilityDefinition;
  }> = [];

  for (const doc of props.doctrines) {
    for (const abKey of doc.abilities || []) {
      const ab = abilityByKey.value.get(abKey);
      if (!ab) continue;
      const matchDoc = doc.name.toLowerCase().includes(q);
      const matchAbName = ab.name.toLowerCase().includes(q);
      const matchAbDesc = ab.description.toLowerCase().includes(q);
      if (matchDoc || matchAbName || matchAbDesc) {
        results.push({ doctrine: doc, ability: ab });
      }
    }
  }

  return results;
});

// Select doctrine and update URL hash
function selectDoctrine(key: string) {
  activeDoctrineKey.value = key;
  selectedAbilityKey.value = null;
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
    <!-- Top Search & Quick Jump -->
    <div class="searchRow">
      <div class="searchWrapper">
        <span class="searchIcon">🔍</span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search doctrine abilities, stats, effects (e.g. dodge, crit, lifesteal, armor, entangle, mana refund)..."
          class="searchInput"
        />
        <button v-if="searchQuery" class="clearBtn" @click="searchQuery = ''">✕</button>
      </div>
    </div>

    <!-- Live Search Results Dropdown -->
    <div v-if="searchQuery.trim()" class="searchResultsPanel">
      <div class="searchHeader">
        <span>Found {{ searchResults.length }} matching ability nodes</span>
      </div>
      <div v-if="searchResults.length === 0" class="noResults">
        No doctrine abilities found matching "{{ searchQuery }}".
      </div>
      <div v-else class="searchResultsList">
        <div
          v-for="res in searchResults"
          :key="`${res.doctrine.key}-${res.ability.key}`"
          class="searchResultItem"
          @click="selectDoctrine(res.doctrine.key); selectedAbilityKey = res.ability.key; searchQuery = ''"
        >
          <img
            :src="`${basePath}/images/${res.ability.sprite}.png`"
            :alt="res.ability.name"
            class="resultSprite sprite"
            width="28"
            height="28"
          />
          <div class="resultText">
            <div class="resultTitle">
              <strong>{{ res.ability.name }}</strong>
              <span class="doctrineBadge" :style="{ borderColor: DOCTRINE_META[res.doctrine.key]?.color, color: DOCTRINE_META[res.doctrine.key]?.color }">
                {{ res.doctrine.name }}
              </span>
            </div>
            <div class="resultDesc">{{ formatAbilityDesc(res.ability, res.ability.max_level) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Doctrine Tab Selector -->
    <div class="doctrineTabsGrid">
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
          width="36"
          height="36"
        />
        <div class="doctrineTabInfo">
          <span class="doctrineTabName">{{ doc.name.replace('Doctrine of ', '') }}</span>
          <span class="doctrineTabSub">{{ DOCTRINE_META[doc.key]?.roleTag || 'Temple Doctrine' }}</span>
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
          <input v-model.number="simTempleQuest" type="range" min="0" max="25" step="1" />
          <span class="controlSub">+1 LP per quest level completed</span>
        </div>

        <div class="lpSummaryBox">
          <div class="lpStat">
            <span class="lpLabel">Available LP:</span>
            <span class="lpVal text-available">{{ totalAvailableLP }}</span>
          </div>
          <div class="lpStat">
            <span class="lpLabel">Spent LP:</span>
            <span class="lpVal text-spent">{{ totalSpentLP }} / {{ totalLPToMaxTree }}</span>
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

    <!-- Active Doctrine Hero Banner -->
    <div
      class="doctrineHeroCard"
      :style="{
        '--active-color': currentMeta.color,
        '--active-glow': currentMeta.accentGlow
      }"
    >
      <div class="heroLeft">
        <div class="doctrineArtBox">
          <img
            :src="`${basePath}/images/${currentDoctrine.sprite}.png`"
            :alt="currentDoctrine.name"
            class="heroSprite sprite"
            width="72"
            height="72"
          />
        </div>
        <div class="heroMeta">
          <div class="badgeGroup">
            <span class="roleBadge">{{ currentMeta.roleTag }}</span>
            <span class="totalNodesBadge">7 Ability Nodes</span>
            <span class="costBadge">Requires Ascension</span>
          </div>
          <h2>{{ currentDoctrine.name }}</h2>
          <p class="doctrineShort">{{ currentDoctrine.description_short }}</p>
          <p class="doctrineLore">{{ currentDoctrine.description }}</p>

          <div class="synergyRow">
            <span class="synergyLabel">Top Synergies:</span>
            <div class="synergyPills">
              <span v-for="cls in currentMeta.recommendedClasses" :key="cls" class="synergyPill">
                {{ cls }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Ability Tree (3 Rows matching in-game dialog) -->
    <div class="treeSection">
      <div class="treeHeader">
        <h3>Sacred Ability Tree & Node Progression</h3>
        <p>
          Allocate Loyalty Points into nodes across 3 tiers. Click on any ability card to inspect full progression scaling and combat details.
        </p>
      </div>

      <div class="rowsContainer">
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
                selected: selectedAbility?.key === ab.key,
                allocated: getAbilityLevel(currentDoctrine.key, ab.key) > 0,
                maxed: getAbilityLevel(currentDoctrine.key, ab.key) === ab.max_level
              }"
              @click="selectedAbilityKey = ab.key"
            >
              <div class="cardTop">
                <img
                  :src="`${basePath}/images/${ab.sprite}.png`"
                  :alt="ab.name"
                  class="abilitySprite sprite"
                  width="40"
                  height="40"
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
                selected: selectedAbility?.key === ab.key,
                allocated: getAbilityLevel(currentDoctrine.key, ab.key) > 0,
                maxed: getAbilityLevel(currentDoctrine.key, ab.key) === ab.max_level
              }"
              @click="selectedAbilityKey = ab.key"
            >
              <div class="cardTop">
                <img
                  :src="`${basePath}/images/${ab.sprite}.png`"
                  :alt="ab.name"
                  class="abilitySprite sprite"
                  width="40"
                  height="40"
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
            <h4>Keystones & 7th Expansion Abilities</h4>
            <span class="tierDesc">Build-defining capstones and the v1.3.17.3 Temple Doctrine expansion nodes.</span>
          </div>
          <div class="abilityCardsGrid">
            <div
              v-for="ab in row3Abilities"
              :key="ab.key"
              class="abilityCard"
              :class="{
                selected: selectedAbility?.key === ab.key,
                allocated: getAbilityLevel(currentDoctrine.key, ab.key) > 0,
                maxed: getAbilityLevel(currentDoctrine.key, ab.key) === ab.max_level,
                expansionCard: ab === row3Abilities[row3Abilities.length - 1]
              }"
              @click="selectedAbilityKey = ab.key"
            >
              <div class="cardTop">
                <img
                  :src="`${basePath}/images/${ab.sprite}.png`"
                  :alt="ab.name"
                  class="abilitySprite sprite"
                  width="40"
                  height="40"
                />
                <div class="cardCostBadge">{{ ab.cost }} LP/lvl</div>
              </div>
              <div class="cardName">
                {{ ab.name }}
                <span v-if="ab === row3Abilities[row3Abilities.length - 1]" class="vModTag">v1.3.17+</span>
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

      <!-- Selected Ability Inspector Card -->
      <div v-if="selectedAbility" class="abilityInspectorCard">
        <div class="inspectorHeader">
          <img
            :src="`${basePath}/images/${selectedAbility.sprite}.png`"
            :alt="selectedAbility.name"
            class="inspectorSprite sprite"
            width="56"
            height="56"
          />
          <div class="inspectorHeaderInfo">
            <div class="inspectorRowBadge">Row {{ selectedAbility.row }} Ability</div>
            <h4>{{ selectedAbility.name }}</h4>
            <div class="inspectorMetaStats">
              <span>Cost: <strong>{{ selectedAbility.cost }} LP / lvl</strong></span>
              <span>Max Level: <strong>{{ selectedAbility.max_level }}</strong></span>
              <span>Total to Max: <strong>{{ selectedAbility.cost * selectedAbility.max_level }} LP</strong></span>
              <span>Allocated: <strong>Lvl {{ getAbilityLevel(currentDoctrine.key, selectedAbility.key) }}</strong></span>
            </div>
          </div>
        </div>

        <div class="inspectorBody">
          <!-- Dynamic Description Box -->
          <div class="descBox">
            <div class="descBoxLabel">Current In-Game Effect:</div>
            <div class="descBoxText">
              {{ formatAbilityDesc(selectedAbility, getAbilityLevel(currentDoctrine.key, selectedAbility.key)) }}
            </div>
          </div>

          <!-- Progression Table -->
          <div class="progressionWrapper">
            <div class="progressionTitle">Progression by Level</div>
            <table class="progressionTable">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Bonus Effect</th>
                  <th>LP Cost</th>
                  <th>Cumulative Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="step in getProgressionSteps(selectedAbility)"
                  :key="step.level"
                  :class="{ activeRow: getAbilityLevel(currentDoctrine.key, selectedAbility.key) === step.level }"
                >
                  <td><strong>Lvl {{ step.level }}</strong></td>
                  <td><span class="effectVal">{{ step.valueStr }}</span></td>
                  <td>{{ selectedAbility.cost }} LP</td>
                  <td>{{ step.cumulativeCost }} LP</td>
                  <td>
                    <span v-if="getAbilityLevel(currentDoctrine.key, selectedAbility.key) >= step.level" class="statusActive">
                      ✓ Active
                    </span>
                    <span v-else class="statusInactive">
                      Inactive
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Doctrines Comparison Matrix Section -->
    <section class="comparisonSection">
      <div class="compHeader">
        <h3>Temple Doctrines Comparison Matrix</h3>
        <p>Side-by-side reference of all 8 Temple Doctrines, their core archetypes, capstones, and 7th expansion additions.</p>
      </div>

      <div class="tableOverflow">
        <table class="compTable">
          <thead>
            <tr>
              <th>Doctrine</th>
              <th>Archetype & Focus</th>
              <th>Key Strengths</th>
              <th>7th Node (v1.3.17.3)</th>
              <th>Max LP Cost</th>
              <th>Recommended Synergies</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="doc in doctrines"
              :key="doc.key"
              :class="{ highlightedRow: doc.key === activeDoctrineKey }"
              @click="selectDoctrine(doc.key)"
            >
              <td class="doctrineCell">
                <img
                  :src="`${basePath}/images/${doc.sprite}.png`"
                  :alt="doc.name"
                  class="compSprite sprite"
                  width="28"
                  height="28"
                />
                <strong>{{ doc.name.replace('Doctrine of ', '') }}</strong>
              </td>
              <td>
                <span class="rolePill" :style="{ borderColor: DOCTRINE_META[doc.key]?.color, color: DOCTRINE_META[doc.key]?.color }">
                  {{ DOCTRINE_META[doc.key]?.roleTag }}
                </span>
                <div class="cellSub">{{ doc.description_short }}</div>
              </td>
              <td>{{ DOCTRINE_META[doc.key]?.primaryPlaystyle }}</td>
              <td>
                <span class="expansionNodeBadge">
                  {{ doc.abilities[doc.abilities.length - 1]?.replace(/_/g, ' ') }}
                </span>
              </td>
              <td class="numericCell">
                {{
                  (doc.abilities || [])
                    .map((k) => abilityByKey.get(k))
                    .filter(Boolean)
                    .reduce((sum, a) => sum + (a ? a.cost * a.max_level : 0), 0)
                }} LP
              </td>
              <td>
                <div class="classPillsCompact">
                  <span
                    v-for="cls in (DOCTRINE_META[doc.key]?.recommendedClasses || []).slice(0, 3)"
                    :key="cls"
                    class="classPill"
                  >
                    {{ cls }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

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
  gap: 1.75rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Search */
.searchRow {
  display: flex;
  gap: 1rem;
}

.searchWrapper {
  position: relative;
  flex: 1;
}

.searchIcon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.95rem;
  color: var(--text-muted);
}

.searchInput {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.75rem 2.2rem 0.75rem 2.3rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.searchInput:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--brand-glow);
}

.clearBtn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9rem;
}

.searchResultsPanel {
  background: var(--bg-card);
  border: 1px solid var(--border-focus);
  border-radius: 8px;
  padding: 0.75rem;
  max-height: 380px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.searchHeader {
  font-size: 0.8rem;
  color: var(--brand-primary);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.noResults {
  color: var(--text-muted);
  padding: 0.75rem;
  text-align: center;
}

.searchResultsList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.searchResultItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: all 0.15s ease;
}

.searchResultItem:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-focus);
}

.resultTitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.doctrineBadge {
  font-size: 0.7rem;
  border: 1px solid;
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 600;
}

.resultDesc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Tabs */
.doctrineTabsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.65rem;
}

.doctrineTabBtn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  position: relative;
  overflow: hidden;
}

.doctrineTabBtn:hover {
  background: var(--bg-card-hover);
  border-color: var(--doc-color);
  transform: translateY(-1px);
}

.doctrineTabBtn.active {
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(20, 28, 42, 0.95) 100%);
  border-color: var(--doc-color);
  box-shadow: 0 4px 14px var(--doc-glow);
}

.doctrineTabBtn.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--doc-color);
}

.doctrineTabInfo {
  display: flex;
  flex-direction: column;
}

.doctrineTabName {
  font-weight: 700;
  font-size: 0.92rem;
  color: #f1f5f9;
}

.doctrineTabSub {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Calculator Bar */
.calculatorBar {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1.15rem 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calcHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.65rem;
}

.calcTitle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calcTitle h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f1f5f9;
}

.calcActions {
  display: flex;
  gap: 0.5rem;
}

.actionBtn {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 0.35rem 0.85rem;
  font-size: 0.78rem;
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
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1.25rem;
  align-items: center;
}

.controlItem {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.controlItem label {
  font-size: 0.82rem;
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
  padding: 0.4rem 0.6rem;
  color: #f1f5f9;
  font-size: 0.82rem;
  outline: none;
}

.controlSub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.lpSummaryBox {
  background: var(--bg-inset);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-around;
  gap: 0.75rem;
}

.lpStat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lpLabel {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.lpVal {
  font-size: 1.15rem;
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

/* Doctrine Hero Card */
.doctrineHeroCard {
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid var(--border-card);
  border-left: 4px solid var(--active-color);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 18px var(--active-glow);
}

.heroLeft {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.doctrineArtBox {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.heroMeta {
  flex: 1;
  min-width: 280px;
}

.badgeGroup {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.roleBadge {
  background: var(--active-glow);
  color: var(--active-color);
  border: 1px solid var(--active-color);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.totalNodesBadge,
.costBadge {
  background: var(--bg-inset);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.heroMeta h2 {
  font-size: 1.7rem;
  margin: 0 0 0.35rem 0;
  border-bottom: none;
  padding-bottom: 0;
}

.doctrineShort {
  font-weight: 600;
  color: #cbd5e1;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.doctrineLore {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 0.85rem;
}

.synergyRow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.synergyLabel {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.synergyPills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.synergyPill {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--brand-primary);
}

/* Tree Section */
.treeSection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.treeHeader h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.35rem;
}

.treeHeader p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.rowsContainer {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tierRow {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rowHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.5rem;
}

.tierBadge {
  background: rgba(110, 168, 254, 0.15);
  border: 1px solid rgba(110, 168, 254, 0.35);
  color: var(--brand-primary);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.goldBadge {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(234, 179, 8, 0.4);
  color: #eab308;
}

.rowHeader h4 {
  margin: 0;
  font-size: 1.05rem;
  color: #f1f5f9;
}

.tierDesc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.abilityCardsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.abilityCard {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
}

.abilityCard:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-focus);
  transform: translateY(-2px);
}

.abilityCard.selected {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 2px var(--brand-glow);
}

.abilityCard.allocated {
  border-color: #38bdf8;
  background: linear-gradient(180deg, var(--bg-inset) 0%, rgba(56, 189, 248, 0.05) 100%);
}

.abilityCard.maxed {
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
}

.cardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.abilitySprite {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 6px;
  padding: 3px;
}

.cardCostBadge {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.cardName {
  font-weight: 700;
  font-size: 0.92rem;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 6px;
}

.vModTag {
  font-size: 0.65rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 1px 4px;
  border-radius: 3px;
}

.cardLevelRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 3px 6px;
}

.levelBtn {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f1f5f9;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
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
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.levelText strong {
  color: #f1f5f9;
}

.cardDescPreview {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
  min-height: 2.8em;
}

/* Ability Inspector Panel */
.abilityInspectorCard {
  background: var(--bg-card);
  border: 1px solid var(--border-focus);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.inspectorHeader {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.85rem;
}

.inspectorSprite {
  background: var(--bg-inset);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 4px;
}

.inspectorHeaderInfo h4 {
  margin: 0 0 0.35rem 0;
  font-size: 1.3rem;
  color: #f1f5f9;
}

.inspectorRowBadge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin-bottom: 2px;
}

.inspectorMetaStats {
  display: flex;
  gap: 1rem;
  font-size: 0.82rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.inspectorMetaStats strong {
  color: #e2e8f0;
}

.inspectorBody {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.descBox {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.descBoxLabel {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.descBoxText {
  color: #f1f5f9;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-line;
}

.progressionWrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progressionTitle {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.progressionTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.progressionTable th {
  background: var(--bg-inset);
  color: var(--text-muted);
  font-weight: 600;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.progressionTable td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.progressionTable tr.activeRow {
  background: rgba(56, 189, 248, 0.08);
}

.progressionTable tr.activeRow td {
  color: #f1f5f9;
}

.effectVal {
  color: #38bdf8;
  font-weight: 600;
}

.statusActive {
  color: #10b981;
  font-weight: 700;
  font-size: 0.78rem;
}

.statusInactive {
  color: var(--text-muted);
  font-size: 0.78rem;
}

/* Comparison Section */
.comparisonSection {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compHeader h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.3rem;
}

.compHeader p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.tableOverflow {
  overflow-x: auto;
}

.compTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.compTable th {
  background: var(--bg-inset);
  color: var(--text-muted);
  text-align: left;
  padding: 0.65rem 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border-subtle);
}

.compTable td {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  vertical-align: middle;
}

.compTable tr {
  cursor: pointer;
  transition: background 0.15s ease;
}

.compTable tr:hover {
  background: var(--bg-card-hover);
}

.compTable tr.highlightedRow {
  background: rgba(110, 168, 254, 0.08);
}

.doctrineCell {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f1f5f9;
}

.rolePill {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid;
  border-radius: 4px;
  padding: 1px 6px;
  margin-bottom: 2px;
}

.cellSub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.expansionNodeBadge {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
}

.numericCell {
  font-weight: 700;
  color: #38bdf8;
}

.classPillsCompact {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.classPill {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 3px;
  color: #cbd5e1;
}

/* Mechanics Section */
.mechanicsExplainer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mechanicsExplainer h3 {
  margin: 0;
  font-size: 1.3rem;
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
  font-size: 1rem;
  color: #f1f5f9;
}

.ruleCard p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.ruleList {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.82rem;
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
  font-size: 0.78rem;
}
</style>
