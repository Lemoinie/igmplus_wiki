<script setup lang="ts">
export interface DetailStat { label: string; value: string | number; }
export interface DetailSkill { kind: string; name: string; description?: string; }
export interface DetailLink { name: string; href: string; sprite: string; tier?: number; }
export interface DetailLinkGroup { title: string; items: DetailLink[]; emptyText?: string; }
export interface DetailDrop { name: string; qty: number; chance: number; }

import { base } from '../lib/base';

defineProps<{
  name: string;
  sprite: string;
  backHref: string;
  backLabel?: string;
  basePath?: string;
  /** Small badges next to the name, e.g. "Tier 3", "Max Lv. 15", "Boss". */
  tags?: string[];
  description?: string;
  stats?: DetailStat[];
  skills?: DetailSkill[];
  /** Related units, e.g. Demotion / Promotions. */
  links?: DetailLinkGroup[];
  drops?: DetailDrop[];
}>();
</script>

<template>
  <article class="unitDetail">
    <a :href="backHref" class="backBtn">← {{ backLabel || 'Back' }}</a>

    <header class="hero">
      <div class="spriteFrame">
        <img
          :src="`${basePath ?? base}/images/${sprite}.png`"
          :alt="name"
          class="sprite"
          width="112"
          height="112"
        />
      </div>
      <div class="heroText">
        <h1 class="unitName">{{ name }}</h1>
        <div v-if="tags?.length" class="tags">
          <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
        </div>
        <p v-if="description" class="description">{{ description }}</p>
      </div>
    </header>

    <section v-if="stats?.length" class="panel">
      <h2>Stats</h2>
      <div class="statsGrid">
        <div v-for="s in stats" :key="s.label" class="statCell">
          <span class="statLabel">{{ s.label }}</span>
          <span class="statVal">{{ s.value }}</span>
        </div>
      </div>
    </section>

    <section v-if="skills?.length" class="panel">
      <h2>Skills</h2>
      <div class="skillList">
        <div v-for="sk in skills" :key="sk.kind + sk.name" class="skill">
          <div class="skillHead">
            <span class="skillKind" :class="sk.kind.toLowerCase()">{{ sk.kind }}</span>
            <strong class="skillName">{{ sk.name }}</strong>
          </div>
          <p v-if="sk.description" class="skillDesc">{{ sk.description }}</p>
        </div>
      </div>
    </section>

    <section v-for="g in links" :key="g.title" class="panel">
      <h2>{{ g.title }}</h2>
      <div v-if="g.items.length" class="linkGrid">
        <a v-for="i in g.items" :key="i.href" :href="i.href" class="linkCard">
          <span class="linkSprite">
            <img
              :src="`${basePath ?? base}/images/${i.sprite}.png`"
              :alt="i.name"
              class="sprite"
              width="48"
              height="48"
            />
          </span>
          <span class="linkName">{{ i.name }}</span>
          <span v-if="i.tier" class="linkTier">T{{ i.tier }}</span>
        </a>
      </div>
      <p v-else class="empty">{{ g.emptyText || 'None' }}</p>
    </section>

    <section v-if="drops?.length" class="panel">
      <h2>Drops</h2>
      <table class="dropTable">
        <thead><tr><th>Item</th><th>Qty</th><th>Chance</th></tr></thead>
        <tbody>
          <tr v-for="d in drops" :key="d.name">
            <td>{{ d.name }}</td>
            <td>{{ d.qty }}</td>
            <td>{{ d.chance }}%</td>
          </tr>
        </tbody>
      </table>
    </section>
  </article>
</template>

<style scoped>
.unitDetail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 860px;
}

.backBtn {
  align-self: flex-start;
  padding: 6px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
}

.backBtn:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  text-decoration: none;
}

.hero {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-left: 3px solid var(--text-gold);
  border-radius: 10px;
  padding: 1.25rem;
}

.spriteFrame {
  width: 128px;
  height: 128px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}

.heroText { display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; }
.unitName { margin: 0; font-size: 1.8rem; }

.tags { display: flex; flex-wrap: wrap; gap: 6px; }

.tag {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-gold);
}

.description { margin: 0; font-size: 0.9rem; font-style: italic; color: var(--text-muted); }

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.panel h2 {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-gold);
  border: none;
  padding: 0;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 8px;
}

.statCell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  padding: 8px 4px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}

.statLabel { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }
.statVal { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }

.skillList { display: flex; flex-direction: column; gap: 0.75rem; }

.skill {
  padding: 0.65rem 0.85rem;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.skillHead { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.skillName { font-size: 1rem; }

.skillKind {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 12px;
}
.skillKind.active { background: rgba(224, 86, 36, 0.18); color: #ff8a65; }
.skillKind.passive { background: rgba(74, 222, 128, 0.15); color: #6ee7a0; }

.skillDesc { margin: 0; font-size: 0.88rem; color: var(--text-secondary); white-space: pre-line; }

.linkGrid { display: flex; flex-wrap: wrap; gap: 10px; }

.linkCard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
}

.linkCard:hover { border-color: var(--brand-primary); text-decoration: none; }

.linkSprite {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 6px;
}

.linkName { font-weight: 700; }
.linkTier { font-size: 0.75rem; font-weight: 700; color: var(--text-gold); }
.empty { margin: 0; color: var(--text-muted); font-size: 0.88rem; }

.dropTable { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.dropTable th { text-align: left; font-size: 0.72rem; color: var(--text-muted); padding: 4px 8px; }
.dropTable td { padding: 6px 8px; border-top: 1px solid var(--border-subtle); }

@media (max-width: 600px) {
  .hero { flex-direction: column; text-align: center; }
}
</style>
