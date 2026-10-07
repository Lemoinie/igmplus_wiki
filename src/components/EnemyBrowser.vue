<script setup lang="ts">
import { ref, computed } from 'vue';
import { base } from '../lib/base';
import EnemyCard from './EnemyCard.vue';

const props = defineProps<{
  enemies: any[];
  basePath?: string;
}>();

const query = ref('');
const selectedRole = ref('all');
const selectedPlace = ref('all');
const sortBy = ref('name');

// Extract unique place names from enemies
const places = computed(() => {
  const set = new Set<string>();
  props.enemies.forEach((e) => {
    (e.places || []).forEach((p: any) => {
      if (p.name) set.add(p.name);
    });
  });
  return Array.from(set).sort();
});

const filteredEnemies = computed(() => {
  const q = query.value.trim().toLowerCase();

  let list = props.enemies.filter((e) => {
    // Role filter
    if (selectedRole.value === 'boss' && !e.isBoss) return false;
    if (selectedRole.value === 'regular' && e.isBoss) return false;

    // Place filter
    if (selectedPlace.value !== 'all') {
      const matchPlace = (e.places || []).some((p: any) => p.name === selectedPlace.value);
      if (!matchPlace) return false;
    }

    // Search query: match enemy name, enemy type, place name, or drop name
    if (q) {
      const matchName = e.name.toLowerCase().includes(q);
      const matchType = (e.type || '').toLowerCase().includes(q);
      const matchPlace = (e.places || []).some((p: any) => p.name.toLowerCase().includes(q));
      const matchDrop = (e.drops || []).some((d: any) =>
        (d.name || d.item || '').toLowerCase().includes(q)
      );
      if (!matchName && !matchType && !matchPlace && !matchDrop) return false;
    }

    return true;
  });

  return list.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy.value === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortBy.value === 'bosses') {
      if (a.isBoss !== b.isBoss) return a.isBoss ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy.value === 'exp-desc') {
      const expA = typeof a.expGiven === 'number' ? a.expGiven : 0;
      const expB = typeof b.expGiven === 'number' ? b.expGiven : 0;
      return expB - expA;
    }
    return 0;
  });
});
</script>

<template>
  <div class="enemyBrowser">
    <!-- Filter Bar -->
    <div class="filterBar">
      <div class="searchWrap">
        <input
          v-model="query"
          type="search"
          placeholder="Search bestiary by monster, drops, or location…"
        />
      </div>

      <div class="selectGroup">
        <select v-model="selectedRole">
          <option value="all">All Monsters</option>
          <option value="boss">Bosses Only</option>
          <option value="regular">Regular Monsters</option>
        </select>

        <select v-model="selectedPlace">
          <option value="all">All Locations</option>
          <option v-for="p in places" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-model="sortBy">
          <option value="name">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="bosses">Bosses First</option>
          <option value="exp-desc">EXP Highest</option>
        </select>
      </div>

      <span class="countBadge">{{ filteredEnemies.length }} of {{ enemies.length }} monsters</span>
    </div>

    <!-- Cards Grid -->
    <div v-if="filteredEnemies.length" class="enemiesGrid">
      <a
        v-for="enemy in filteredEnemies"
        :key="enemy.id"
        :href="`${basePath ?? base}/enemies/${enemy.id}`"
        class="enemyLink"
      >
        <EnemyCard :enemy="enemy" :base-path="basePath" />
      </a>
    </div>

    <div v-else class="emptyNotice">
      No monsters found matching your search.
    </div>
  </div>
</template>

<style scoped>
.filterBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
}

.searchWrap {
  flex: 1 1 240px;
}

input {
  width: 100%;
  padding: 6px 12px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

input:focus {
  border-color: var(--brand-primary);
  outline: none;
}

.selectGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

select {
  padding: 6px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

select:focus {
  border-color: var(--brand-primary);
}

.countBadge {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-left: auto;
}

.enemiesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 1.25rem;
}

.enemyLink {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.emptyNotice {
  padding: 3rem 1.5rem;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .filterBar {
    padding: 0.6rem 0.75rem;
    gap: 8px;
  }
  .searchWrap {
    flex: 1 1 100%;
  }
  .selectGroup {
    width: 100%;
  }
  select {
    flex: 1 1 calc(50% - 4px);
  }
  .countBadge {
    width: 100%;
    margin-left: 0;
    text-align: right;
  }
  .enemiesGrid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
