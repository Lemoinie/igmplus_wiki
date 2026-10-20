// Human-readable labels for item stat keys (the raw keys come straight from the game data).
export const STAT_LABELS: Record<string, string> = {
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
  lifestealWithMinion: 'Lifesteal (with Minion)',
  counterattack: 'Counter',
  threat: 'Threat',
  skillAmpModifier: 'Skill Amp',
  damageDealtModifier: 'Damage Dealt',
  healingModifier: 'Healing',
  regeneration: 'Regeneration',
  regenerationBonus: 'Regeneration Bonus',
  manaRegen: 'Mana Regen',
  immunityToStatus: 'Status Immunity',
  retaliationPhysicalDamage: 'Physical Retaliation',
  retaliationMagicalDamage: 'Magic Retaliation',
  endOfTurnActionProbability: 'Extra Action Chance',
  exaltInspireBonusTurns: 'Exalt/Inspire Bonus Turns',
  bonusExperience: 'Bonus EXP',
  darknessReduction: 'Darkness Reduction',
  darknessDamageAmplification: 'Darkness DMG Amp',
  bloodflameDamageBonus: 'Bloodflame DMG Bonus',
  freezeBonusDamage: 'Freeze Bonus DMG',
  onFireBonusDamage: 'On-Fire Bonus DMG',
  livingCompanionBonusDamage: 'Living Companion Bonus DMG',
  poisonBonus: 'Poison Bonus',
  decay: 'Decay',
  feedPower: 'Feed Power',
  gemPrice: 'Gem Value',
};

// Stats stored as fractions (0.25 = 25%).
const PERCENT_STATS = new Set([
  'criticalChance',
  'criticalDamage',
  'dodgeChance',
  'flatDodgeChance',
  'counterattack',
  'skillAmpModifier',
  'damageDealtModifier',
  'healingModifier',
  'immunityToStatus',
  'endOfTurnActionProbability',
  'darknessDamageAmplification',
]);

/** Fallback for unknown keys: "someNewStat" -> "Some New Stat". */
function humanize(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function statLabel(key: string): string {
  return STAT_LABELS[key] || humanize(key);
}

export function statValue(key: string, val: number): string {
  if (PERCENT_STATS.has(key)) {
    const pct = Math.abs(val) <= 1.0 ? Math.round(val * 1000) / 10 : val;
    return `${pct > 0 ? '+' : ''}${pct}%`;
  }
  return `${val > 0 && key !== 'maxHp' ? '+' : ''}${val}`;
}

export function formatStat(key: string, val: number): string {
  return `${statLabel(key)} ${statValue(key, val)}`;
}
