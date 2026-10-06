export type ClassCategory = 'Footman' | 'Apprentice' | 'Archer' | 'Rogue' | 'Outlander' | 'Summon';

export type WeaponType = 'sword' | 'axe' | 'bow' | 'staff' | 'dagger';
export type ArmorType = 'heavy' | 'medium' | 'light';

export interface ClassStats {
  maxHp?: number;
  baseMaxHp?: number;
  baseConstitution?: number;
  baseIntelligence?: number;
  baseDexterity?: number;
  baseDefense?: number;
  baseMagicDefense?: number;
}

export interface ClassDefinition {
  id: string;
  name: string;
  category: ClassCategory;
  tier: number;
  maxLevel: number;
  weaponType: WeaponType;
  armorType: ArmorType;
  sprite: string;
  description?: string;
  stats: ClassStats;
  activeSkill?: string;
  passiveSkill?: string;
  promotesTo?: string[];
  promotesFrom?: string[];
}

export interface EquipmentDefinition {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  category: string;
  rarity: number; // 0 to 5
  price: number;
  sprite: string;
  description?: string;
  stats: Record<string, number>;
  notes?: string;
}

export interface PetDefinition {
  id: string;
  name: string;
  type: 'beast' | 'undead' | 'familiar' | 'elemental';
  tier: number;
  sprite: string;
  description?: string;
  stats: Record<string, number>;
  skills?: string[];
  traits?: string[];
}

export interface TraitDefinition {
  id: string;
  name: string;
  type: 'positive' | 'negative' | 'unique';
  sprite?: string;
  description: string;
  effects?: string[];
}

export interface SkillDefinition {
  id: string;
  name: string;
  kind: 'active' | 'passive';
  icon?: string;
  description: string;
  scaling?: string;
}

export interface EnemyDrop {
  item: string;
  qty: number;
  chance: number; // percentage
  isIndependent?: boolean;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  isBoss: boolean;
  sprite: string;
  stats: {
    hp: number;
    constitution: number;
    intelligence: number;
    dexterity: number;
    defense: number;
    magicDefense: number;
  };
  damage: {
    min: number | string;
    max: number | string;
  };
  expGiven?: number;
  drops: EnemyDrop[];
}

export interface DungeonEnemyRef {
  id: string;
  name: string;
  rate?: string;
  role: 'Regular' | 'Boss' | 'Special Spawn';
}

export interface DungeonDefinition {
  id: string;
  name: string;
  type: 'dungeon' | 'raid' | 'epic_raid';
  level?: number;
  encounterChance: number; // percentage per room
  sprite: string;
  enemies: DungeonEnemyRef[];
  loot: string[];
}

export interface SearchEntry {
  id: string;
  title: string;
  category: 'Class' | 'Equipment' | 'Pet' | 'Trait' | 'Skill' | 'Enemy' | 'Dungeon' | 'Mechanics';
  url: string;
  description?: string;
  sprite?: string;
}
