<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { base } from '../lib/base';
import { formatStat } from '../lib/stats';
import { parseCoins } from '../lib/currency';

interface SkillDetail {
  key: string;
  name: string;
  description: string;
}

interface SimClass {
  id: string;
  name: string;
  category: string;
  tier: number;
  maxLevel: number;
  weaponType: string;
  armorType: string;
  sprite: string;
  description?: string;
  stats: Record<string, number>;
  attackConstitutionScaling: number;
  attackDexterityScaling: number;
  attackIntelligenceScaling: number;
  activeSkillKey: string;
  passiveSkillKey: string;
  activeSkillDetail?: SkillDetail | null;
  passiveSkillDetail?: SkillDetail | null;
  promotesTo?: string[];
  promotesFrom?: string[];
  innate?: {
    threat?: number;
    darknessReduction?: number;
    hitChanceBonus?: number;
    poisonBonus?: number;
  };
}

interface SimEquip {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
  sprite: string;
  description?: string;
  stats: Record<string, number>;
  flags?: Record<string, boolean>;
  overrides?: Record<string, string>;
  notes?: string;
}

interface SimTrait {
  key: string;
  name: string;
  category: 'basic' | 'rare';
  plus: boolean;
  description: string;
}

const props = defineProps<{
  classes: SimClass[];
  weapons: SimEquip[];
  armors: SimEquip[];
  accessories: SimEquip[];
  traits: SimTrait[];
  basePath?: string;
}>();

const resolvedBase = computed(() => props.basePath ?? base);

const CATEGORIES = ['All', 'Footman', 'Apprentice', 'Archer', 'Rogue', 'Outlander'] as const;
const CATEGORY_SPRITES: Record<string, string> = {
  Footman: 'unit_footman',
  Apprentice: 'unit_apprentice',
  Archer: 'unit_archer',
  Rogue: 'unit_rogue',
  Outlander: 'unit_outlander',
};

const WEAPON_CATEGORY_BY_TYPE: Record<string, string> = {
  sword: 'Sword',
  axe: 'Axe',
  bow: 'Bow',
  dagger: 'Dagger',
  staff: 'Staff',
};

const ARMOR_CATEGORY_BY_TYPE: Record<string, string> = {
  heavy: 'HeavyArmor',
  medium: 'MediumArmor',
  light: 'LightArmor',
};

const WEAPON_TYPE_LABEL: Record<string, string> = {
  sword: 'Sword',
  axe: 'Axe',
  bow: 'Bow',
  dagger: 'Dagger',
  staff: 'Staff',
};

const ARMOR_TYPE_LABEL: Record<string, string> = {
  heavy: 'Heavy Armor',
  medium: 'Medium Armor',
  light: 'Light Armor',
};

const DEFAULT_DELTA_BY_CAT: Record<string, number> = {
  Sword: 0.15,
  Axe: 0.20,
  Bow: 0.10,
  Dagger: 0.25,
  Staff: 0.05,
};

const selectedCategory = ref<string>('All');
const selectedClassId = ref<string>(props.classes[0]?.id || '');
const level = ref<number>(props.classes[0]?.maxLevel || 5);
const ascended = ref<boolean>(false);
const traitCommonKey = ref<string>('');
const traitRareKey = ref<string>('');
const allowAllWeapons = ref<boolean>(false);
const selectedWeaponId = ref<string>('');
const selectedArmorId = ref<string>('');
const selectedAccessoryId = ref<string>('');

const activeSlotModal = ref<'weapon' | 'armor' | 'accessory' | null>(null);
const equipSearchQuery = ref<string>('');
const equipSortBy = ref<'price-desc' | 'price-asc' | 'name'>('price-desc');

const classById = computed(() => new Map(props.classes.map((c) => [c.id, c])));
const weaponById = computed(() => new Map(props.weapons.map((w) => [w.id, w])));
const armorById = computed(() => new Map(props.armors.map((a) => [a.id, a])));
const accessoryById = computed(() => new Map(props.accessories.map((a) => [a.id, a])));

const selectedClass = computed<SimClass | undefined>(() => {
  return classById.value.get(selectedClassId.value) ?? props.classes[0];
});

const filteredClasses = computed(() => {
  if (selectedCategory.value === 'All') return props.classes;
  return props.classes.filter((c) => c.category === selectedCategory.value);
});

const commonTraits = computed(() => props.traits.filter((t) => t.category === 'basic'));
const rareTraits = computed(() => props.traits.filter((t) => t.category === 'rare'));

const selectedCommonTrait = computed(() => commonTraits.value.find((t) => t.key === traitCommonKey.value) ?? null);
const selectedRareTrait = computed(() => rareTraits.value.find((t) => t.key === traitRareKey.value) ?? null);

const equippedWeapon = computed(() => (selectedWeaponId.value ? weaponById.value.get(selectedWeaponId.value) ?? null : null));
const equippedArmor = computed(() => (selectedArmorId.value ? armorById.value.get(selectedArmorId.value) ?? null : null));
const equippedAccessory = computed(() => (selectedAccessoryId.value ? accessoryById.value.get(selectedAccessoryId.value) ?? null : null));

// Promotion & Demotion relations for quick lineage switching
const lineage = computed(() => {
  const cur = selectedClass.value;
  if (!cur) return { demotions: [] as SimClass[], promotions: [] as SimClass[] };
  const demotionsMap = new Map<string, SimClass>();
  const promotionsMap = new Map<string, SimClass>();

  for (const id of cur.promotesFrom ?? []) {
    const c = classById.value.get(id);
    if (c) demotionsMap.set(c.id, c);
  }
  for (const id of cur.promotesTo ?? []) {
    const c = classById.value.get(id);
    if (c) promotionsMap.set(c.id, c);
  }
  for (const c of props.classes) {
    if (c.promotesTo?.includes(cur.id)) demotionsMap.set(c.id, c);
    if (c.promotesFrom?.includes(cur.id)) promotionsMap.set(c.id, c);
  }

  const sortFn = (a: SimClass, b: SimClass) => a.tier - b.tier || a.name.localeCompare(b.name);
  return {
    demotions: [...demotionsMap.values()].sort(sortFn),
    promotions: [...promotionsMap.values()].sort(sortFn),
  };
});

function syncUrlClass(id: string) {
  if (typeof window === 'undefined' || !id) return;
  const url = new URL(window.location.href);
  url.searchParams.set('class', id);
  window.history.replaceState({}, '', url.toString());
}

function unequipIncompatible(cls: SimClass) {
  if (equippedWeapon.value && !allowAllWeapons.value) {
    const expectedCat = WEAPON_CATEGORY_BY_TYPE[cls.weaponType];
    if (expectedCat && equippedWeapon.value.category !== expectedCat) {
      selectedWeaponId.value = '';
    }
  }
  if (equippedArmor.value) {
    const expectedCat = ARMOR_CATEGORY_BY_TYPE[cls.armorType];
    if (expectedCat && equippedArmor.value.category !== expectedCat) {
      selectedArmorId.value = '';
    }
  }
}

function selectClass(id: string) {
  const target = classById.value.get(id);
  if (!target) return;
  selectedClassId.value = target.id;
  if (selectedCategory.value !== 'All' && selectedCategory.value !== target.category) {
    selectedCategory.value = target.category;
  }
  level.value = target.maxLevel || 5;
  unequipIncompatible(target);
  syncUrlClass(target.id);
}

function selectCategory(cat: string) {
  selectedCategory.value = cat;
  if (cat !== 'All' && selectedClass.value && selectedClass.value.category !== cat) {
    const first = props.classes.find((c) => c.category === cat);
    if (first) selectClass(first.id);
  }
}

watch(allowAllWeapons, (allowed) => {
  if (!allowed && selectedClass.value) {
    unequipIncompatible(selectedClass.value);
  }
});

watch(level, (val) => {
  const maxLv = selectedClass.value?.maxLevel || 45;
  if (!Number.isFinite(val) || val < 1) level.value = 1;
  else if (val > maxLv) level.value = maxLv;
  else level.value = Math.floor(val);
});

