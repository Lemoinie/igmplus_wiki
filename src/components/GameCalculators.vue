<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TraitDefinition } from '../types';

const props = defineProps<{
  traits: TraitDefinition[];
}>();

const activeTab = ref<'all' | 'class-xp' | 'pet' | 'trait' | 'defense'>('all');

// ==========================================
// Shared Helpers
// ==========================================
function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return Math.round(n).toLocaleString();
}

function formatDurationFromHours(hours: number): string {
  if (!Number.isFinite(hours) || hours < 0) return '—';
  if (hours === 0) return '0s';
  const totalSeconds = Math.ceil(hours * 3600);
  const days = Math.floor(totalSeconds / 86400);
  const hrs = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 && days === 0) parts.push(`${secs}s`);
  return parts.length ? parts.join(' ') : '0s';
}

function formatPercent(prob: number): string {
  const pct = prob * 100;
  if (pct === 0) return '0%';
  if (pct === 100) return '100%';
  if (pct >= 1) return `${Number(pct.toFixed(2))}%`;
  if (pct >= 0.01) return `${Number(pct.toFixed(4))}%`;
  return `${Number(pct.toFixed(6))}%`;
}

// ==========================================
// 1. Class XP Calculator (Formulas.kt)
// ==========================================
interface ClassStage {
  index: number;
  tier: number;
  ascended: boolean;
  maxLevel: number;
  label: string;
  shortLabel: string;
}

const CLASS_STAGES: ClassStage[] = [
  ...Array.from({ length: 9 }, (_, i) => {
    const tier = i + 1;
    return {
      index: i,
      tier,
      ascended: false,
      maxLevel: tier * 5,
      label: `Tier ${tier} (Max Lv ${tier * 5})`,
      shortLabel: `T${tier}`,
    };
  }),
  ...Array.from({ length: 9 }, (_, i) => {
    const tier = i + 1;
    return {
      index: 9 + i,
      tier,
      ascended: true,
      maxLevel: tier * 5,
      label: `Ascended Tier ${tier} (Max Lv ${tier * 5})`,
      shortLabel: `Asc T${tier}`,
    };
  }),
];

/** Matches Formulas.experienceToNextLevel(level, doubled) in Kotlin */
function classXpToNextLevel(level: number, ascended: boolean): number {
  const pow = Math.pow(level, 1.4);
  let exp = Math.floor((3.0 + pow) * 10.0 * pow);
  if (ascended) {
    exp *= 2;
  }
  if (exp >= 10000) return Math.floor(exp / 1000) * 1000;
  if (exp >= 1000) return Math.floor(exp / 100) * 100;
  if (exp >= 100) return Math.floor(exp / 10) * 10;
  return exp;
}

const classFromStageIdx = ref(0);
const classFromLevel = ref(1);
const classToStageIdx = ref(8);
const classToLevel = ref(45);
const classCurrentXp = ref(0);
const classXpPerHour = ref(50000);

const classFromStage = computed(() => CLASS_STAGES[classFromStageIdx.value] ?? CLASS_STAGES[0]);
const classToStage = computed(() => CLASS_STAGES[classToStageIdx.value] ?? CLASS_STAGES[8]);

watch(classFromStageIdx, (idx) => {
  const maxLv = CLASS_STAGES[idx]?.maxLevel ?? 45;
  if (classFromLevel.value > maxLv) classFromLevel.value = maxLv;
  if (classFromLevel.value < 1) classFromLevel.value = 1;
});

watch(classToStageIdx, (idx) => {
  const maxLv = CLASS_STAGES[idx]?.maxLevel ?? 45;
  if (classToLevel.value > maxLv) classToLevel.value = maxLv;
  if (classToLevel.value < 1) classToLevel.value = 1;
});

function applyClassPreset(fromIdx: number, fromLv: number, toIdx: number, toLv: number) {
  classFromStageIdx.value = fromIdx;
  classFromLevel.value = fromLv;
  classToStageIdx.value = toIdx;
  classToLevel.value = toLv;
}

const classResult = computed(() => {
  const fromS = classFromStage.value;
  const toS = classToStage.value;
  const lvA = Math.max(1, Math.min(fromS.maxLevel, Math.floor(classFromLevel.value || 1)));
  const lvB = Math.max(1, Math.min(toS.maxLevel, Math.floor(classToLevel.value || 1)));
  const curXp = Math.max(0, Math.floor(classCurrentXp.value || 0));
  const rate = Math.max(0, Number(classXpPerHour.value || 0));

  const isInvalidOrder =
    toS.index < fromS.index || (toS.index === fromS.index && lvB < lvA);

  const isSamePoint = toS.index === fromS.index && lvB === lvA;

  const currentBarMax =
    lvA < fromS.maxLevel ? classXpToNextLevel(lvA, fromS.ascended) : 0;

  if (isInvalidOrder) {
    return {
      invalid: true,
      samePoint: false,
      lvA,
      lvB,
      curXp,
      currentBarMax,
      xpBarOverflow: lvA < fromS.maxLevel && curXp >= currentBarMax,
      grossXp: 0,
      remainingXp: 0,
      xpToNextLevel: 0,
      xpToFinishFromTier: 0,
      hoursNeeded: null as number | null,
      breakdown: [] as Array<{ stage: ClassStage; startLv: number; endLv: number; xp: number }>,
    };
  }

  let grossXp = 0;
  const breakdown: Array<{ stage: ClassStage; startLv: number; endLv: number; xp: number }> = [];

  for (let idx = fromS.index; idx <= toS.index; idx++) {
    const st = CLASS_STAGES[idx];
    const startLv = idx === fromS.index ? lvA : 1;
    const endLv = idx === toS.index ? lvB : st.maxLevel;
    let stageXp = 0;
    for (let l = startLv; l < endLv; l++) {
      stageXp += classXpToNextLevel(l, st.ascended);
    }
    grossXp += stageXp;
    breakdown.push({ stage: st, startLv, endLv, xp: stageXp });
  }

  let finishFromTierGross = 0;
  for (let l = lvA; l < fromS.maxLevel; l++) {
    finishFromTierGross += classXpToNextLevel(l, fromS.ascended);
  }

  const remainingXp = isSamePoint ? 0 : Math.max(0, grossXp - curXp);
  const xpToNextLevel =
    lvA < fromS.maxLevel ? Math.max(0, currentBarMax - curXp) : 0;
  const xpToFinishFromTier =
    lvA < fromS.maxLevel ? Math.max(0, finishFromTierGross - curXp) : 0;
  const hoursNeeded = rate > 0 ? remainingXp / rate : null;

  return {
    invalid: false,
    samePoint: isSamePoint,
    lvA,
    lvB,
    curXp,
    currentBarMax,
    xpBarOverflow: lvA < fromS.maxLevel && curXp >= currentBarMax,
    grossXp,
    remainingXp,
    xpToNextLevel,
    xpToFinishFromTier,
    hoursNeeded,
    breakdown,
  };
});

