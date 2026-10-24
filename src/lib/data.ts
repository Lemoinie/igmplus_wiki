import type { ClassDefinition, DoctrineDefinition, DoctrineAbilityDefinition } from '../types';
import itemsCatalog from '../../data/items.json';
import recipesList from '../../data/recipes.json';
import doctrinesList from '../../data/doctrines.json';
import doctrineAbilitiesList from '../../data/doctrine_abilities.json';


// Shared Item Map helper for drops and loot resolution
function getItemCatalogMap(): Map<string, any> {
  const itemModules = import.meta.glob('../data/items/**/*.json', { eager: true });
  const itemMap = new Map<string, any>();

  // 1. Seed base items/materials from data/items.json
  if (itemsCatalog && Array.isArray((itemsCatalog as any).items)) {
    for (const item of (itemsCatalog as any).items) {
      if (item?.key) {
        itemMap.set(item.key, {
          id: item.key,
          name: item.name || item.key,
          sprite: item.sprite,
        });
      }
    }
  }

  // 2. Overlay individual item JSONs from src/data/items/
  Object.values(itemModules).forEach((mod: any) => {
    const item = (mod as any).default || mod;
    if (item?.id) itemMap.set(item.id, item);
  });

  return itemMap;
}

// Adventurer Classes (units + summons)
export function getAllClasses(): ClassDefinition[] {
  const unitModules = import.meta.glob('../data/adventurers/units/*.json', { eager: true });
  const summonModules = import.meta.glob('../data/adventurers/summons/*.json', { eager: true });
  const map = new Map<string, any>();
  Object.values(unitModules).forEach((mod: any) => {
    const item = mod.default || mod;
    if (item?.id) map.set(item.id, item);
  });
  Object.values(summonModules).forEach((mod: any) => {
    const item = mod.default || mod;
    if (item?.id) map.set(item.id, item);
  });
  return Array.from(map.values());
}

export function getAllUnits(): ClassDefinition[] {
  const unitModules = import.meta.glob('../data/adventurers/units/*.json', { eager: true });
  return Object.values(unitModules).map((mod: any) => mod.default || mod);
}

export function getAllSummons(): ClassDefinition[] {
  const summonModules = import.meta.glob('../data/adventurers/summons/*.json', { eager: true });
  return Object.values(summonModules).map((mod: any) => mod.default || mod);
}

// Items / Equipment
export function getAllItems(): any[] {
  const itemModules = import.meta.glob('../data/items/**/*.json', { eager: true });
  const map = new Map<string, any>();
  Object.values(itemModules).forEach((mod: any) => {
    const item = mod.default || mod;
    if (item?.id) map.set(item.id, item);
  });
  return Array.from(map.values());
}

// Pets
const PET_FAMILY_ORDER: Record<string, number> = {
  wooden: 1,
  wild: 2,
  avian: 3,
  esoteric: 4,
  construct: 5,
  contruct: 5,
  reptile: 6,
  insect: 7,
  mythic: 8,
};

export function getAllPets(): any[] {
  const petModules = import.meta.glob('../data/pets/units/*.json', { eager: true });
  const list = Object.values(petModules).map((mod: any) => mod.default || mod);
  return list.sort((a: any, b: any) => {
    const orderA = PET_FAMILY_ORDER[(a.family || '').toLowerCase()] ?? 999;
    const orderB = PET_FAMILY_ORDER[(b.family || '').toLowerCase()] ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    const slotsA = a.abilitySlots ?? 0;
    const slotsB = b.abilitySlots ?? 0;
    if (slotsA !== slotsB) return slotsA - slotsB;
    return (a.name || '').localeCompare(b.name || '');
  });
}

