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

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').replace(/ i$/, '').replace(/s$/, '').trim();

/**
 * Looks up a skill from adventurers/skills/*.json by display name or enum key.
 * Tolerates casing ("Threatening Ii"), unnumbered tier I ("Threatening I" -> "Threatening"),
 * and raw enum identifiers ("ACTIVE_RAPID_EXPLOITATION").
 */
export function findSkill(name?: string) {
  if (!name || name === 'None') return null;
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  const key = norm(trimmed);
  const skillsData = getAllSkills();

  // 1. Exact match on name or key
  let hit = skillsData.find(
    (s: any) =>
      s.name?.toLowerCase() === lower ||
      s.key?.toLowerCase() === lower
  );

  // 2. Normalized match (handles unnumbered Tier 1, e.g. "Threatening I" -> "Threatening", or "Threatening" -> "Threatening I")
  if (!hit) {
    hit = skillsData.find(
      (s: any) =>
        norm(s.name ?? '') === key ||
        norm(s.key ?? '') === key
    );
  }

  // 3. Fallback matching with ACTIVE_ / PASSIVE_ key prefixes
  if (!hit) {
    const underscored = lower.replace(/[\s-]+/g, '_');
    const activeKey = 'active_' + underscored;
    const passiveKey = 'passive_' + underscored;
    hit = skillsData.find(
      (s: any) =>
        s.key?.toLowerCase() === activeKey ||
        s.key?.toLowerCase() === passiveKey
    );
  }

  if (!hit) return { name: trimmed, description: '' };
  return {
    name: (hit.name as string) || trimmed,
    description: String(hit.description ?? '').replace(/^"|"$/g, '').trim(),
  };
}