// ==========================================
// 2. Pet XP & Merge Calculator (Formulas.kt, Pet.kt, DialogMergePet.kt)
// ==========================================
/** Matches Formulas.foodToNextLevel(level) in Kotlin */
function petFoodToNextLevel(level: number): number {
  return Math.floor(Math.pow(1.085, level) * 30.0);
}

/** Matches Pet.calculateTotalFoodGiven() */
function petTotalFoodInvested(level: number, currentFood: number): number {
  let total = 0;
  const lv = Math.max(1, Math.floor(level || 1));
  for (let i = 1; i < lv; i++) {
    total += petFoodToNextLevel(i);
  }
  return total + Math.max(0, Math.floor(currentFood || 0));
}

const petFromLevel = ref(1);
const petToLevel = ref(61);
const petCurrentXp = ref(0);
const petXpPerHour = ref(500);

const petXpResult = computed(() => {
  const lvA = Math.max(1, Math.min(999, Math.floor(petFromLevel.value || 1)));
  const lvB = Math.max(1, Math.min(999, Math.floor(petToLevel.value || 1)));
  const curXp = Math.max(0, Math.floor(petCurrentXp.value || 0));
  const rate = Math.max(0, Number(petXpPerHour.value || 0));
  const currentBarMax = petFoodToNextLevel(lvA);

  if (lvB < lvA) {
    return {
      invalid: true,
      lvA,
      lvB,
      curXp,
      currentBarMax,
      xpBarOverflow: curXp >= currentBarMax,
      grossXp: 0,
      remainingXp: 0,
      xpToNextLevel: Math.max(0, currentBarMax - curXp),
      hoursNeeded: null as number | null,
      cumulativeAtA: petTotalFoodInvested(lvA, curXp),
      cumulativeAtB: petTotalFoodInvested(lvB, 0),
    };
  }

  let grossXp = 0;
  for (let l = lvA; l < lvB; l++) {
    grossXp += petFoodToNextLevel(l);
  }

  const remainingXp = lvA === lvB ? 0 : Math.max(0, grossXp - curXp);
  const xpToNextLevel = Math.max(0, currentBarMax - curXp);
  const hoursNeeded = rate > 0 ? remainingXp / rate : null;

  return {
    invalid: false,
    lvA,
    lvB,
    curXp,
    currentBarMax,
    xpBarOverflow: curXp >= currentBarMax,
    grossXp,
    remainingXp,
    xpToNextLevel,
    hoursNeeded,
    cumulativeAtA: petTotalFoodInvested(lvA, curXp),
    cumulativeAtB: petTotalFoodInvested(lvB, 0),
  };
});

function getPetTraitSlots(level: number) {
  return [
    { slot: 1, unlockLv: 1, unlocked: level >= 1, effectiveLv: level },
    { slot: 2, unlockLv: 21, unlocked: level > 20, effectiveLv: Math.max(0, level - 20) },
    { slot: 3, unlockLv: 41, unlocked: level > 40, effectiveLv: Math.max(0, level - 40) },
    { slot: 4, unlockLv: 61, unlocked: level > 60, effectiveLv: Math.max(0, level - 60) },
  ];
}

// Pet Merge Calculator
const mergeSacrificeLevel = ref(20);
const mergeSacrificeFood = ref(0);
const mergeTargetLevel = ref(1);
const mergeTargetFood = ref(0);

function swapMergePets() {
  const sLv = mergeSacrificeLevel.value;
  const sFood = mergeSacrificeFood.value;
  mergeSacrificeLevel.value = mergeTargetLevel.value;
  mergeSacrificeFood.value = mergeTargetFood.value;
  mergeTargetLevel.value = sLv;
  mergeTargetFood.value = sFood;
}

const petMergeResult = computed(() => {
  const sLv = Math.max(1, Math.min(999, Math.floor(mergeSacrificeLevel.value || 1)));
  const sFood = Math.max(0, Math.floor(mergeSacrificeFood.value || 0));
  const tLv = Math.max(1, Math.min(999, Math.floor(mergeTargetLevel.value || 1)));
  const tFood = Math.max(0, Math.floor(mergeTargetFood.value || 0));

  const sacrificeTotal = petTotalFoodInvested(sLv, sFood);
  // Matches DialogMergePet: Utils.round(sel.calculateTotalFoodGiven().toDouble() * 0.8)
  const transferredFood = Math.floor(sacrificeTotal * 0.8 + 1e-4);
  const lostFood = sacrificeTotal - transferredFood;

  // Normalize target starting overflow if any, then simulate Pet.feed(transferredFood)
  let lvl = tLv;
  let food = tFood;
  while (food >= petFoodToNextLevel(lvl)) {
    food -= petFoodToNextLevel(lvl);
    lvl++;
  }

  let rem = transferredFood;
  while (rem > 0) {
    const req = petFoodToNextLevel(lvl);
    const toNext = req - food;
    const step = Math.min(toNext, rem);
    rem -= step;
    food += step;
    if (food >= req) {
      lvl++;
      food = 0;
    }
  }

  const nextReq = petFoodToNextLevel(lvl);
  const progressPct = nextReq > 0 ? Math.min(100, Math.round((food / nextReq) * 1000) / 10) : 0;

  return {
    sLv,
    sFood,
    sNextReq: petFoodToNextLevel(sLv),
    tLv,
    tFood,
    tNextReq: petFoodToNextLevel(tLv),
    sacrificeTotal,
    transferredFood,
    lostFood,
    resultLevel: lvl,
    levelsGained: lvl - tLv,
    resultFood: food,
    resultNextReq: nextReq,
    xpToNext: nextReq - food,
    progressPct,
    slots: getPetTraitSlots(lvl),
  };
});