// Pet Traits
export function getAllPetTraits(): any[] {
  const traitModules = import.meta.glob('../data/pets/traits/*.json', { eager: true });
  return Object.values(traitModules).map((mod: any) => mod.default || mod);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function resolveDropInfo(itemId: string, itemMap: Map<string, any>): { name: string; sprite: string } {
  const item = itemMap.get(itemId);
  const name = item?.name || itemId.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  let sprite = item?.sprite;
  if (!sprite && itemId.endsWith('Egg')) {
    sprite = 'egg_' + itemId.replace('Egg', '').toLowerCase();
  }
  if (!sprite) {
    sprite = toSnakeCase(itemId);
  }
  return { name, sprite };
}

// Canonical Enemy Type mapping based on EnemyTypeRegistry.kt
const ENEMY_TYPE_MAP: Record<string, string> = {
  // Slime
  ElectricSlime: 'Slime',
  FireSlime: 'Slime',
  FrozenSlime: 'Slime',
  KnightSlime: 'Slime',
  Slime: 'Slime',
  SlimeKing: 'Slime',
  Ultraslime: 'Slime',
  VoidSlime: 'Slime',

  // Dragon
  DreamwroughtDragon: 'Dragon',
  SnowWyvern: 'Dragon',

  // Plant
  AmanitaObscura: 'Plant',
  AncientEnt: 'Plant',
  Dryad: 'Plant',
  Ent: 'Plant',
  Treant: 'Plant',

  // Undead
  Banshee: 'Undead',
  BoneNightmareEnemy: 'Undead',
  ChorusTheDrowned: 'Undead',
  EtherealSoul: 'Undead',
  Ghoul: 'Undead',
  HeadlessKnight: 'Undead',
  KabarTheRotten: 'Undead',
  Lazarus: 'Undead',
  LostMiner: 'Undead',
  Phantasm: 'Undead',
  Undead: 'Undead',
  UndeadArcher: 'Undead',
  UndeadGeneral: 'Undead',
  UndeadWarlord: 'Undead',

  // Demon
  EmperorClovisXXVIII: 'Demon',
  Imp: 'Demon',
  SandDemon: 'Demon',

  // Construct
  BloodstoneColossus: 'Construct',
  DreamwroughtForge: 'Construct',
  Gcss: 'Construct',
  MagicArmor: 'Construct',
  Mimic: 'Construct',
  Necrobot: 'Construct',
  ObsidianGolem: 'Construct',
  ReinforcedDoor: 'Construct',
  SandStatue: 'Construct',
  TheMachine: 'Construct',

  // Elemental
  Djinn: 'Elemental',
  ForestSpirit: 'Elemental',
  IceElemental: 'Elemental',
  Phoenix: 'Elemental',
  WillOWisp: 'Elemental',

  // Beast
  Angelfish: 'Beast',
  BlueShark: 'Beast',
  BlueTrout: 'Beast',
  Boar: 'Beast',
  DeathHound: 'Beast',
  DreamwroughtBeast: 'Beast',
  DreamwroughtSwarm: 'Beast',
  EldritchHound: 'Beast',
  GiantMoth: 'Beast',
  GiantSpider: 'Beast',
  GiantTortoise: 'Beast',
  GoldenRabbit: 'Beast',
  GreenSpitfang: 'Beast',
  MagmaShark: 'Beast',
  Perch: 'Beast',
  PrimevalWurm: 'Beast',
  Pterodactyl: 'Beast',
  SandVulture: 'Beast',
  Terrorsaurus: 'Beast',
  TutorialWolf: 'Beast',
  VampireBat: 'Beast',
  WingedRay: 'Beast',
  Wolf: 'Beast',
  Wurm: 'Beast',

  // Aberration
  Abomination: 'Aberration',
  AvatarOfTheAncient: 'Aberration',
  Beholder: 'Aberration',
  CelestialDestroyer: 'Aberration',
  CelestialLancer: 'Aberration',
  Cerebrum: 'Aberration',
  Iconoclast: 'Aberration',
  LesserTitan: 'Aberration',
  MysteriousTentacle: 'Aberration',
  Necrolith: 'Aberration',
  Oculus: 'Aberration',
  PrimordialTitan: 'Aberration',
  ShaTheHiddenGod: 'Aberration',
  Shadow: 'Aberration',
  Singularity: 'Aberration',
  SmolderingTitan: 'Aberration',
  TekeliLiFirstApostle: 'Aberration',
  TheAncient: 'Aberration',
  WickedTribute: 'Aberration',

  // Humanoid
  ArcaneAssassin: 'Humanoid',
  ArchmageOfLarox: 'Humanoid',
  ArchmagusValthex: 'Humanoid',
  Berserker: 'Humanoid',
  BleakDeacon: 'Humanoid',
  BleakDisciple: 'Humanoid',
  Centaur: 'Humanoid',
  ChiefScientistAva: 'Humanoid',
  CityWarden: 'Humanoid',
  Claris: 'Humanoid',
  CrimsonAcolyte: 'Humanoid',
  Crusader: 'Humanoid',
  Deckhand: 'Humanoid',
  Enforcer: 'Humanoid',
  FirstMinisterAtos: 'Humanoid',
  HeraldKali: 'Humanoid',
  HeraldMaya: 'Humanoid',
  HeraldShoran: 'Humanoid',
  HeraldXavi: 'Humanoid',
  ImperialCaptain: 'Humanoid',
  ImperialGuard: 'Humanoid',
  ImperialMage: 'Humanoid',
  InsaneCitizen: 'Humanoid',
  InsaneMerchant: 'Humanoid',
  InsanePriest: 'Humanoid',
  KasimirTheSeer: 'Humanoid',
  KingAino: 'Humanoid',
  LegateHadrian: 'Humanoid',
  NexusResearcher: 'Humanoid',
  PaleHermit: 'Humanoid',
  Pirate: 'Humanoid',
  PirateCaptain: 'Humanoid',
  PirateLieutenant: 'Humanoid',
  ShaKireFirstSwordsman: 'Humanoid',
  ShahuriArcher: 'Humanoid',
  ShahuriMage: 'Humanoid',
  ShahuriWarrior: 'Humanoid',
  StoneShaman: 'Humanoid',
  TheExiled: 'Humanoid',
  Thorvus: 'Humanoid',
  Troll: 'Humanoid',
  TrollShaman: 'Humanoid',
  TrollWarrior: 'Humanoid',
  TrollWhelp: 'Humanoid',
  WizardOfLarox: 'Humanoid',
};

// Enemies
export function getAllEnemies(): any[] {
  const enemyModules = import.meta.glob('../data/enemies/*.json', { eager: true });
  const rawEnemies = Object.values(enemyModules).map((mod: any) => mod.default || mod);

  // Map places to enemies
  const placeModules = import.meta.glob('../data/places/**/*.json', { eager: true });
  const enemyPlacesMap = new Map<string, Array<{ id: string; name: string; type: string }>>();
  Object.values(placeModules).forEach((mod: any) => {
    const p = (mod as any).default || mod;
    if (!p) return;
    const pName = p.name || p.id;
    const pType = p.type || 'dungeon';
    (p.enemies || []).forEach((e: any) => {
      const eid = typeof e === 'string' ? e : e.id || e.name;
      if (!eid) return;
      if (!enemyPlacesMap.has(eid)) enemyPlacesMap.set(eid, []);
      const list = enemyPlacesMap.get(eid)!;
      if (!list.some((existing) => existing.name === pName)) {
        list.push({ id: p.id, name: pName, type: pType });
      }
    });
  });

  // Map item metadata for drop resolution
  const itemMap = getItemCatalogMap();

  // Map skills metadata for active/passive resolution
  const skillModules = import.meta.glob('../data/adventurers/skills/*.json', { eager: true });
  const skillMap = new Map<string, any>();
  Object.values(skillModules).forEach((mod: any) => {
    const s = (mod as any).default || mod;
    if (s?.key) skillMap.set(s.key, s);
  });

  return rawEnemies.map((enemy: any) => {
    const places = enemyPlacesMap.get(enemy.id) || enemyPlacesMap.get(enemy.name) || [];
    const drops = (enemy.drops || []).map((d: any) => {
      const info = resolveDropInfo(d.item, itemMap);
      return {
        ...d,
        name: d.name || info.name,
        sprite: d.sprite || info.sprite,
      };
    });
    const activeSkillDetail = enemy.activeSkill && enemy.activeSkill !== 'ACTIVE_NONE' ? (skillMap.get(enemy.activeSkill) || null) : null;
    const passiveSkillDetail = enemy.passiveSkill && enemy.passiveSkill !== 'PASSIVE_NONE' ? (skillMap.get(enemy.passiveSkill) || null) : null;

    return {
      ...enemy,
      type: enemy.type || ENEMY_TYPE_MAP[enemy.id] || 'Humanoid',
      places,
      drops,
      activeSkillDetail,
      passiveSkillDetail,
    };
  });
}

// Places (dungeons, raids, guildactivities)
const PLACE_TYPE_ORDER: Record<string, number> = {
  dungeon: 1,
  raid: 2,
  epic_raid: 2,
  guildactivity: 3,
};

export function getAllPlaces(): any[] {
  const placeModules = import.meta.glob('../data/places/**/*.json', { eager: true });
  const enemies = getAllEnemies();
  const enemyMap = new Map<string, any>();
  enemies.forEach((e) => {
    if (e.id) enemyMap.set(e.id, e);
    if (e.name) enemyMap.set(e.name, e);
  });

  // Items for loot resolution
  const itemMap = getItemCatalogMap();

  const list: any[] = [];
  Object.values(placeModules).forEach((mod: any) => {
    const item = (mod as any).default || mod;
    if (!item?.id) return;

    const enrichedEnemies = (item.enemies || []).map((ref: any) => {
      const eid = typeof ref === 'string' ? ref : ref.id || ref.name;
      const full = enemyMap.get(eid);
      if (full) {
        return {
          ...full,
          ...ref,
          name: full.name || ref.name || eid,
        };
      }
      return ref;
    });

    const lootDetails = (item.loot || []).map((itemId: string) => {
      const info = resolveDropInfo(itemId, itemMap);
      return {
        id: itemId,
        name: info.name,
        sprite: info.sprite,
      };
    });

    list.push({
      ...item,
      enemies: enrichedEnemies,
      lootDetails,
    });
  });

  return list.sort((a, b) => {
    const orderA = PLACE_TYPE_ORDER[a.type] ?? 99;
    const orderB = PLACE_TYPE_ORDER[b.type] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || '').localeCompare(b.name || '');
  });
}