function resetBuild() {
  if (selectedClass.value) {
    level.value = selectedClass.value.maxLevel || 5;
  }
  ascended.value = false;
  traitCommonKey.value = '';
  traitRareKey.value = '';
  allowAllWeapons.value = false;
  selectedWeaponId.value = '';
  selectedArmorId.value = '';
  selectedAccessoryId.value = '';
}

// Equipment modal helpers
const modalCompatibleItems = computed<SimEquip[]>(() => {
  const slot = activeSlotModal.value;
  if (!slot || !selectedClass.value) return [];
  let list: SimEquip[] = [];
  if (slot === 'weapon') {
    if (allowAllWeapons.value) {
      list = props.weapons;
    } else {
      const expectedCat = WEAPON_CATEGORY_BY_TYPE[selectedClass.value.weaponType];
      list = expectedCat ? props.weapons.filter((w) => w.category === expectedCat) : props.weapons;
    }
  } else if (slot === 'armor') {
    const expectedCat = ARMOR_CATEGORY_BY_TYPE[selectedClass.value.armorType];
    list = expectedCat ? props.armors.filter((a) => a.category === expectedCat) : props.armors;
  } else {
    list = props.accessories;
  }

  const q = equipSearchQuery.value.trim().toLowerCase();
  const filtered = q
    ? list.filter((item) => {
        if (item.name.toLowerCase().includes(q)) return true;
        if (item.category.toLowerCase().includes(q)) return true;
        if (item.description && item.description.toLowerCase().includes(q)) return true;
        if (item.notes && item.notes.toLowerCase().includes(q)) return true;
        return Object.entries(item.stats || {}).some(([k, v]) =>
          formatStat(k, Number(v)).toLowerCase().includes(q)
        );
      })
    : [...list];

  return filtered.sort((a, b) => {
    if (equipSortBy.value === 'name') return a.name.localeCompare(b.name);
    if (equipSortBy.value === 'price-asc') return (a.price ?? 0) - (b.price ?? 0) || a.name.localeCompare(b.name);
    return (b.price ?? 0) - (a.price ?? 0) || a.name.localeCompare(b.name);
  });
});

function openSlotModal(slot: 'weapon' | 'armor' | 'accessory') {
  activeSlotModal.value = slot;
  equipSearchQuery.value = '';
}

function closeSlotModal() {
  activeSlotModal.value = null;
}

function pickEquipment(itemId: string) {
  if (activeSlotModal.value === 'weapon') selectedWeaponId.value = itemId;
  else if (activeSlotModal.value === 'armor') selectedArmorId.value = itemId;
  else if (activeSlotModal.value === 'accessory') selectedAccessoryId.value = itemId;
  closeSlotModal();
}

function clearSlot(slot: 'weapon' | 'armor' | 'accessory') {
  if (slot === 'weapon') selectedWeaponId.value = '';
  else if (slot === 'armor') selectedArmorId.value = '';
  else if (slot === 'accessory') selectedAccessoryId.value = '';
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && activeSlotModal.value) {
    closeSlotModal();
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const classParam = new URLSearchParams(window.location.search).get('class');
    if (classParam && classById.value.has(classParam)) {
      selectClass(classParam);
    }
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
});

// Helper: common trait stat multiplier (index: 0=CON, 1=INT, 2=DEX, 3=HP, 4=DEF, 5=MDEF)
function getCommonTraitMultiplier(traitKey: string, statIdx: number): number {
  switch (traitKey) {
    case 'BOOKWORM':
      return statIdx === 1 ? 1.1 : statIdx === 0 || statIdx === 2 ? 0.95 : 1.0;
    case 'FERAL':
      return statIdx === 2 ? 1.1 : statIdx === 0 || statIdx === 1 ? 0.95 : 1.0;
    case 'BRUTE':
      return statIdx === 0 ? 1.1 : statIdx === 1 || statIdx === 2 ? 0.95 : 1.0;
    case 'BOOKWORM_PLUS':
      return statIdx === 1 ? 1.2 : 1.0;
    case 'FERAL_PLUS':
      return statIdx === 2 ? 1.2 : 1.0;
    case 'BRUTE_PLUS':
      return statIdx === 0 ? 1.2 : 1.0;
    case 'VERSATILE':
      return 1.04;
    case 'VERSATILE_PLUS':
      return 1.07;
    case 'ZEALOUS':
      return statIdx === 0 || statIdx === 1 ? 1.05 : statIdx === 2 ? 0.9 : 1.0;
    case 'CUNNING':
      return statIdx === 1 || statIdx === 2 ? 1.05 : statIdx === 0 ? 0.9 : 1.0;
    case 'ATHLETIC':
      return statIdx === 0 || statIdx === 2 ? 1.05 : statIdx === 1 ? 0.9 : 1.0;
    case 'ZEALOUS_PLUS':
      return statIdx === 0 || statIdx === 1 ? 1.1 : 1.0;
    case 'CUNNING_PLUS':
      return statIdx === 1 || statIdx === 2 ? 1.1 : 1.0;
    case 'ATHLETIC_PLUS':
      return statIdx === 0 || statIdx === 2 ? 1.1 : 1.0;
    default:
      return 1.0;
  }
}

const equippedGear = computed(() => {
  return [equippedWeapon.value, equippedArmor.value, equippedAccessory.value].filter(Boolean) as SimEquip[];
});

function sumGearStat(key: string): number {
  return equippedGear.value.reduce((acc, g) => acc + Number(g.stats?.[key] ?? 0), 0);
}

function hasGearFlag(flag: string): boolean {
  return equippedGear.value.some((g) => Boolean(g.flags?.[flag]));
}