// ==========================================
// 3. Trait Probability Calculator (Utils.kt)
// ==========================================
// Exact rollable pools in Utils.COMMON_TRAITS (7) and Utils.RARE_TRAITS (19)
const ROLLABLE_BASIC_KEYS = new Set([
  'BOOKWORM',
  'BRUTE',
  'FERAL',
  'VERSATILE',
  'ZEALOUS',
  'CUNNING',
  'ATHLETIC',
]);

const ROLLABLE_RARE_KEYS = new Set([
  'EMPATHETIC',
  'GIFTED',
  'INTIMIDATING',
  'FOCUSED',
  'DRAGON_BLOOD',
  'CURSED',
  'REACTIVE',
  'NOCTURNAL',
  'MINDFUL',
  'TROLL_BLOOD',
  'NIMBLE',
  'RUTHLESS',
  'BLESSED',
  'ALERT',
  'DEADEYE',
  'SUNDERING',
  'FORTIFIED',
  'RECKLESS',
  'LONE_WOLF',
]);

const CHANCE_COMMON_TRAIT = 0.4; // 40%
const CHANCE_RARE_TRAIT = 0.2;   // 20%
const BASE_CLASS_OPTIONS = [
  { id: 'any', name: 'Any Base Class (All 5)' },
  { id: 'Footman', name: 'Footman' },
  { id: 'Apprentice', name: 'Apprentice' },
  { id: 'Archer', name: 'Archer' },
  { id: 'Rogue', name: 'Rogue' },
  { id: 'Outlander', name: 'Outlander' },
];

const traitByKey = computed(() => {
  const map = new Map<string, TraitDefinition>();
  for (const t of props.traits) {
    if (t.key) map.set(t.key, t);
  }
  return map;
});

const basicTraits = computed(() =>
  props.traits
    .filter((t) => ROLLABLE_BASIC_KEYS.has(t.key))
    .sort((a, b) => a.name.localeCompare(b.name))
);

const rareTraits = computed(() =>
  props.traits
    .filter((t) => ROLLABLE_RARE_KEYS.has(t.key))
    .sort((a, b) => a.name.localeCompare(b.name))
);

const selectedBasic = ref<string>('any');
const selectedRare = ref<string>('any');
const selectedBaseClass = ref<string>('any');

const traitResult = computed(() => {
  const basicPoolSize = basicTraits.value.length || 7;
  const rarePoolSize = rareTraits.value.length || 19;

  let basicProb = 1.0;
  let basicLabel = 'Any (Basic or None)';
  if (selectedBasic.value === 'any_trait') {
    basicProb = CHANCE_COMMON_TRAIT;
    basicLabel = 'Any Basic Trait';
  } else if (selectedBasic.value === 'none') {
    basicProb = 1 - CHANCE_COMMON_TRAIT;
    basicLabel = 'No Basic Trait';
  } else if (selectedBasic.value !== 'any') {
    basicProb = CHANCE_COMMON_TRAIT / basicPoolSize;
    basicLabel = traitByKey.value.get(selectedBasic.value)?.name ?? selectedBasic.value;
  }

  let rareProb = 1.0;
  let rareLabel = 'Any (Rare or None)';
  if (selectedRare.value === 'any_trait') {
    rareProb = CHANCE_RARE_TRAIT;
    rareLabel = 'Any Rare Trait';
  } else if (selectedRare.value === 'none') {
    rareProb = 1 - CHANCE_RARE_TRAIT;
    rareLabel = 'No Rare Trait';
  } else if (selectedRare.value !== 'any') {
    rareProb = CHANCE_RARE_TRAIT / rarePoolSize;
    rareLabel = traitByKey.value.get(selectedRare.value)?.name ?? selectedRare.value;
  }

  const classProb = selectedBaseClass.value === 'any' ? 1.0 : 0.2;
  const traitsOnlyProb = basicProb * rareProb;
  const totalProb = traitsOnlyProb * classProb;

  const avgVisitors = totalProb > 0 ? 1 / totalProb : Infinity;
  const p50Visitors = totalProb >= 1 ? 1 : totalProb > 0 ? Math.ceil(Math.log(0.5) / Math.log(1 - totalProb)) : Infinity;
  const p90Visitors = totalProb >= 1 ? 1 : totalProb > 0 ? Math.ceil(Math.log(0.1) / Math.log(1 - totalProb)) : Infinity;

  const basicObj = selectedBasic.value !== 'any' && selectedBasic.value !== 'any_trait' && selectedBasic.value !== 'none'
    ? traitByKey.value.get(selectedBasic.value) ?? null
    : null;
  const basicUpgradeObj = basicObj?.upgrades_to ? traitByKey.value.get(basicObj.upgrades_to) ?? null : null;

  const rareObj = selectedRare.value !== 'any' && selectedRare.value !== 'any_trait' && selectedRare.value !== 'none'
    ? traitByKey.value.get(selectedRare.value) ?? null
    : null;
  const rareUpgradeObj = rareObj?.upgrades_to ? traitByKey.value.get(rareObj.upgrades_to) ?? null : null;

  return {
    basicPoolSize,
    rarePoolSize,
    basicProb,
    rareProb,
    classProb,
    basicLabel,
    rareLabel,
    traitsOnlyProb,
    totalProb,
    avgVisitors,
    p50Visitors,
    p90Visitors,
    basicObj,
    basicUpgradeObj,
    rareObj,
    rareUpgradeObj,
  };
});

function formatOdds(prob: number): string {
  if (prob <= 0) return '—';
  const oneIn = 1 / prob;
  if (Math.abs(oneIn - Math.round(oneIn)) < 1e-6) {
    return `1 in ${Math.round(oneIn).toLocaleString()}`;
  }
  return `1 in ${Number(oneIn.toFixed(1)).toLocaleString()}`;
}

// ==========================================
// 4. Damage Reduction Calculator (DefenseCalculator)
// ==========================================
const drDefense = ref(50);
const drPenetration = ref(0);
const drIncomingDamage = ref(100);

const DR_PRESETS = [
  { label: '0 DEF (0%)', def: 0 },
  { label: '10 DEF (16%)', def: 10 },
  { label: '25 DEF (33%)', def: 25 },
  { label: '50 DEF (50%)', def: 50 },
  { label: '75 DEF (60%)', def: 75 },
  { label: '100 DEF (66%)', def: 100 },
  { label: '117 DEF (70%)', def: 117 },
  { label: '150 DEF (75%)', def: 150 },
  { label: '200 DEF (80%)', def: 200 },
  { label: '450 DEF (90%)', def: 450 },
];