export function getAllDungeons(): any[] {
  const m = import.meta.glob('../data/places/dungeons/*.json', { eager: true });
  return Object.values(m).map((mod: any) => mod.default || mod);
}

export function getAllRaids(): any[] {
  const m = import.meta.glob('../data/places/raids/*.json', { eager: true });
  return Object.values(m).map((mod: any) => mod.default || mod);
}

export function getAllGuildActivities(): any[] {
  const m = import.meta.glob('../data/places/guildactivities/*.json', { eager: true });
  return Object.values(m).map((mod: any) => mod.default || mod);
}

// Skills
export function getAllSkills(): any[] {
  const skillModules = import.meta.glob('../data/adventurers/skills/*.json', { eager: true });
  return Object.values(skillModules).map((mod: any) => mod.default || mod);
}

// Traits
export function getAllTraits(): any[] {
  const traitModules = import.meta.glob('../data/adventurers/traits/*.json', { eager: true });
  return Object.values(traitModules).map((mod: any) => mod.default || mod);
}

// Status Effects
import statusEffectsList from '../data/status_effects.json';
export function getAllStatusEffects(): any[] {
  return statusEffectsList;
}

// Doctrines & Abilities
export function getAllDoctrineAbilities(): DoctrineAbilityDefinition[] {
  return doctrineAbilitiesList as DoctrineAbilityDefinition[];
}

