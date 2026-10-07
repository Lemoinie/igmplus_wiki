import type { ClassDefinition } from '../types';

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

// Enemies
export function getAllEnemies(): any[] {
  const enemyModules = import.meta.glob('../data/enemies/*.json', { eager: true });
  return Object.values(enemyModules).map((mod: any) => mod.default || mod);
}

// Places (dungeons, raids, guildactivities)
export function getAllPlaces(): any[] {
  const placeModules = import.meta.glob('../data/places/**/*.json', { eager: true });
  const map = new Map<string, any>();
  Object.values(placeModules).forEach((mod: any) => {
    const item = mod.default || mod;
    if (item?.id) map.set(item.id, item);
  });
  return Array.from(map.values());
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
