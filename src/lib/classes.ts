import { getAllClasses, getAllSkills } from './data';
import type { ClassDefinition } from '../types';

export { getAllClasses };

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
 * Looks up a skill from adventurers/skills/*.json by the display name used in class definitions.
 * Tolerates casing ("Threatening Ii") and the unnumbered tier I ("Threatening I" -> "Threatening").
 */
export function findSkill(name?: string) {
  if (!name || name === 'None') return null;
  const key = norm(name);
  const skillsData = getAllSkills();
  const hit = skillsData.find((s: any) => norm(s.name) === key);
  if (!hit) return { name, description: '' };
  return {
    name: hit.name as string,
    description: String(hit.description ?? '').replace(/^"|"$/g, ''),
  };
}