export function getAllDoctrines(): DoctrineDefinition[] {
  const abilityMap = new Map<string, DoctrineAbilityDefinition>();
  for (const ab of doctrineAbilitiesList as DoctrineAbilityDefinition[]) {
    abilityMap.set(ab.key, ab);
  }

  return (doctrinesList as any[])
    .filter((d) => d.key !== 'EmptyDoctrine')
    .map((d) => ({
      ...d,
      resolvedAbilities: (d.abilities || []).map((key: string) => abilityMap.get(key)).filter(Boolean) as DoctrineAbilityDefinition[],
    }));
}



// Item usage: where an item comes from and who can use it (for /items/[id])
export interface ItemRef { id: string; name: string; sprite: string; qty: number; hasPage: boolean; }
export interface ItemUsage {
  droppedBy: Array<{ id: string; name: string; sprite: string; qty: number; chance: number }>;
  foundIn: Array<{ id: string; name: string; sprite: string; type: string }>;
  recipe: ItemRef[];
  usedIn: ItemRef[];
  usableBy: ClassDefinition[];
}

// Item category -> class weapon/armor type
const WEAPON_CATEGORY: Record<string, string> = {
  Sword: 'sword',
  Axe: 'axe',
  Bow: 'bow',
  Dagger: 'dagger',
  Staff: 'staff',
};
const ARMOR_CATEGORY: Record<string, string> = {
  HeavyArmor: 'heavy',
  MediumArmor: 'medium',
  LightArmor: 'light',
};