// Full simulated stats matching Adventurer.kt & Entity.kt
const computedStats = computed(() => {
  const cls = selectedClass.value;
  if (!cls) return null;

  const s = cls.stats ?? {};
  const lv = Math.max(1, Math.min(cls.maxLevel || 45, level.value));
  const ascMult = ascended.value ? 1.5 : 1.0;
  const tc = traitCommonKey.value;
  const tr = traitRareKey.value;
  const passive = cls.passiveSkillKey || 'PASSIVE_NONE';

  const baseCon = s.baseConstitution ?? 0;
  const baseInt = s.baseIntelligence ?? 0;
  const baseDex = s.baseDexterity ?? 0;
  const baseMaxHp = s.baseMaxHp ?? 0;
  const baseDef = s.baseDefense ?? 0;
  const baseMdef = s.baseMagicDefense ?? 0;

  const rawCon = Math.floor(baseCon * ascMult) + sumGearStat('constitution');
  const rawInt = Math.floor(baseInt * ascMult) + sumGearStat('intelligence');
  const rawDex = Math.floor(baseDex * ascMult) + sumGearStat('dexterity');
  const rawHp = Math.floor((baseMaxHp + lv - 1) * ascMult) + sumGearStat('maxHp');
  const rawDef = baseDef + sumGearStat('defense');
  const rawMdef = baseMdef + sumGearStat('magicDefense');

  const totalCon = Math.round(rawCon * getCommonTraitMultiplier(tc, 0));
  const totalInt = Math.round(rawInt * getCommonTraitMultiplier(tc, 1));
  const totalDex = Math.round(rawDex * getCommonTraitMultiplier(tc, 2));
  const totalHp = Math.round(rawHp * getCommonTraitMultiplier(tc, 3));
  const totalDef = Math.round(rawDef * getCommonTraitMultiplier(tc, 4));
  const totalMdef = Math.round(rawMdef * getCommonTraitMultiplier(tc, 5));

  const threat = Math.max(
    1,
    (cls.innate?.threat ?? 1) + sumGearStat('threat') + (tr === 'INTIMIDATING' ? 2 : tr === 'INTIMIDATING_PLUS' ? 4 : 0)
  );

  // Weapon scaling & Attack Damage
  const conScaling = cls.attackConstitutionScaling ?? 0;
  const intScaling = cls.attackIntelligenceScaling ?? 0;
  const dexScaling = cls.attackDexterityScaling ?? 0;

  const w = equippedWeapon.value;
  let minDmg = 1;
  let maxDmg = 1;
  let isRanged = false;
  let isMagic = false;

  if (w) {
    isRanged = w.overrides?.isRanged === 'true' || w.category === 'Bow' || w.category === 'Staff';
    isMagic = w.overrides?.isMagic === 'true' || w.category === 'Staff';

    const scaledCon = Math.round(totalCon * conScaling);
    const scaledInt = Math.round(totalInt * intScaling);
    const scaledDex = Math.round(totalDex * dexScaling);

    let damageModifier = w.category === 'Axe' ? scaledCon + scaledInt : scaledCon + scaledInt + scaledDex;
    if (w.id === 'ColossalSword') {
      damageModifier = (scaledCon >= 120 ? scaledCon : Math.floor(scaledCon / 2)) + scaledInt + scaledDex;
    } else if (w.id === 'VoidCrusher') {
      damageModifier = (scaledCon >= 275 ? scaledCon : Math.floor(scaledCon / 2)) + scaledInt + scaledDex;
    } else if (w.id === 'SerpentSting') {
      damageModifier = (scaledCon + scaledInt + scaledDex) * 3;
    } else if (w.id === 'StaffOfTheArchmage') {
      damageModifier = Math.floor((scaledCon + scaledInt + scaledDex) * 1.07875);
    }

    if (w.id === 'SerpentBite') {
      damageModifier *= threat;
    }

    let delta = DEFAULT_DELTA_BY_CAT[w.category] ?? 0.15;
    if (w.overrides?.damageDelta) {
      const parsedDelta = Number(w.overrides.damageDelta);
      if (Number.isFinite(parsedDelta)) delta = parsedDelta;
    }

    minDmg = Math.round(damageModifier * (1 - delta));
    maxDmg = Math.round(damageModifier * (1 + delta));
  }

  // Attack Speed
  let passiveSpeed = 0;
  if (passive === 'PASSIVE_DEADLY_FINESSE_I') passiveSpeed = 50;
  else if (passive === 'PASSIVE_DEADLY_FINESSE_II') passiveSpeed = 75;
  else if (passive === 'PASSIVE_DEADLY_FINESSE_III') passiveSpeed = 100;
  const attackSpeed = 100 + (s.attackSpeed ?? 0) + sumGearStat('attackSpeed') + passiveSpeed;

  // Crit Chance & Damage
  const baseCritChance =
    (s.criticalChance ?? 0) +
    (tr === 'DEADEYE' ? 0.12 : 0) +
    (passive === 'PASSIVE_KEEN_VISION' ? 0.10 : 0);
  const gearCritChance = sumGearStat('criticalChance');
  const physCritChance = baseCritChance + gearCritChance + sumGearStat('physicalCriticalChanceBonus');
  const spellCritChance = baseCritChance + gearCritChance + sumGearStat('spellCriticalChanceBonus');

  const baseCritDmg = 1.5 + (s.criticalDamage ?? 0) + (passive === 'PASSIVE_KEEN_VISION' ? 0.25 : 0);
  const gearCritDmg = sumGearStat('criticalDamage');
  const ruthlessMult = tr === 'RUTHLESS' ? 1.2 : tr === 'RUTHLESS_PLUS' ? 1.3 : 1.0;
  const physCritDmg = (baseCritDmg + gearCritDmg + sumGearStat('physicalCriticalDamageBonus')) * ruthlessMult;
  const spellCritDmg = (baseCritDmg + gearCritDmg + sumGearStat('spellCriticalDamageBonus')) * ruthlessMult;

  // Mitigation & Defense
  const defMitigationPct = totalDef > 0 ? Math.round((totalDef * 100) / (totalDef + 50)) : 0;
  const mdefMitigationPct = totalMdef > 0 ? Math.round((totalMdef * 100) / (totalMdef + 50)) : 0;
  const flatDamageReduction = Math.floor(totalCon / 8);

  const dodgeChance =
    (s.flatDodgeChance ?? 0) +
    sumGearStat('flatDodgeChance') +
    (tr === 'NIMBLE' ? 0.10 : tr === 'NIMBLE_PLUS' ? 0.15 : 0);

  // Mana & Lifesteal
  const manaRegen = 10 + Math.floor(totalInt / 10) + sumGearStat('manaRegen') + (tr === 'GIFTED' ? 2 : tr === 'GIFTED_PLUS' ? 4 : 0);
  const turnsToCast = Math.ceil(100 / Math.max(1, manaRegen));

  const lifesteal =
    (s.baseLifesteal ?? 0) +
    sumGearStat('lifesteal') +
    (tr === 'CURSED' ? 20 : tr === 'CURSED_PLUS' ? 30 : 0);

  // Troll Blood & Regeneration
  const tierRank = Math.floor((cls.maxLevel || 5) / 5);
  const effectiveRank = tierRank + (ascended.value ? 9 : 0);
  let trollBloodBonus = 0;
  if (tr === 'TROLL_BLOOD_PLUS') {
    trollBloodBonus = Math.floor((totalHp * effectiveRank + 100) / 200);
  } else if (tr === 'TROLL_BLOOD') {
    trollBloodBonus = Math.floor((totalHp * effectiveRank + 200) / 400);
  }
  const regeneration = (s.regeneration ?? 0) + sumGearStat('regeneration') + trollBloodBonus;

  // Damage Dealt & Taken
  const damageDealt = Math.max(0, 1.0 + sumGearStat('damageDealtModifier') + (tr === 'RECKLESS' ? 0.15 : 0));

  let dragonBloodReduction = 0;
  if (tr === 'DRAGON_BLOOD_PLUS') {
    dragonBloodReduction = effectiveRank * 0.01;
  } else if (tr === 'DRAGON_BLOOD') {
    dragonBloodReduction = effectiveRank * 0.005;
  }
  const damageTaken = Math.max(0, 1.0 + sumGearStat('damageTakenModifier') + (tr === 'RECKLESS' ? 0.15 : 0) - dragonBloodReduction);

  let deadlyFinessePenalty = 0;
  if (passive === 'PASSIVE_DEADLY_FINESSE_I') deadlyFinessePenalty = 0.25;
  else if (passive === 'PASSIVE_DEADLY_FINESSE_II') deadlyFinessePenalty = 0.35;
  else if (passive === 'PASSIVE_DEADLY_FINESSE_III') deadlyFinessePenalty = 0.50;
  const normalAttackAmp = Math.max(0, 1.0 + sumGearStat('normalAttackAmpModifier') - deadlyFinessePenalty);
  const skillAmp = Math.max(0, 1.0 + sumGearStat('skillAmpModifier'));

  let passiveArmorPen = 0;
  if (passive === 'PASSIVE_KEEN_VISION') passiveArmorPen = 0.10;
  else if (passive === 'PASSIVE_AETHER_RESONANCE_I') passiveArmorPen = 0.10;
  else if (passive === 'PASSIVE_AETHER_RESONANCE_II') passiveArmorPen = 0.20;
  else if (passive === 'PASSIVE_AETHER_RESONANCE_III') passiveArmorPen = 0.30;
  else if (passive === 'PASSIVE_AETHER_RESONANCE_IV') passiveArmorPen = 0.40;
  else if (passive === 'PASSIVE_AETHER_RESONANCE_V') passiveArmorPen = 0.50;
  else if (passive === 'PASSIVE_AETHER_RESONANCE_VI') passiveArmorPen = 0.60;
  else if (passive === 'PASSIVE_AETHER_RESONANCE_VII') passiveArmorPen = 0.70;
  const armorPenetration = Math.min(0.90, passiveArmorPen + (tr === 'SUNDERING' ? 0.15 : 0));

  let passiveCounter = 0;
  if (passive === 'PASSIVE_FOCUSED_EYE') passiveCounter = 0.20;
  else if (passive === 'PASSIVE_PERCEPTIVE_EYE') passiveCounter = tierRank >= 6 ? 0.40 : 0.30;
  else if (passive === 'PASSIVE_OMNISCIENT_EYE') passiveCounter = 0.50;
  const counterattack = (s.counterattack ?? 0) + sumGearStat('counterattack') + (tr === 'REACTIVE' ? 0.10 : 0) + passiveCounter;

  const statusImmunity = (s.immunityToStatus ?? 0) + sumGearStat('immunityToStatus') + (tr === 'MINDFUL' ? 0.10 : 0);
  const zeroHealing = hasGearFlag('zeroHealing');
  const healingModifier = zeroHealing
    ? 0
    : (1.0 + sumGearStat('healingModifier')) * (tr === 'EMPATHETIC' ? 1.2 : tr === 'EMPATHETIC_PLUS' ? 1.4 : 1.0);

  const darknessReduction = (cls.innate?.darknessReduction ?? 0) + sumGearStat('darknessReduction') + (tr === 'BLESSED' ? 10 : 0);
  const darknessDamageAmp =
    (s.darknessDamageAmplification ?? 0) +
    sumGearStat('darknessDamageAmplification') +
    (tr === 'NOCTURNAL' ? 0.01 : tr === 'NOCTURNAL_PLUS' ? 0.015 : 0);

  const gearDecay = sumGearStat('decay');
  const decay =
    tr === 'CURSED' || tr === 'CURSED_PLUS'
      ? Math.max(1, Math.round(gearDecay + totalHp * 0.02))
      : gearDecay;

  const expMultiplier = 1.0 + sumGearStat('bonusExperience') / 100.0;
  const hitChanceBonus = (cls.innate?.hitChanceBonus ?? 0) + (tr === 'FOCUSED' ? 0.25 : 0);

  const initiative = tr === 'ALERT' || tr === 'ALERT_PLUS' || hasGearFlag('initiative');
  const alwaysHits =
    passive === 'PASSIVE_PERCEPTIVE_EYE' ||
    passive === 'PASSIVE_OMNISCIENT_EYE' ||
    hasGearFlag('alwaysHits');

  const physRetaliation = (s.retaliationPhysicalDamage ?? 0) + sumGearStat('retaliationPhysicalDamage');
  const magRetaliation = (s.retaliationMagicalDamage ?? 0) + sumGearStat('retaliationMagicalDamage');
  const blockChance = sumGearStat('blockChance');
  const physBlockChance = blockChance + sumGearStat('physicalBlockChance');
  const magicBlockChance = blockChance + sumGearStat('magicBlockChance');
  const guard = sumGearStat('guard');
  const menace = sumGearStat('menace');
  const specialDamage = Math.max(0, 1.0 + sumGearStat('specialDamageModifier'));
  const attackSpeedDragReduction = Math.min(1, sumGearStat('attackSpeedDragReduction'));
  const rangedDragReduction = Math.min(1, sumGearStat('rangedDragReduction'));
  const pressureReduction = sumGearStat('pressureReduction');
  const statusResistance = Math.min(1, sumGearStat('resistanceToStatus'));
  const fortifiedShield = tr === 'FORTIFIED' ? Math.round(totalHp * 0.15) : 0;

  return {
    lv,
    totalHp,
    totalCon,
    totalInt,
    totalDex,
    totalDef,
    totalMdef,
    conScaling,
    intScaling,
    dexScaling,
    minDmg,
    maxDmg,
    isRanged,
    isMagic,
    attackTypeLabel: `${isRanged ? 'Ranged' : 'Melee'}, ${isMagic ? 'Magic' : 'Physical'}`,
    attackSpeed,
    physCritChance,
    spellCritChance,
    physCritDmg,
    spellCritDmg,
    defMitigationPct,
    mdefMitigationPct,
    flatDamageReduction,
    dodgeChance,
    manaRegen,
    turnsToCast,
    lifesteal,
    regeneration,
    damageDealt,
    damageTaken,
    normalAttackAmp,
    skillAmp,
    armorPenetration,
    counterattack,
    threat,
    statusImmunity,
    healingModifier,
    darknessReduction,
    darknessDamageAmp,
    decay,
    expMultiplier,
    hitChanceBonus,
    initiative,
    alwaysHits,
    zeroHealing,
    physRetaliation,
    magRetaliation,
    physBlockChance,
    magicBlockChance,
    guard,
    menace,
    specialDamage,
    attackSpeedDragReduction,
    rangedDragReduction,
    pressureReduction,
    statusResistance,
    fortifiedShield,
  };
});

