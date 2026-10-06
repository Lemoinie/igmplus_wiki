import classesData from '../data/classes.json';
import skillsData from '../data/skills.json';
import type { ClassDefinition } from '../types';

/**
 * All classes: src/data/classes.json merged with standalone unit files
 * in src/data/adventurers/units/*.json (a unit file overrides the same id).
 */
export function getAllClasses(): ClassDefinition[] {
  const unitModules = import.meta.glob('../data/adventurers/units/*.json', { eager: true });
  const map = new Map<string, any>();
  (classesData as any[]).forEach((c) => map.set(c.id, c));
  Object.values(unitModules).forEach((mod: any) => {
    const unit = mod.default || mod;
    if (unit?.id) map.set(unit.id, { ...(map.get(unit.id) || {}), ...unit });
  });
  return Array.from(map.values());
}

/** Promotions (children) and demotions (parents) of a class, from promotesTo/promotesFrom. */
export function getRelations(id: string, all: ClassDefinition[]) {
  const byId = new Map(all.map((c) => [c.id, c]));
  const self = byId.get(id);
  const promotions = new Map<string, ClassDefinition>();
  const demotions = new Map<string, ClassDefinition>();

  for (const pid of self?.promotesTo ?? []) {
    const c = byId.get(pid);
    if (c) promotions.set(c.id, c);
  }
  for (const pid of self?.promotesFrom ?? []) {
    const c = byId.get(pid);
    if (c) demotions.set(c.id, c);
  }
  for (const c of all) {
    if (c.promotesTo?.includes(id)) demotions.set(c.id, c);
    if (c.promotesFrom?.includes(id)) promotions.set(c.id, c);
  }
  const sort = (a: ClassDefinition, b: ClassDefinition) => a.tier - b.tier || a.name.localeCompare(b.name);
  return {
    promotions: [...promotions.values()].sort(sort),
    demotions: [...demotions.values()].sort(sort),
  };
}

const norm = (s: string) => s.toLowerCase().replace(/ i$/, '').trim();

/**
 * Looks up a skill from skills.json by the display name used in classes.json.
 * Tolerates casing ("Threatening Ii") and the unnumbered tier I ("Threatening I" -> "Threatening").
 */
export function findSkill(name?: string) {
  if (!name || name === 'None') return null;
  const key = norm(name);
  const hit = (skillsData as any[]).find((s) => norm(s.name) === key);
  if (!hit) return { name, description: '' };
  return {
    name: hit.name as string,
    description: String(hit.description ?? '').replace(/^"|"$/g, ''),
  };
}