export function getItemUsageMap(): Map<string, ItemUsage> {
  const items = getAllItems();
  const itemMap = getItemCatalogMap();
  const pageIds = new Set(items.map((i) => i.id));
  const toRef = (id: string, qty: number): ItemRef => {
    const info = resolveDropInfo(id, itemMap);
    return { id, name: info.name, sprite: info.sprite, qty, hasPage: pageIds.has(id) };
  };

  const usage = new Map<string, ItemUsage>();
  const get = (id: string): ItemUsage => {
    if (!usage.has(id)) usage.set(id, { droppedBy: [], foundIn: [], recipe: [], usedIn: [], usableBy: [] });
    return usage.get(id)!;
  };

  for (const enemy of getAllEnemies()) {
    for (const d of enemy.drops || []) {
      if (!d.item) continue;
      get(d.item).droppedBy.push({ id: enemy.id, name: enemy.name, sprite: enemy.sprite, qty: d.qty, chance: d.chance });
    }
  }

  const placeModules = import.meta.glob('../data/places/**/*.json', { eager: true });
  Object.values(placeModules).forEach((mod: any) => {
    const p = (mod as any).default || mod;
    if (!p?.id) return;
    for (const itemId of new Set<string>(p.loot || [])) {
      get(itemId).foundIn.push({ id: p.id, name: p.name || p.id, sprite: p.sprite, type: p.type || 'dungeon' });
    }
  });

  for (const r of recipesList as any[]) {
    if (!r?.output_item) continue;
    const out = get(r.output_item);
    if (!out.recipe.length) out.recipe = (r.ingredients || []).map((ing: any) => toRef(ing.item, ing.qty));
    for (const ing of r.ingredients || []) {
      const used = get(ing.item).usedIn;
      if (!used.some((u) => u.id === r.output_item)) used.push(toRef(r.output_item, ing.qty));
    }
  }

  const units = getAllUnits();
  for (const item of items) {
    const weapon = WEAPON_CATEGORY[item.category];
    const armor = ARMOR_CATEGORY[item.category];
    if (!weapon && !armor) continue;
    get(item.id).usableBy = units
      .filter((u) => (weapon ? u.weaponType === weapon : u.armorType === armor))
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  }

  for (const u of usage.values()) {
    u.droppedBy.sort((a, b) => b.chance - a.chance);
    u.foundIn.sort((a, b) => (PLACE_TYPE_ORDER[a.type] ?? 99) - (PLACE_TYPE_ORDER[b.type] ?? 99) || a.name.localeCompare(b.name));
    u.usedIn.sort((a, b) => a.name.localeCompare(b.name));
  }

  return usage;
}