function formatScalingBadge(mult: number): string {
  if (!mult || mult <= 0) return '';
  return `${Math.round(mult * 100)}%`;
}

function formatPct(val: number, decimals = 0): string {
  const num = val * 100;
  return `${decimals > 0 ? Number(num.toFixed(decimals)) : Math.round(num)}%`;
}
</script>

<template>
  <div class="simRoot">
    <!-- Top Header -->
    <div class="simHeader">
      <div>
        <h1>Build Simulator</h1>
        <p class="simSubtitle">
          Select a class, tune level, ascension, traits, and equipment to inspect computed combat stats and skills.
        </p>
      </div>
      <div class="simHeaderActions">
        <a
          v-if="selectedClass"
          :href="`${resolvedBase}/classes/${selectedClass.id}`"
          class="actionBtn secondaryBtn"
        >
          View Class Page
        </a>
        <button type="button" class="actionBtn resetBtn" @click="resetBuild">
          Reset Build
        </button>
      </div>
    </div>

    <!-- Class Tree Filter Tabs -->
    <div class="categoryTabs" role="tablist" aria-label="Class trees">
      <button
        v-for="cat in CATEGORIES"
        :key="cat"
        type="button"
        role="tab"
        :aria-selected="selectedCategory === cat"
        class="catBtn"
        :class="{ active: selectedCategory === cat }"
        @click="selectCategory(cat)"
      >
        <img
          v-if="CATEGORY_SPRITES[cat]"
          :src="`${resolvedBase}/images/${CATEGORY_SPRITES[cat]}.png`"
          :alt="cat"
          class="sprite catSprite"
          width="24"
          height="24"
        />
        <span>{{ cat }}</span>
      </button>
    </div>

    <!-- Main 2-Column Simulator Layout -->
    <div v-if="selectedClass && computedStats" class="simLayout">
      <!-- LEFT COLUMN: Unit Setup & Equipment Slots -->
      <div class="simConfigCol">
        <!-- Unit Selector & Progression Card -->
        <section class="panel">
          <div class="panelTitleRow">
            <h2>Unit Configuration</h2>
            <span class="tierBadge">Tier {{ selectedClass.tier }}</span>
          </div>

          <div class="unitPreviewRow">
            <div class="unitSpriteFrame" :class="{ ascendedFrame: ascended }">
              <img
                :src="`${resolvedBase}/images/${selectedClass.sprite}.png`"
                :alt="selectedClass.name"
                class="sprite unitSprite"
                width="72"
                height="72"
              />
            </div>

            <div class="unitSelectWrap">
              <label for="simClassSelect" class="fieldLabel">Adventurer Class</label>
              <select
                id="simClassSelect"
                :value="selectedClass.id"
                class="simSelect"
                @change="selectClass(($event.target as HTMLSelectElement).value)"
              >
                <option v-for="c in filteredClasses" :key="c.id" :value="c.id">
                  [T{{ c.tier }}] {{ c.name }} ({{ c.category }})
                </option>
              </select>

              <div class="unitAffinityTags">
                <span class="affinityTag">{{ WEAPON_TYPE_LABEL[selectedClass.weaponType] || selectedClass.weaponType }}</span>
                <span class="affinityTag">{{ ARMOR_TYPE_LABEL[selectedClass.armorType] || selectedClass.armorType }}</span>
                <span class="affinityTag">Cap Lv. {{ selectedClass.maxLevel }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Promotion Lineage Switcher -->
          <div v-if="lineage.demotions.length || lineage.promotions.length" class="lineageBar">
            <div v-if="lineage.demotions.length" class="lineageGroup">
              <span class="lineageLabel">From:</span>
              <button
                v-for="d in lineage.demotions"
                :key="d.id"
                type="button"
                class="lineageChip"
                @click="selectClass(d.id)"
              >
                <img :src="`${resolvedBase}/images/${d.sprite}.png`" :alt="d.name" class="sprite" width="20" height="20" />
                <span>{{ d.name }}</span>
              </button>
            </div>
            <div v-if="lineage.promotions.length" class="lineageGroup">
              <span class="lineageLabel">Promotes To:</span>
              <button
                v-for="p in lineage.promotions"
                :key="p.id"
                type="button"
                class="lineageChip promoteChip"
                @click="selectClass(p.id)"
              >
                <img :src="`${resolvedBase}/images/${p.sprite}.png`" :alt="p.name" class="sprite" width="20" height="20" />
                <span>{{ p.name }}</span>
              </button>
            </div>
          </div>

          <!-- Level & Ascension -->
          <div class="controlGrid">
            <div class="fieldBlock">
              <div class="fieldHead">
                <label for="simLevelInput" class="fieldLabel">Level ({{ computedStats.lv }} / {{ selectedClass.maxLevel }})</label>
                <button
                  type="button"
                  class="miniBtn"
                  :disabled="computedStats.lv === selectedClass.maxLevel"
                  @click="level = selectedClass.maxLevel"
                >
                  Max
                </button>
              </div>
              <div class="levelRow">
                <input
                  id="simLevelRange"
                  v-model.number="level"
                  type="range"
                  :min="1"
                  :max="selectedClass.maxLevel"
                  class="levelSlider"
                />
                <input
                  id="simLevelInput"
                  v-model.number="level"
                  type="number"
                  :min="1"
                  :max="selectedClass.maxLevel"
                  class="levelNum"
                />
              </div>
            </div>

            <div class="fieldBlock ascendBlock">
              <span class="fieldLabel">Ascension</span>
              <label class="toggleCard" :class="{ active: ascended }">
                <input v-model="ascended" type="checkbox" class="toggleCheck" />
                <div class="toggleInfo">
                  <span class="toggleTitle">{{ ascended ? 'Ascended' : 'Not Ascended' }}</span>
                  <span class="toggleSub">+50% Base HP, CON, INT, DEX</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Traits -->
          <div class="traitGrid">
            <div class="fieldBlock">
              <label for="simTraitCommon" class="fieldLabel">Common Trait</label>
              <select id="simTraitCommon" v-model="traitCommonKey" class="simSelect">
                <option value="">None</option>
                <option v-for="t in commonTraits" :key="t.key" :value="t.key">
                  {{ t.name }}
                </option>
              </select>
              <p v-if="selectedCommonTrait" class="traitHint">{{ selectedCommonTrait.description }}</p>
            </div>

            <div class="fieldBlock">
              <label for="simTraitRare" class="fieldLabel">Rare Trait</label>
              <select id="simTraitRare" v-model="traitRareKey" class="simSelect">
                <option value="">None</option>
                <option v-for="t in rareTraits" :key="t.key" :value="t.key">
                  {{ t.name }}
                </option>
              </select>
              <p v-if="selectedRareTrait" class="traitHint">{{ selectedRareTrait.description }}</p>
            </div>
          </div>
        </section>

        <!-- Equipment Slots Card -->
        <section class="panel">
          <div class="panelTitleRow">
            <h2>Equipment Loadout</h2>
            <label class="inlineToggle" title="Doctrine of War: Weapon Master allows equipping any weapon type">
              <input v-model="allowAllWeapons" type="checkbox" />
              <span>Allow All Weapons (Weapon Master)</span>
            </label>
          </div>

          <div class="slotsList">
            <!-- Weapon Slot -->
            <div class="slotCard" :class="{ filled: equippedWeapon }">
              <div class="slotHeader">
                <span class="slotType">
                  Weapon · {{ allowAllWeapons ? 'Any Weapon' : (WEAPON_TYPE_LABEL[selectedClass.weaponType] || selectedClass.weaponType) }}
                </span>
                <div class="slotActions">
                  <a
                    v-if="equippedWeapon"
                    :href="`${resolvedBase}/items/${equippedWeapon.id}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="slotLink"
                  >
                    Details
                  </a>
                  <button
                    v-if="equippedWeapon"
                    type="button"
                    class="slotBtn clearBtn"
                    @click="clearSlot('weapon')"
                  >
                    Clear
                  </button>
                  <button type="button" class="slotBtn pickBtn" @click="openSlotModal('weapon')">
                    {{ equippedWeapon ? 'Change' : 'Equip' }}
                  </button>
                </div>
              </div>

              <button type="button" class="slotBodyBtn" @click="openSlotModal('weapon')">
                <div class="slotSpriteBox">
                  <img
                    v-if="equippedWeapon"
                    :src="`${resolvedBase}/images/${equippedWeapon.sprite}.png`"
                    :alt="equippedWeapon.name"
                    class="sprite"
                    width="44"
                    height="44"
                  />
                  <span v-else class="slotEmptyIcon">+</span>
                </div>
                <div class="slotMeta">
                  <template v-if="equippedWeapon">
                    <div class="slotItemName">{{ equippedWeapon.name }}</div>
                    <div class="slotChips">
                      <span v-for="(val, key) in equippedWeapon.stats" :key="key" class="miniChip">
                        {{ formatStat(String(key), Number(val)) }}
                      </span>
                    </div>
                    <div v-if="equippedWeapon.notes" class="slotNotes">{{ equippedWeapon.notes }}</div>
                  </template>
                  <template v-else>
                    <div class="slotPlaceholder">No Weapon Equipped</div>
                    <div class="slotSubHint">Click to browse compatible weapons</div>
                  </template>
                </div>
              </button>
            </div>

            <!-- Armor Slot -->
            <div class="slotCard" :class="{ filled: equippedArmor }">
              <div class="slotHeader">
                <span class="slotType">
                  Armor · {{ ARMOR_TYPE_LABEL[selectedClass.armorType] || selectedClass.armorType }}
                </span>
                <div class="slotActions">
                  <a
                    v-if="equippedArmor"
                    :href="`${resolvedBase}/items/${equippedArmor.id}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="slotLink"
                  >
                    Details
                  </a>
                  <button
                    v-if="equippedArmor"
                    type="button"
                    class="slotBtn clearBtn"
                    @click="clearSlot('armor')"
                  >
                    Clear
                  </button>
                  <button type="button" class="slotBtn pickBtn" @click="openSlotModal('armor')">
                    {{ equippedArmor ? 'Change' : 'Equip' }}
                  </button>
                </div>
              </div>

              <button type="button" class="slotBodyBtn" @click="openSlotModal('armor')">
                <div class="slotSpriteBox">
                  <img
                    v-if="equippedArmor"
                    :src="`${resolvedBase}/images/${equippedArmor.sprite}.png`"
                    :alt="equippedArmor.name"
                    class="sprite"
                    width="44"
                    height="44"
                  />
                  <span v-else class="slotEmptyIcon">+</span>
                </div>
                <div class="slotMeta">
                  <template v-if="equippedArmor">
                    <div class="slotItemName">{{ equippedArmor.name }}</div>
                    <div class="slotChips">
                      <span v-for="(val, key) in equippedArmor.stats" :key="key" class="miniChip">
                        {{ formatStat(String(key), Number(val)) }}
                      </span>
                    </div>
                    <div v-if="equippedArmor.notes" class="slotNotes">{{ equippedArmor.notes }}</div>
                  </template>
                  <template v-else>
                    <div class="slotPlaceholder">No Armor Equipped</div>
                    <div class="slotSubHint">Click to browse compatible armors</div>
                  </template>
                </div>
              </button>
            </div>

            <!-- Accessory Slot -->
            <div class="slotCard" :class="{ filled: equippedAccessory }">
              <div class="slotHeader">
                <span class="slotType">Accessory · Any Accessory</span>
                <div class="slotActions">
                  <a
                    v-if="equippedAccessory"
                    :href="`${resolvedBase}/items/${equippedAccessory.id}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="slotLink"
                  >
                    Details
                  </a>
                  <button
                    v-if="equippedAccessory"
                    type="button"
                    class="slotBtn clearBtn"
                    @click="clearSlot('accessory')"
                  >
                    Clear
                  </button>
                  <button type="button" class="slotBtn pickBtn" @click="openSlotModal('accessory')">
                    {{ equippedAccessory ? 'Change' : 'Equip' }}
                  </button>
                </div>
              </div>

              <button type="button" class="slotBodyBtn" @click="openSlotModal('accessory')">
                <div class="slotSpriteBox">
                  <img
                    v-if="equippedAccessory"
                    :src="`${resolvedBase}/images/${equippedAccessory.sprite}.png`"
                    :alt="equippedAccessory.name"
                    class="sprite"
                    width="44"
                    height="44"
                  />
                  <span v-else class="slotEmptyIcon">+</span>
                </div>
                <div class="slotMeta">
                  <template v-if="equippedAccessory">
                    <div class="slotItemName">{{ equippedAccessory.name }}</div>
                    <div class="slotChips">
                      <span v-for="(val, key) in equippedAccessory.stats" :key="key" class="miniChip">
                        {{ formatStat(String(key), Number(val)) }}
                      </span>
                    </div>
                    <div v-if="equippedAccessory.notes" class="slotNotes">{{ equippedAccessory.notes }}</div>
                  </template>
                  <template v-else>
                    <div class="slotPlaceholder">No Accessory Equipped</div>
                    <div class="slotSubHint">Click to browse accessories</div>
                  </template>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- RIGHT COLUMN: Computed Stats & Skills -->
      <div class="simResultsCol">
        <!-- Core Attributes & Flags -->
        <section class="panel">
          <div class="panelTitleRow">
            <h2>Core Attributes</h2>
            <div class="flagPills">
              <span v-if="computedStats.initiative" class="flagPill flagInfo">Initiative</span>
              <span v-if="computedStats.alwaysHits" class="flagPill flagInfo">Always Hits</span>
              <span v-if="computedStats.fortifiedShield > 0" class="flagPill flagGold">
                Start Shield: {{ computedStats.fortifiedShield }}
              </span>
              <span v-if="computedStats.zeroHealing" class="flagPill flagWarn">Zero Healing</span>
            </div>
          </div>

          <div class="coreGrid">
            <div class="coreCell hpCell">
              <span class="statLabel">MAX HP</span>
              <span class="statValue">{{ computedStats.totalHp.toLocaleString('en-US') }}</span>
            </div>
            <div class="coreCell">
              <span class="statLabel">
                CON
                <span v-if="computedStats.conScaling > 0" class="scaleTag">
                  ({{ formatScalingBadge(computedStats.conScaling) }})
                </span>
              </span>
              <span class="statValue">{{ computedStats.totalCon }}</span>
            </div>
            <div class="coreCell">
              <span class="statLabel">
                DEX
                <span v-if="computedStats.dexScaling > 0" class="scaleTag">
                  ({{ formatScalingBadge(computedStats.dexScaling) }})
                </span>
              </span>
              <span class="statValue">{{ computedStats.totalDex }}</span>
            </div>
            <div class="coreCell">
              <span class="statLabel">
                INT
                <span v-if="computedStats.intScaling > 0" class="scaleTag">
                  ({{ formatScalingBadge(computedStats.intScaling) }})
                </span>
              </span>
              <span class="statValue">{{ computedStats.totalInt }}</span>
            </div>
          </div>
        </section>

        <!-- Offense & Defense Detailed Tables -->
        <div class="statsTwoCol">
          <section class="panel">
            <h2>Offense</h2>
            <dl class="statRows">
              <div class="statRow highlightRow">
                <dt>Attack Damage</dt>
                <dd>{{ computedStats.minDmg.toLocaleString('en-US') }} – {{ computedStats.maxDmg.toLocaleString('en-US') }}</dd>
              </div>
              <div class="statRow">
                <dt>Attack Type</dt>
                <dd>{{ computedStats.attackTypeLabel }}</dd>
              </div>
              <div class="statRow">
                <dt>Attack Speed</dt>
                <dd>{{ computedStats.attackSpeed }}%</dd>
              </div>
              <div class="statRow">
                <dt>Damage Dealt</dt>
                <dd>{{ formatPct(computedStats.damageDealt) }}</dd>
              </div>
              <div class="statRow">
                <dt>Basic Atk Amp</dt>
                <dd>{{ formatPct(computedStats.normalAttackAmp) }}</dd>
              </div>
              <div class="statRow">
                <dt>Skill Amp</dt>
                <dd>{{ formatPct(computedStats.skillAmp) }}</dd>
              </div>
              <div class="statRow">
                <dt>Armor Penetration</dt>
                <dd>{{ formatPct(computedStats.armorPenetration) }}</dd>
              </div>
              <div class="statRow">
                <dt>Physical Crit</dt>
                <dd>{{ formatPct(computedStats.physCritChance) }} / {{ formatPct(computedStats.physCritDmg) }}</dd>
              </div>
              <div class="statRow">
                <dt>Spell Crit</dt>
                <dd>{{ formatPct(computedStats.spellCritChance) }} / {{ formatPct(computedStats.spellCritDmg) }}</dd>
              </div>
              <div v-if="computedStats.hitChanceBonus > 0 || computedStats.alwaysHits" class="statRow">
                <dt>Hit Chance Bonus</dt>
                <dd>{{ computedStats.alwaysHits ? 'Always Hits' : `+${formatPct(computedStats.hitChanceBonus)}` }}</dd>
              </div>
              <div v-if="computedStats.darknessDamageAmp !== 0" class="statRow">
                <dt>Darkness DMG Amp</dt>
                <dd>{{ formatPct(computedStats.darknessDamageAmp, 1) }}</dd>
              </div>
              <div v-if="computedStats.specialDamage !== 1.0" class="statRow">
                <dt>Special Damage</dt>
                <dd>{{ formatPct(computedStats.specialDamage) }}</dd>
              </div>
            </dl>
          </section>

          <section class="panel">
            <h2>Defense &amp; Utility</h2>
            <dl class="statRows">
              <div class="statRow">
                <dt>Defense</dt>
                <dd>{{ computedStats.totalDef }} ({{ computedStats.defMitigationPct }}%)</dd>
              </div>
              <div class="statRow">
                <dt>Magic Defense</dt>
                <dd>{{ computedStats.totalMdef }} ({{ computedStats.mdefMitigationPct }}%)</dd>
              </div>
              <div class="statRow">
                <dt>Flat DMG Reduction</dt>
                <dd>{{ computedStats.flatDamageReduction }}</dd>
              </div>
              <div class="statRow">
                <dt>Dodge Chance</dt>
                <dd>{{ formatPct(computedStats.dodgeChance) }}</dd>
              </div>
              <div class="statRow">
                <dt>Damage Taken</dt>
                <dd>{{ formatPct(computedStats.damageTaken) }}</dd>
              </div>
              <div class="statRow">
                <dt>Regeneration</dt>
                <dd>{{ computedStats.regeneration }} / turn</dd>
              </div>
              <div class="statRow">
                <dt>Lifesteal</dt>
                <dd>{{ computedStats.lifesteal }}%</dd>
              </div>
              <div class="statRow">
                <dt>Mana Regen</dt>
                <dd>{{ computedStats.manaRegen }}/t ({{ computedStats.turnsToCast }}t cast)</dd>
              </div>
              <div class="statRow">
                <dt>Counterattack</dt>
                <dd>{{ formatPct(Math.min(1, computedStats.counterattack)) }}</dd>
              </div>
              <div class="statRow">
                <dt>Threat</dt>
                <dd>{{ computedStats.threat }}</dd>
              </div>
              <div class="statRow">
                <dt>Status Immunity</dt>
                <dd>{{ formatPct(Math.min(1, computedStats.statusImmunity)) }}</dd>
              </div>
              <div class="statRow">
                <dt>Healing Modifier</dt>
                <dd>{{ formatPct(computedStats.healingModifier) }}</dd>
              </div>
              <div v-if="computedStats.darknessReduction > 0" class="statRow">
                <dt>Darkness Reduction</dt>
                <dd>{{ computedStats.darknessReduction }}</dd>
              </div>
              <div v-if="computedStats.decay > 0" class="statRow">
                <dt>Decay</dt>
                <dd>{{ computedStats.decay }} / turn</dd>
              </div>
              <div v-if="computedStats.expMultiplier !== 1.0" class="statRow">
                <dt>EXP Modifier</dt>
                <dd>{{ formatPct(computedStats.expMultiplier) }}</dd>
              </div>
              <div v-if="computedStats.physRetaliation > 0 || computedStats.magRetaliation > 0" class="statRow">
                <dt>Retaliation</dt>
                <dd>{{ computedStats.physRetaliation }} / {{ computedStats.magRetaliation }}</dd>
              </div>
              <div v-if="computedStats.physBlockChance > 0" class="statRow">
                <dt>Physical Block</dt>
                <dd>{{ formatPct(computedStats.physBlockChance) }}</dd>
              </div>
              <div v-if="computedStats.magicBlockChance > 0" class="statRow">
                <dt>Magic Block</dt>
                <dd>{{ formatPct(computedStats.magicBlockChance) }}</dd>
              </div>
              <div v-if="computedStats.guard > 0" class="statRow">
                <dt>Guard</dt>
                <dd>+{{ computedStats.guard }} DEF/MDEF</dd>
              </div>
              <div v-if="computedStats.menace > 0" class="statRow">
                <dt>Menace</dt>
                <dd>-{{ computedStats.menace }} DEF/MDEF</dd>
              </div>
              <div v-if="computedStats.attackSpeedDragReduction > 0 || computedStats.rangedDragReduction > 0" class="statRow">
                <dt>Water Drag Red.</dt>
                <dd>
                  SPD {{ formatPct(computedStats.attackSpeedDragReduction) }} / RNG {{ formatPct(computedStats.rangedDragReduction) }}
                </dd>
              </div>
              <div v-if="computedStats.pressureReduction > 0" class="statRow">
                <dt>Pressure Reduction</dt>
                <dd>{{ computedStats.pressureReduction }}</dd>
              </div>
              <div v-if="computedStats.statusResistance > 0" class="statRow">
                <dt>Status Resistance</dt>
                <dd>{{ formatPct(computedStats.statusResistance) }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <!-- Skills Panel -->
        <section class="panel">
          <h2>Class Skills</h2>
          <div class="skillList">
            <div v-if="selectedClass.activeSkillDetail" class="skillCard">
              <div class="skillHead">
                <span class="skillKind active">Active</span>
                <strong class="skillName">{{ selectedClass.activeSkillDetail.name }}</strong>
                <span class="skillManaCost">100 Mana (~{{ computedStats.turnsToCast }} turns)</span>
              </div>
              <p v-if="selectedClass.activeSkillDetail.description" class="skillDesc">
                {{ selectedClass.activeSkillDetail.description }}
              </p>
            </div>
            <div v-else class="skillCard emptySkill">
              <div class="skillHead">
                <span class="skillKind active">Active</span>
                <span class="emptySkillText">No active skill</span>
              </div>
            </div>

            <div v-if="selectedClass.passiveSkillDetail" class="skillCard">
              <div class="skillHead">
                <span class="skillKind passive">Passive</span>
                <strong class="skillName">{{ selectedClass.passiveSkillDetail.name }}</strong>
              </div>
              <p v-if="selectedClass.passiveSkillDetail.description" class="skillDesc">
                {{ selectedClass.passiveSkillDetail.description }}
              </p>
            </div>
            <div v-else class="skillCard emptySkill">
              <div class="skillHead">
                <span class="skillKind passive">Passive</span>
                <span class="emptySkillText">No passive skill</span>
              </div>
            </div>
          </div>

          <div v-if="equippedGear.some((g) => g.notes || g.description)" class="gearEffectsBlock">
            <h3>Equipped Item Effects</h3>
            <div v-for="gear in equippedGear" :key="gear.id" class="gearEffectRow">
              <img :src="`${resolvedBase}/images/${gear.sprite}.png`" :alt="gear.name" class="sprite" width="22" height="22" />
              <div>
                <strong>{{ gear.name }}</strong>
                <span v-if="gear.notes" class="gearNoteBadge">{{ gear.notes }}</span>
                <p v-if="gear.description" class="gearDescText">{{ gear.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Equipment Picker Modal -->
    <div
      v-if="activeSlotModal"
      class="modalBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Select equipment"
      @click.self="closeSlotModal"
    >
      <div class="modalPanel">
        <div class="modalHeader">
          <div>
            <h3>
              Select
              {{ activeSlotModal === 'weapon' ? 'Weapon' : activeSlotModal === 'armor' ? 'Armor' : 'Accessory' }}
            </h3>
            <p v-if="selectedClass" class="modalSub">
              <template v-if="activeSlotModal === 'weapon'">
                Showing {{ allowAllWeapons ? 'all weapons' : `${WEAPON_TYPE_LABEL[selectedClass.weaponType] || selectedClass.weaponType}s` }}
              </template>
              <template v-else-if="activeSlotModal === 'armor'">
                Showing {{ ARMOR_TYPE_LABEL[selectedClass.armorType] || selectedClass.armorType }}
              </template>
              <template v-else>
                Showing all Accessories
              </template>
              ({{ modalCompatibleItems.length }})
            </p>
          </div>
          <button type="button" class="closeModalBtn" aria-label="Close" @click="closeSlotModal">Close</button>
        </div>

        <div class="modalToolbar">
          <input
            v-model="equipSearchQuery"
            type="search"
            placeholder="Filter by name, stat, or effect…"
            class="modalSearch"
          />
          <select v-model="equipSortBy" class="modalSort">
            <option value="price-desc">Price ↓</option>
            <option value="price-asc">Price ↑</option>
            <option value="name">Name A–Z</option>
          </select>
          <button
            type="button"
            class="slotBtn clearBtn"
            @click="clearSlot(activeSlotModal); closeSlotModal()"
          >
            Unequip
          </button>
        </div>

        <div class="modalList">
          <button
            v-for="item in modalCompatibleItems"
            :key="item.id"
            type="button"
            class="modalItemBtn"
            :class="{
              equipped:
                (activeSlotModal === 'weapon' && selectedWeaponId === item.id) ||
                (activeSlotModal === 'armor' && selectedArmorId === item.id) ||
                (activeSlotModal === 'accessory' && selectedAccessoryId === item.id),
            }"
            @click="pickEquipment(item.id)"
          >
            <div class="modalItemSprite">
              <img :src="`${resolvedBase}/images/${item.sprite}.png`" :alt="item.name" class="sprite" width="40" height="40" loading="lazy" />
            </div>
            <div class="modalItemBody">
              <div class="modalItemHead">
                <strong class="modalItemName">{{ item.name }}</strong>
                <span class="modalItemCat">{{ item.category }}</span>
                <div class="modalCoins">
                  <span v-for="coin in parseCoins(item.price)" :key="coin.type" class="coinChip" :class="`coin-${coin.type}`">
                    <img :src="`${resolvedBase}/images/${coin.sprite}`" :alt="coin.label" class="coinIcon" width="13" height="13" />
                    <span>{{ coin.amount }}</span>
                  </span>
                </div>
              </div>
              <div v-if="item.stats && Object.keys(item.stats).length" class="slotChips">
                <span v-for="(val, key) in item.stats" :key="key" class="miniChip">
                  {{ formatStat(String(key), Number(val)) }}
                </span>
              </div>
              <div v-if="item.notes" class="slotNotes">{{ item.notes }}</div>
            </div>
          </button>
          <div v-if="modalCompatibleItems.length === 0" class="modalEmpty">
            No items match your filter.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simRoot {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.simHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.simHeader h1 {
  margin: 0 0 0.25rem;
}

.simSubtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.94rem;
}

.simHeaderActions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.actionBtn {
  padding: 7px 14px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-card);
  text-decoration: none;
  transition: all 0.15s ease;
}

.secondaryBtn {
  background: var(--bg-card);
  color: var(--brand-primary);
}

.secondaryBtn:hover {
  border-color: var(--brand-primary);
  text-decoration: none;
}

.resetBtn {
  background: var(--bg-inset);
  color: var(--text-secondary);
}

.resetBtn:hover {
  border-color: #ef4444;
  color: #fca5a5;
}

/* Category Tabs */
.categoryTabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.catBtn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.catBtn:hover {
  border-color: var(--brand-primary);
  color: var(--text-primary);
}

.catBtn.active {
  background: rgba(110, 168, 254, 0.16);
  border-color: var(--brand-primary);
  color: #93c5fd;
}

.catSprite {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* Main 2-Col Grid */
.simLayout {
  display: grid;
  grid-template-columns: minmax(320px, 440px) minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.simConfigCol,
.simResultsCol {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1rem 1.15rem;
}

.panelTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}

.panel h2 {
  margin: 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-gold);
  border: none;
  padding: 0;
}

.statsTwoCol .panel h2 {
  margin-bottom: 0.75rem;
}

.tierBadge {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-gold);
}

.unitPreviewRow {
  display: flex;
  gap: 0.9rem;
  align-items: center;
}

.unitSpriteFrame {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 2px solid var(--border-subtle);
  border-radius: 10px;
}

.unitSpriteFrame.ascendedFrame {
  border-color: #f59e0b;
  box-shadow: 0 0 14px rgba(245, 158, 11, 0.25);
}

.unitSprite {
  width: 68px;
  height: 68px;
  object-fit: contain;
}

.unitSelectWrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fieldLabel {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.simSelect {
  width: 100%;
  padding: 7px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 600;
  outline: none;
}

.simSelect:focus {
  border-color: var(--brand-primary);
}

.unitAffinityTags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.affinityTag {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

/* Lineage Bar */
.lineageBar {
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lineageGroup {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.lineageLabel {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-muted);
}

.lineageChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.lineageChip:hover {
  border-color: var(--brand-primary);
}

.promoteChip {
  border-color: rgba(245, 158, 11, 0.4);
}

/* Level & Ascension Controls */
.controlGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-top: 0.9rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.fieldBlock {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fieldHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.miniBtn {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--brand-primary);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.miniBtn:disabled {
  opacity: 0.4;
  cursor: default;
}

.levelRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.levelSlider {
  flex: 1;
  accent-color: var(--brand-primary);
}

.levelNum {
  width: 62px;
  padding: 5px 8px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.86rem;
  font-weight: 700;
  text-align: center;
}

.toggleCard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 7px;
  cursor: pointer;
}

.toggleCard.active {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}

.toggleCheck {
  width: 16px;
  height: 16px;
  accent-color: #f59e0b;
}

.toggleInfo {
  display: flex;
  flex-direction: column;
}

.toggleTitle {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-primary);
}

.toggleSub {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.traitGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.traitHint {
  margin: 2px 0 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--text-secondary);
}

/* Equipment Slots */
.inlineToggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.slotsList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.slotCard {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slotCard.filled {
  border-color: var(--border-card);
}

.slotHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.slotType {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.slotActions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.slotLink {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--brand-primary);
}

.slotBtn {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  color: var(--text-primary);
}

.slotBtn:hover {
  border-color: var(--brand-primary);
}

.clearBtn {
  color: #fca5a5;
}

.clearBtn:hover {
  border-color: #ef4444;
}

.slotBodyBtn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: transparent;
  border: none;
  padding: 2px 0 0;
  text-align: left;
  color: inherit;
  cursor: pointer;
}

.slotSpriteBox {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 7px;
}

.slotEmptyIcon {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-muted);
}

.slotMeta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slotItemName {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.slotPlaceholder {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-muted);
}

.slotSubHint {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.slotChips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.miniChip {
  font-size: 0.71rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.slotNotes {
  font-size: 0.74rem;
  color: var(--text-gold);
}

/* Results Column */
.flagPills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.flagPill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.flagInfo {
  background: rgba(110, 168, 254, 0.16);
  color: #93c5fd;
  border: 1px solid rgba(110, 168, 254, 0.35);
}

.flagGold {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.flagWarn {
  background: rgba(239, 68, 68, 0.16);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.coreGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.coreCell {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.7rem 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.hpCell {
  border-color: rgba(74, 222, 128, 0.35);
}

.statLabel {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
}

.scaleTag {
  color: var(--brand-primary);
}

.statValue {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.statsTwoCol {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.15rem;
}

.statRows {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
}

.statRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 8px;
  border-radius: 5px;
  background: var(--bg-inset);
  font-size: 0.83rem;
}

.statRow.highlightRow {
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.statRow dt {
  color: var(--text-secondary);
  font-weight: 500;
}

.statRow dd {
  margin: 0;
  color: var(--text-primary);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* Skills */
.skillList {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-top: 0.65rem;
}

.skillCard {
  padding: 0.75rem 0.9rem;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.skillHead {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.emptySkill .skillHead {
  margin-bottom: 0;
}

.skillKind {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 12px;
}

.skillKind.active {
  background: rgba(224, 86, 36, 0.18);
  color: #ff8a65;
}

.skillKind.passive {
  background: rgba(74, 222, 128, 0.15);
  color: #6ee7a0;
}

.skillName {
  font-size: 0.98rem;
  color: var(--text-primary);
}

.skillManaCost {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--brand-primary);
}

.skillDesc {
  margin: 0;
  font-size: 0.86rem;
  color: var(--text-secondary);
  white-space: pre-line;
}

.emptySkillText {
  font-size: 0.84rem;
  color: var(--text-muted);
  font-style: italic;
}

.gearEffectsBlock {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gearEffectsBlock h3 {
  margin: 0;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.gearEffectRow {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg-inset);
  border-radius: 6px;
  font-size: 0.82rem;
}

.gearNoteBadge {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.73rem;
  font-weight: 600;
  color: var(--text-gold);
}

.gearDescText {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* Modal */
.modalBackdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modalPanel {
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.75);
}

.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0.9rem 1.15rem;
  border-bottom: 1px solid var(--border-subtle);
}

.modalHeader h3 {
  margin: 0;
  font-size: 1.08rem;
}

.modalSub {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.closeModalBtn {
  padding: 5px 12px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
}

.closeModalBtn:hover {
  border-color: var(--brand-primary);
  color: var(--text-primary);
}

.modalToolbar {
  display: flex;
  gap: 8px;
  padding: 0.75rem 1.15rem;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-sidebar);
  flex-wrap: wrap;
}

.modalSearch {
  flex: 1 1 200px;
  padding: 6px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.88rem;
}

.modalSearch:focus {
  outline: none;
  border-color: var(--brand-primary);
}

.modalSort {
  padding: 6px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.84rem;
}

.modalList {
  overflow-y: auto;
  padding: 0.85rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modalItemBtn {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 0.65rem 0.75rem;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  text-align: left;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.modalItemBtn:hover {
  border-color: var(--brand-primary);
}

.modalItemBtn.equipped {
  border-color: var(--text-gold);
  background: rgba(245, 158, 11, 0.08);
}

.modalItemSprite {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}

.modalItemBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modalItemHead {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.modalItemName {
  font-size: 0.92rem;
  color: var(--text-primary);
}

.modalItemCat {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.modalCoins {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.coinChip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  font-weight: 700;
}

.coin-copper { color: #f97316; }
.coin-silver { color: #cbd5e1; }
.coin-gold { color: #fbbf24; }
.coin-platinum { color: #67e8f9; }
.coin-diamond { color: #a78bfa; }

.modalEmpty {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

@media (max-width: 960px) {
  .simLayout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .statsTwoCol,
  .traitGrid {
    grid-template-columns: 1fr;
  }
  .coreGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