const drEffectiveDef = computed(() => {
  const d = Math.max(0, Number(drDefense.value || 0));
  const pen = Math.max(0, Math.min(100, Number(drPenetration.value || 0)));
  return Math.max(0, d * (1 - pen / 100));
});

const drReductionPercent = computed(() => {
  const def = drEffectiveDef.value;
  if (def <= 0) return 0;
  return Math.floor((100 * def) / (50 + def) + 1e-4);
});

const drDamageMultiplier = computed(() => {
  return Math.max(0, (100 - drReductionPercent.value) / 100);
});

const drDamageTaken = computed(() => {
  const inc = Math.max(0, Number(drIncomingDamage.value || 0));
  return Math.round(inc * drDamageMultiplier.value * 10) / 10;
});

const drEhpMultiplier = computed(() => {
  const red = drReductionPercent.value;
  if (red >= 100) return 999;
  return 100 / (100 - red);
});
</script>

<template>
  <div class="calcPage">
    <!-- Filter Tabs -->
    <div class="tabBar">
      <button
        type="button"
        class="tabBtn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        All Calculators
      </button>
      <button
        type="button"
        class="tabBtn"
        :class="{ active: activeTab === 'class-xp' }"
        @click="activeTab = 'class-xp'"
      >
        Class XP
      </button>
      <button
        type="button"
        class="tabBtn"
        :class="{ active: activeTab === 'pet' }"
        @click="activeTab = 'pet'"
      >
        Pet XP &amp; Merge
      </button>
      <button
        type="button"
        class="tabBtn"
        :class="{ active: activeTab === 'trait' }"
        @click="activeTab = 'trait'"
      >
        Trait Calculator
      </button>
      <button
        type="button"
        class="tabBtn"
        :class="{ active: activeTab === 'defense' }"
        @click="activeTab = 'defense'"
      >
        Damage Reduction
      </button>
    </div>

    <!-- ===================================== -->
    <!-- 1. CLASS XP CALCULATOR                -->
    <!-- ===================================== -->
    <section v-show="activeTab === 'all' || activeTab === 'class-xp'" class="calcPanel">
      <div class="panelHead">
        <div>
          <h2>Class XP Calculator</h2>
          <p class="panelSub">
            Calculate XP and time required to level from Tier N Lv A to Tier M Lv B (promoting or ascending at each tier's max level).
          </p>
        </div>
        <div class="presetGroup">
          <button type="button" class="presetBtn" @click="applyClassPreset(0, 1, 8, 45)">T1 Lv 1 → T9 Lv 45</button>
          <button type="button" class="presetBtn" @click="applyClassPreset(9, 1, 17, 45)">Asc T1 Lv 1 → Asc T9 Lv 45</button>
          <button type="button" class="presetBtn" @click="applyClassPreset(0, 1, 17, 45)">T1 Lv 1 → Asc T9 Lv 45</button>
        </div>
      </div>

      <div class="calcGrid twoCol">
        <!-- Left: Inputs -->
        <div class="inputSection">
          <div class="stagePairGrid">
            <div class="stageBox">
              <div class="boxTitle">Starting Point (Tier N, Lv A)</div>
              <div class="fieldStack">
                <label class="fieldLabel">From Tier</label>
                <select v-model.number="classFromStageIdx" class="calcInput">
                  <optgroup label="Normal Progression">
                    <option v-for="s in CLASS_STAGES.slice(0, 9)" :key="s.index" :value="s.index">
                      {{ s.label }}
                    </option>
                  </optgroup>
                  <optgroup label="Ascended Progression (2x XP)">
                    <option v-for="s in CLASS_STAGES.slice(9)" :key="s.index" :value="s.index">
                      {{ s.label }}
                    </option>
                  </optgroup>
                </select>
              </div>
              <div class="fieldStack">
                <label class="fieldLabel">Starting Level (Lv A: 1–{{ classFromStage.maxLevel }})</label>
                <input
                  v-model.number="classFromLevel"
                  type="number"
                  min="1"
                  :max="classFromStage.maxLevel"
                  class="calcInput"
                />
              </div>
            </div>

            <div class="stageBox">
              <div class="boxTitle">Target Goal (Tier M, Lv B)</div>
              <div class="fieldStack">
                <label class="fieldLabel">To Tier</label>
                <select v-model.number="classToStageIdx" class="calcInput">
                  <optgroup label="Normal Progression">
                    <option v-for="s in CLASS_STAGES.slice(0, 9)" :key="s.index" :value="s.index">
                      {{ s.label }}
                    </option>
                  </optgroup>
                  <optgroup label="Ascended Progression (2x XP)">
                    <option v-for="s in CLASS_STAGES.slice(9)" :key="s.index" :value="s.index">
                      {{ s.label }}
                    </option>
                  </optgroup>
                </select>
              </div>
              <div class="fieldStack">
                <label class="fieldLabel">Target Level (Lv B: 1–{{ classToStage.maxLevel }})</label>
                <input
                  v-model.number="classToLevel"
                  type="number"
                  min="1"
                  :max="classToStage.maxLevel"
                  class="calcInput"
                />
              </div>
            </div>
          </div>

          <div class="twoFieldRow">
            <div class="fieldStack">
              <label class="fieldLabel">
                Current XP at {{ classFromStage.shortLabel }} Lv {{ classResult.lvA }}
                <span v-if="classResult.currentBarMax > 0" class="mutedHint">
                  (/ {{ formatNumber(classResult.currentBarMax) }})
                </span>
                <span v-else class="mutedHint">(Tier Max — ready to promote)</span>
              </label>
              <input
                v-model.number="classCurrentXp"
                type="number"
                min="0"
                step="100"
                class="calcInput"
              />
            </div>

            <div class="fieldStack">
              <label class="fieldLabel">Your XP / Hour</label>
              <input
                v-model.number="classXpPerHour"
                type="number"
                min="0"
                step="1000"
                class="calcInput"
              />
            </div>
          </div>

          <div v-if="classResult.invalid" class="warnBox">
            Target Tier/Level must be equal to or ahead of the Starting Tier/Level.
          </div>
          <div v-else-if="classResult.xpBarOverflow" class="warnBox">
            Current XP ({{ formatNumber(classResult.curXp) }}) meets or exceeds the XP bar for Lv {{ classResult.lvA }} ({{ formatNumber(classResult.currentBarMax) }}). Excess XP is subtracted from the total.
          </div>
        </div>

        <!-- Right: Results -->
        <div class="resultSection">
          <div class="primaryStats">
            <div class="statCard highlightCard">
              <span class="statLabel">Total XP Needed</span>
              <span class="statValue">{{ formatNumber(classResult.remainingXp) }}</span>
              <span class="statSub">
                Gross before current XP: {{ formatNumber(classResult.grossXp) }}
              </span>
            </div>
            <div class="statCard highlightCard">
              <span class="statLabel">Estimated Time</span>
              <span class="statValue">
                {{ classResult.hoursNeeded !== null ? formatDurationFromHours(classResult.hoursNeeded) : 'Enter XP/h > 0' }}
              </span>
              <span class="statSub" v-if="classResult.hoursNeeded !== null && classXpPerHour > 0">
                {{ classResult.hoursNeeded.toFixed(2) }} hours at {{ formatNumber(classXpPerHour) }} XP/h
              </span>
              <span class="statSub" v-else>Set your dungeon XP/h above</span>
            </div>
          </div>

          <div class="secondaryStats">
            <div class="miniStat">
              <span class="miniLabel">To Next Level (Lv {{ classResult.lvA }} → {{ Math.min(classFromStage.maxLevel, classResult.lvA + 1) }})</span>
              <span class="miniValue" v-if="classResult.lvA < classFromStage.maxLevel">
                {{ formatNumber(classResult.xpToNextLevel) }} XP
              </span>
              <span class="miniValue" v-else>At Tier Max (0 XP to promote)</span>
            </div>
            <div class="miniStat">
              <span class="miniLabel">To Finish Starting Tier ({{ classFromStage.shortLabel }} Lv {{ classFromStage.maxLevel }})</span>
              <span class="miniValue">{{ formatNumber(classResult.xpToFinishFromTier) }} XP</span>
            </div>
          </div>

          <div v-if="!classResult.invalid && classResult.breakdown.length > 0" class="breakdownWrap">
            <div class="breakdownTitle">Tier Breakdown Along Path</div>
            <div class="tableScroll">
              <table class="miniTable">
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Levels</th>
                    <th class="num">XP Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in classResult.breakdown" :key="row.stage.index">
                    <td>
                      <span :class="{ ascText: row.stage.ascended }">{{ row.stage.label }}</span>
                    </td>
                    <td>Lv {{ row.startLv }} → Lv {{ row.endLv }}</td>
                    <td class="num">{{ formatNumber(row.xp) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================================== -->
    <!-- 2. PET XP & MERGE CALCULATOR          -->
    <!-- ===================================== -->
    <section v-show="activeTab === 'all' || activeTab === 'pet'" class="calcPanel">
      <div class="panelHead">
        <div>
          <h2>Pet XP &amp; Merge Calculator</h2>
          <p class="panelSub">
            Calculate Pet Food (XP) and time from Lv A to Lv B, or simulate merging Pet 1 into Pet 2 (transfers 80% of Pet 1's total invested XP).
          </p>
        </div>
      </div>

      <div class="petTwoPanels">
        <!-- Sub-panel A: Pet XP Calculator -->
        <div class="subPanel">
          <h3 class="subTitle">Pet XP Calculator</h3>

          <div class="twoFieldRow">
            <div class="fieldStack">
              <label class="fieldLabel">From Level (Lv A)</label>
              <input v-model.number="petFromLevel" type="number" min="1" max="999" class="calcInput" />
            </div>
            <div class="fieldStack">
              <label class="fieldLabel">To Level (Lv B)</label>
              <input v-model.number="petToLevel" type="number" min="1" max="999" class="calcInput" />
            </div>
          </div>

          <div class="twoFieldRow">
            <div class="fieldStack">
              <label class="fieldLabel">
                Current XP at Lv {{ petXpResult.lvA }}
                <span class="mutedHint">(/ {{ formatNumber(petXpResult.currentBarMax) }})</span>
              </label>
              <input v-model.number="petCurrentXp" type="number" min="0" step="10" class="calcInput" />
            </div>
            <div class="fieldStack">
              <label class="fieldLabel">Pet XP / Hour (Food / h)</label>
              <input v-model.number="petXpPerHour" type="number" min="0" step="50" class="calcInput" />
            </div>
          </div>

          <div v-if="petXpResult.invalid" class="warnBox">
            Target Level (Lv B) must be greater than or equal to Starting Level (Lv A).
          </div>
          <div v-else-if="petXpResult.xpBarOverflow" class="warnBox">
            Current XP meets or exceeds Lv {{ petXpResult.lvA }}'s food bar ({{ formatNumber(petXpResult.currentBarMax) }}).
          </div>

          <div class="primaryStats">
            <div class="statCard highlightCard">
              <span class="statLabel">Pet XP Needed</span>
              <span class="statValue">{{ formatNumber(petXpResult.remainingXp) }}</span>
              <span class="statSub">Gross Lv {{ petXpResult.lvA }}→{{ petXpResult.lvB }}: {{ formatNumber(petXpResult.grossXp) }}</span>
            </div>
            <div class="statCard highlightCard">
              <span class="statLabel">Estimated Time</span>
              <span class="statValue">
                {{ petXpResult.hoursNeeded !== null ? formatDurationFromHours(petXpResult.hoursNeeded) : 'Enter XP/h > 0' }}
              </span>
              <span class="statSub" v-if="petXpResult.hoursNeeded !== null && petXpPerHour > 0">
                {{ petXpResult.hoursNeeded.toFixed(2) }} hours at {{ formatNumber(petXpPerHour) }} / h
              </span>
              <span class="statSub" v-else>Set your pet XP/h above</span>
            </div>
          </div>

          <div class="secondaryStats">
            <div class="miniStat">
              <span class="miniLabel">Next Level (Lv {{ petXpResult.lvA }} → {{ petXpResult.lvA + 1 }})</span>
              <span class="miniValue">{{ formatNumber(petXpResult.xpToNextLevel) }} XP</span>
            </div>
            <div class="miniStat">
              <span class="miniLabel">Cumulative Total at Lv {{ petXpResult.lvB }}</span>
              <span class="miniValue">{{ formatNumber(petXpResult.cumulativeAtB) }} XP</span>
            </div>
          </div>

          <div class="traitSlotBar">
            <span class="slotTitle">Trait Strength at Lv {{ petXpResult.lvB }}:</span>
            <div class="slotChips">
              <span
                v-for="s in getPetTraitSlots(petXpResult.lvB)"
                :key="s.slot"
                class="slotChip"
                :class="{ locked: !s.unlocked }"
              >
                Trait {{ s.slot }}: {{ s.unlocked ? `Eff. Lv ${s.effectiveLv}` : `Locked (Lv ${s.unlockLv})` }}
              </span>
            </div>
          </div>
        </div>

        <!-- Sub-panel B: Pet Merge Calculator -->
        <div class="subPanel">
          <div class="subTitleRow">
            <h3 class="subTitle">Pet Merge Calculator</h3>
            <button type="button" class="presetBtn" @click="swapMergePets">Swap Pets</button>
          </div>

          <div class="stagePairGrid">
            <div class="stageBox">
              <div class="boxTitle">Pet 1 — Sacrificed (80% XP Given)</div>
              <div class="fieldStack">
                <label class="fieldLabel">Pet 1 Level</label>
                <input v-model.number="mergeSacrificeLevel" type="number" min="1" max="999" class="calcInput" />
              </div>
              <div class="fieldStack">
                <label class="fieldLabel">
                  Current XP
                  <span class="mutedHint">(/ {{ formatNumber(petMergeResult.sNextReq) }})</span>
                </label>
                <input v-model.number="mergeSacrificeFood" type="number" min="0" step="10" class="calcInput" />
              </div>
            </div>

            <div class="stageBox">
              <div class="boxTitle">Pet 2 — Receiving Pet</div>
              <div class="fieldStack">
                <label class="fieldLabel">Pet 2 Level</label>
                <input v-model.number="mergeTargetLevel" type="number" min="1" max="999" class="calcInput" />
              </div>
              <div class="fieldStack">
                <label class="fieldLabel">
                  Current XP
                  <span class="mutedHint">(/ {{ formatNumber(petMergeResult.tNextReq) }})</span>
                </label>
                <input v-model.number="mergeTargetFood" type="number" min="0" step="10" class="calcInput" />
              </div>
            </div>
          </div>

          <div class="primaryStats">
            <div class="statCard highlightCard">
              <span class="statLabel">Resulting Level</span>
              <span class="statValue">Lv {{ petMergeResult.resultLevel }}</span>
              <span class="statSub">+{{ petMergeResult.levelsGained }} level{{ petMergeResult.levelsGained === 1 ? '' : 's' }} gained from merge</span>
            </div>
            <div class="statCard highlightCard">
              <span class="statLabel">XP Transferred (80%)</span>
              <span class="statValue">{{ formatNumber(petMergeResult.transferredFood) }}</span>
              <span class="statSub">
                Invested: {{ formatNumber(petMergeResult.sacrificeTotal) }} · Lost (20%): {{ formatNumber(petMergeResult.lostFood) }}
              </span>
            </div>
          </div>

          <div class="mergeProgressCard">
            <div class="mergeProgressHead">
              <span>XP Progress at Lv {{ petMergeResult.resultLevel }}</span>
              <span class="monoVal">
                {{ formatNumber(petMergeResult.resultFood) }} / {{ formatNumber(petMergeResult.resultNextReq) }} ({{ petMergeResult.progressPct }}%)
              </span>
            </div>
            <div class="progressBarTrack">
              <div class="progressBarFill" :style="{ width: `${petMergeResult.progressPct}%` }"></div>
            </div>
            <div class="mergeProgressFoot">
              {{ formatNumber(petMergeResult.xpToNext) }} XP needed to reach Lv {{ petMergeResult.resultLevel + 1 }}
            </div>
          </div>

          <div class="traitSlotBar">
            <span class="slotTitle">Trait Strength at Result (Lv {{ petMergeResult.resultLevel }}):</span>
            <div class="slotChips">
              <span
                v-for="s in petMergeResult.slots"
                :key="s.slot"
                class="slotChip"
                :class="{ locked: !s.unlocked }"
              >
                Trait {{ s.slot }}: {{ s.unlocked ? `Eff. Lv ${s.effectiveLv}` : `Locked (Lv ${s.unlockLv})` }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================================== -->
    <!-- 3. TRAIT PROBABILITY CALCULATOR       -->
    <!-- ===================================== -->
    <section v-show="activeTab === 'all' || activeTab === 'trait'" class="calcPanel">
      <div class="panelHead">
        <div>
          <h2>Tavern Trait Probability Calculator</h2>
          <p class="panelSub">
            Tavern recruits independently roll a Basic Trait (40% across 7 traits) and a Rare Trait (20% across 19 traits). Evolved (+) traits are upgraded later via Evo Vials.
          </p>
        </div>
      </div>

      <div class="calcGrid twoCol">
        <div class="inputSection">
          <div class="fieldStack">
            <label class="fieldLabel">Basic Trait (40% Base Chance · {{ traitResult.basicPoolSize }} Traits)</label>
            <select v-model="selectedBasic" class="calcInput">
              <option value="any">Any (Including No Basic Trait — 100%)</option>
              <option value="any_trait">Any Basic Trait (40%)</option>
              <option value="none">No Basic Trait (60%)</option>
              <optgroup label="Specific Basic Traits (5.71% each)">
                <option v-for="t in basicTraits" :key="t.key" :value="t.key">
                  {{ t.name }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="fieldStack">
            <label class="fieldLabel">Rare Trait (20% Base Chance · {{ traitResult.rarePoolSize }} Traits)</label>
            <select v-model="selectedRare" class="calcInput">
              <option value="any">Any (Including No Rare Trait — 100%)</option>
              <option value="any_trait">Any Rare Trait (20%)</option>
              <option value="none">No Rare Trait (80%)</option>
              <optgroup label="Specific Rare Traits (1.05% each)">
                <option v-for="t in rareTraits" :key="t.key" :value="t.key">
                  {{ t.name }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="fieldStack">
            <label class="fieldLabel">Base Class Filter (Optional · 20% Each)</label>
            <select v-model="selectedBaseClass" class="calcInput">
              <option v-for="c in BASE_CLASS_OPTIONS" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <!-- Selected Trait Previews -->
          <div v-if="traitResult.basicObj || traitResult.rareObj" class="traitPreviews">
            <div v-if="traitResult.basicObj" class="traitPreviewCard">
              <div class="tpHead">
                <span class="tpName">{{ traitResult.basicObj.name }}</span>
                <span class="tpBadge basic">Basic</span>
              </div>
              <p class="tpDesc">{{ traitResult.basicObj.description }}</p>
              <p v-if="traitResult.basicUpgradeObj" class="tpUpgrade">
                <strong>{{ traitResult.basicUpgradeObj.name }} (Evo-22):</strong> {{ traitResult.basicUpgradeObj.description }}
              </p>
            </div>

            <div v-if="traitResult.rareObj" class="traitPreviewCard">
              <div class="tpHead">
                <span class="tpName">{{ traitResult.rareObj.name }}</span>
                <span class="tpBadge rare">Rare</span>
              </div>
              <p class="tpDesc">{{ traitResult.rareObj.description }}</p>
              <p v-if="traitResult.rareUpgradeObj" class="tpUpgrade">
                <strong>{{ traitResult.rareUpgradeObj.name }} (Evo-24):</strong> {{ traitResult.rareUpgradeObj.description }}
              </p>
            </div>
          </div>
        </div>

        <div class="resultSection">
          <div class="primaryStats">
            <div class="statCard highlightCard">
              <span class="statLabel">Combination Chance</span>
              <span class="statValue">{{ formatPercent(traitResult.totalProb) }}</span>
              <span class="statSub">{{ formatOdds(traitResult.totalProb) }} tavern visitors</span>
            </div>
            <div class="statCard highlightCard">
              <span class="statLabel">Average Visitors Needed</span>
              <span class="statValue">
                {{ Number.isFinite(traitResult.avgVisitors) ? formatNumber(Math.round(traitResult.avgVisitors)) : '—' }}
              </span>
              <span class="statSub" v-if="selectedBaseClass !== 'any'">
                Traits only (any class): {{ formatPercent(traitResult.traitsOnlyProb) }} ({{ formatOdds(traitResult.traitsOnlyProb) }})
              </span>
              <span class="statSub" v-else>
                With a specific class (20%): {{ formatPercent(traitResult.traitsOnlyProb * 0.2) }}
              </span>
            </div>
          </div>

          <div class="secondaryStats threeCol">
            <div class="miniStat">
              <span class="miniLabel">Basic Roll</span>
              <span class="miniValue">{{ formatPercent(traitResult.basicProb) }}</span>
            </div>
            <div class="miniStat">
              <span class="miniLabel">Rare Roll</span>
              <span class="miniValue">{{ formatPercent(traitResult.rareProb) }}</span>
            </div>
            <div class="miniStat">
              <span class="miniLabel">Class Roll</span>
              <span class="miniValue">{{ formatPercent(traitResult.classProb) }}</span>
            </div>
          </div>

          <div class="breakdownWrap">
            <div class="breakdownTitle">Tavern Roll Milestones</div>
            <table class="miniTable">
              <thead>
                <tr>
                  <th>Confidence</th>
                  <th class="num">Visitors Needed</th>
                  <th class="num">Attract Guest Cost (50 Gems/roll)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Expected Average (1 / P)</td>
                  <td class="num">{{ formatNumber(Math.round(traitResult.avgVisitors)) }}</td>
                  <td class="num">{{ formatNumber(Math.round(traitResult.avgVisitors) * 50) }} Gems</td>
                </tr>
                <tr>
                  <td>50% Chance to See at Least Once</td>
                  <td class="num">{{ formatNumber(traitResult.p50Visitors) }}</td>
                  <td class="num">{{ formatNumber(traitResult.p50Visitors * 50) }} Gems</td>
                </tr>
                <tr>
                  <td>90% Chance to See at Least Once</td>
                  <td class="num">{{ formatNumber(traitResult.p90Visitors) }}</td>
                  <td class="num">{{ formatNumber(traitResult.p90Visitors * 50) }} Gems</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================================== -->
    <!-- 4. DAMAGE REDUCTION CALCULATOR        -->
    <!-- ===================================== -->
    <section v-show="activeTab === 'all' || activeTab === 'defense'" class="calcPanel">
      <div class="panelHead">
        <div>
          <h2>Damage Reduction Calculator</h2>
          <p class="panelSub">
            Calculate physical or magic mitigation, damage taken after Armor Penetration, and Effective Health (EHP) multiplier.
          </p>
        </div>
        <div class="presetGroup">
          <button
            v-for="p in DR_PRESETS"
            :key="p.def"
            type="button"
            class="presetBtn"
            :class="{ active: drDefense === p.def }"
            @click="drDefense = p.def"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div class="drInputsGrid">
        <div class="fieldStack">
          <label class="fieldLabel">DEF / MDEF</label>
          <div class="sliderAndNum">
            <input
              v-model.number="drDefense"
              type="range"
              min="0"
              max="600"
              step="1"
              class="rangeSlider"
            />
            <input
              v-model.number="drDefense"
              type="number"
              min="0"
              max="9999"
              class="calcInput smallNum"
            />
          </div>
        </div>

        <div class="fieldStack">
          <label class="fieldLabel">Enemy Armor Penetration (%)</label>
          <div class="sliderAndNum">
            <input
              v-model.number="drPenetration"
              type="range"
              min="0"
              max="100"
              step="5"
              class="rangeSlider"
            />
            <input
              v-model.number="drPenetration"
              type="number"
              min="0"
              max="100"
              class="calcInput smallNum"
            />
          </div>
        </div>

        <div class="fieldStack">
          <label class="fieldLabel">Incoming Hit Damage</label>
          <input
            v-model.number="drIncomingDamage"
            type="number"
            min="1"
            max="100000"
            class="calcInput"
          />
        </div>
      </div>

      <div class="drResultsSection">
        <div class="drMainCard">
          <span class="drMainTitle">Damage Reduction</span>
          <div class="drMainVal">{{ drReductionPercent }}%</div>
          <div class="progressBarTrack">
            <div class="drProgressFill" :style="{ width: `${Math.min(100, drReductionPercent)}%` }"></div>
          </div>
          <span class="statSub">Mitigates {{ drReductionPercent }}% of incoming damage</span>
        </div>

        <div class="secondaryStats">
          <div class="miniStat">
            <span class="miniLabel">Effective Defense</span>
            <span class="miniValue">{{ drEffectiveDef % 1 === 0 ? drEffectiveDef.toFixed(0) : drEffectiveDef.toFixed(1) }}</span>
            <span class="statSub">After penetration</span>
          </div>
          <div class="miniStat">
            <span class="miniLabel">Damage Multiplier</span>
            <span class="miniValue">{{ drDamageMultiplier.toFixed(3) }}×</span>
            <span class="statSub">{{ 100 - drReductionPercent }}% damage taken</span>
          </div>
          <div class="miniStat">
            <span class="miniLabel">Actual Damage Taken</span>
            <span class="miniValue textGold">{{ drDamageTaken }}</span>
            <span class="statSub">From {{ drIncomingDamage }} raw hit</span>
          </div>
          <div class="miniStat">
            <span class="miniLabel">Effective Health (EHP)</span>
            <span class="miniValue textTeal">{{ drEhpMultiplier.toFixed(2) }}×</span>
            <span class="statSub">+{{ ((drEhpMultiplier - 1) * 100).toFixed(0) }}% survival capacity</span>
          </div>
        </div>
      </div>

      <div class="insightBox">
        <strong>Mechanical Insight:</strong> Damage reduction is computed as <code>floor((100 × DEF) / (50 + DEF))</code>.
        At <strong>50 DEF</strong>, incoming damage is reduced by exactly <strong>50%</strong>, doubling Effective Health (2.0× EHP).
        Every 50 points of Defense linearly grants another +100% of base health in effective durability (+2% EHP per DEF point).
      </div>
    </section>
  </div>
</template>

<style scoped>
.calcPage {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.tabBar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tabBtn {
  padding: 7px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tabBtn:hover {
  border-color: var(--brand-primary);
  color: var(--text-primary);
}

.tabBtn.active {
  background: rgba(110, 168, 254, 0.16);
  border-color: var(--brand-primary);
  color: #93c5fd;
}

.calcPanel {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.panelHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.85rem;
}

.panelHead h2 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-gold);
  border: none;
  padding: 0;
}

.panelSub {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.presetGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.presetBtn {
  padding: 4px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
}

.presetBtn:hover {
  border-color: var(--brand-primary);
  color: var(--text-primary);
}

.calcGrid.twoCol {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.petTwoPanels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: start;
}

.subPanel {
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.subTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.subTitle {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.inputSection,
.resultSection {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.stagePairGrid,
.twoFieldRow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.stageBox {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.boxTitle {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-gold);
}

.fieldStack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fieldLabel {
  font-size: 0.77rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.mutedHint {
  color: var(--text-muted);
  font-weight: 500;
}

.calcInput {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 600;
  outline: none;
}

.calcInput:focus {
  border-color: var(--brand-primary);
}

.calcInput optgroup {
  background: var(--bg-card);
  color: var(--text-gold);
  font-weight: 700;
}

.calcInput option {
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 500;
}

.warnBox {
  padding: 8px 11px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.38);
  color: #fbbf24;
  font-size: 0.82rem;
}

.primaryStats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.statCard {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.85rem 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.statCard.highlightCard {
  border-color: rgba(110, 168, 254, 0.35);
  background: linear-gradient(180deg, rgba(110, 168, 254, 0.08) 0%, var(--bg-inset) 100%);
}

.statLabel {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.statValue {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.statSub {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.secondaryStats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.secondaryStats.threeCol {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.miniStat {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 7px;
  padding: 0.6rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.miniLabel {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.miniValue {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.breakdownWrap {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem 0.85rem;
}

.breakdownTitle {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.tableScroll {
  max-height: 250px;
  overflow-y: auto;
}

.miniTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.miniTable th {
  text-align: left;
  color: var(--text-muted);
  font-weight: 600;
  padding: 5px 6px;
  border-bottom: 1px solid var(--border-subtle);
}

.miniTable td {
  padding: 5px 6px;
  color: var(--text-secondary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.miniTable .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  font-weight: 600;
}

.ascText {
  color: #fbbf24;
  font-weight: 600;
}

.mergeProgressCard {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mergeProgressHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.monoVal {
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.progressBarTrack {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progressBarFill {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #93c5fd);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.mergeProgressFoot {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.traitSlotBar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slotTitle {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-muted);
}

.slotChips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.slotChip {
  font-size: 0.74rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #6ee7b7;
}

.slotChip.locked {
  background: var(--bg-inset);
  border-color: var(--border-subtle);
  color: var(--text-muted);
}

.traitPreviews {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.traitPreviewCard {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
}

.tpHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.tpName {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
}

.tpBadge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
}

.tpBadge.basic {
  background: rgba(96, 165, 250, 0.14);
  color: #93c5fd;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.tpBadge.rare {
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.tpDesc {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.tpUpgrade {
  margin: 6px 0 0;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.76rem;
  color: var(--text-muted);
  line-height: 1.4;
}

@media (max-width: 1020px) {
  .calcGrid.twoCol,
  .petTwoPanels {
    grid-template-columns: 1fr;
  }
}

.presetBtn.active {
  background: rgba(110, 168, 254, 0.2);
  border-color: var(--brand-primary);
  color: #93c5fd;
  font-weight: 700;
}

.drInputsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.sliderAndNum {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rangeSlider {
  flex: 1;
  accent-color: var(--brand-primary);
  cursor: pointer;
}

.calcInput.smallNum {
  width: 82px;
  text-align: right;
}

.drResultsSection {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 0.9rem;
}

.drMainCard {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 10px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 6px;
}

.drMainTitle {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6ee7b7;
  letter-spacing: 0.04em;
}

.drMainVal {
  font-size: 2.25rem;
  font-weight: 800;
  color: #a7f3d0;
  line-height: 1.1;
}

.drProgressFill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
  border-radius: 999px;
  transition: width 0.15s ease;
}

.textGold {
  color: #fbbf24;
}

.textTeal {
  color: #38bdf8;
}

.insightBox {
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text-secondary);
  background: var(--bg-inset);
  border-left: 3px solid var(--brand-primary);
  padding: 0.75rem 1rem;
  border-radius: 0 6px 6px 0;
}

.insightBox strong {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .drResultsSection {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stagePairGrid,
  .twoFieldRow,
  .primaryStats,
  .secondaryStats,
  .secondaryStats.threeCol {
    grid-template-columns: 1fr;
  }
}
</style>
