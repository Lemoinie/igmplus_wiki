<script setup lang="ts">
import { ref, computed } from 'vue';

export interface StatusEffectItem {
  id: string;
  name: string;
  category: 'buff' | 'debuff' | 'curse' | 'special';
  isMod: boolean;
  icon: string;
  description: string;
  logText?: string;
  duration?: string;
  cleansable?: boolean;
  sources?: string[];
}

const props = withDefaults(
  defineProps<{
    effects: StatusEffectItem[];
    basePath?: string;
  }>(),
  {
    basePath: '',
  }
);

const searchQuery = ref('');
const activeCategory = ref<'all' | 'buff' | 'debuff' | 'curse' | 'mod'>('all');
const viewMode = ref<'grid' | 'table'>('grid');

// Counts
const countAll = computed(() => props.effects.length);
const countBuffs = computed(() => props.effects.filter((e) => e.category === 'buff').length);
const countDebuffs = computed(() => props.effects.filter((e) => e.category === 'debuff').length);
const countCurses = computed(() => props.effects.filter((e) => e.category === 'curse').length);
const countMods = computed(() => props.effects.filter((e) => e.isMod).length);

// Filtered list
const filteredEffects = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  return props.effects.filter((e) => {
    // Category match
    if (activeCategory.value === 'buff' && e.category !== 'buff') return false;
    if (activeCategory.value === 'debuff' && e.category !== 'debuff') return false;
    if (activeCategory.value === 'curse' && e.category !== 'curse') return false;
    if (activeCategory.value === 'mod' && !e.isMod) return false;

    // Search query match
    if (!q) return true;
    const matchName = e.name.toLowerCase().includes(q);
    const matchDesc = e.description.toLowerCase().includes(q);
    const matchLog = (e.logText || '').toLowerCase().includes(q);
    const matchSources = (e.sources || []).some((s) => s.toLowerCase().includes(q));

    return matchName || matchDesc || matchLog || matchSources;
  });
});

function getCategoryBadgeClass(category: string) {
  switch (category) {
    case 'buff':
      return 'badge-buff';
    case 'debuff':
      return 'badge-debuff';
    case 'curse':
      return 'badge-curse';
    default:
      return 'badge-special';
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case 'buff':
      return 'Buff';
    case 'debuff':
      return 'Debuff';
    case 'curse':
      return 'Curse';
    default:
      return 'Special';
  }
}
</script>

<template>
  <div class="effectBrowser">
    <!-- Controls Header -->
    <div class="browserControls">
      <!-- Search Bar -->
      <div class="searchWrapper">
        <span class="searchIcon">🔍</span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by effect name, mechanic, keyword, or source (e.g. burn, bleed, dodge, Black Regent)..."
          class="searchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clearBtn"
          @click="searchQuery = ''"
          title="Clear search"
        >
          ✕
        </button>
      </div>

      <!-- Category Filter Tabs & View Toggle -->
      <div class="filterRow">
        <div class="filterTabs">
          <button
            type="button"
            class="tabBtn"
            :class="{ active: activeCategory === 'all' }"
            @click="activeCategory = 'all'"
          >
            All <span class="tabBadge">{{ countAll }}</span>
          </button>
          <button
            type="button"
            class="tabBtn"
            :class="{ active: activeCategory === 'buff' }"
            @click="activeCategory = 'buff'"
          >
            Buffs <span class="tabBadge">{{ countBuffs }}</span>
          </button>
          <button
            type="button"
            class="tabBtn"
            :class="{ active: activeCategory === 'debuff' }"
            @click="activeCategory = 'debuff'"
          >
            Debuffs <span class="tabBadge">{{ countDebuffs }}</span>
          </button>
          <button
            type="button"
            class="tabBtn"
            :class="{ active: activeCategory === 'curse' }"
            @click="activeCategory = 'curse'"
          >
            Curses <span class="tabBadge">{{ countCurses }}</span>
          </button>
          <button
            type="button"
            class="tabBtn tabBtnMod"
            :class="{ active: activeCategory === 'mod' }"
            @click="activeCategory = 'mod'"
          >
            ✦ Mod Additions <span class="tabBadge tabBadgeMod">{{ countMods }}</span>
          </button>
        </div>

        <!-- View Mode Toggle -->
        <div class="viewModeToggle">
          <button
            type="button"
            class="modeBtn"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            title="Card Grid View"
          >
            Cards
          </button>
          <button
            type="button"
            class="modeBtn"
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
            title="Compact Table View"
          >
            Table
          </button>
        </div>
      </div>
    </div>

    <!-- Results Count Bar -->
    <div class="resultsCount">
      <span>
        Showing <strong>{{ filteredEffects.length }}</strong> of {{ countAll }} status effects
      </span>
      <span v-if="searchQuery" class="activeFilterTag">
        Filtered by "{{ searchQuery }}"
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="filteredEffects.length === 0" class="emptyState">
      <p class="emptyTitle">No status effects found</p>
      <p class="emptySub">Try clearing your search term or selecting another category.</p>
      <button
        type="button"
        class="resetBtn"
        @click="searchQuery = ''; activeCategory = 'all'"
      >
        Reset Filters
      </button>
    </div>

    <!-- GRID VIEW -->
    <div v-else-if="viewMode === 'grid'" class="effectGrid">
      <div
        v-for="effect in filteredEffects"
        :key="effect.id"
        :id="effect.id"
        class="effectCard"
        :class="{ isModCard: effect.isMod }"
      >
        <!-- Card Header -->
        <div class="cardTop">
          <div class="effectIdentity">
            <img
              :src="`${basePath}/images/${effect.icon}.png`"
              :alt="effect.name"
              class="effectSprite sprite"
              width="36"
              height="36"
              loading="lazy"
            />
            <div>
              <h3 class="effectName">{{ effect.name }}</h3>
              <div class="badgeGroup">
                <span class="categoryBadge" :class="getCategoryBadgeClass(effect.category)">
                  {{ getCategoryLabel(effect.category) }}
                </span>
                <span v-if="effect.isMod" class="modBadge">MOD ADDITION</span>
                <span v-if="effect.cleansable !== undefined" class="cleanseBadge" :class="{ uncleansable: !effect.cleansable }">
                  {{ effect.cleansable ? 'Cleansable' : 'Uncleansable' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <p class="effectDesc">{{ effect.description }}</p>

        <!-- Combat Log Flavor -->
        <div v-if="effect.logText" class="logPreview">
          <span class="logLabel">Combat Log:</span>
          <span class="logPhrase">"… {{ effect.logText }} …"</span>
        </div>

        <!-- Duration & Sources Footer -->
        <div class="cardFooter">
          <div v-if="effect.duration" class="metaRow">
            <span class="metaKey">Duration:</span>
            <span class="metaVal">{{ effect.duration }}</span>
          </div>

          <div v-if="effect.sources && effect.sources.length" class="sourcesRow">
            <span class="metaKey">Applied by:</span>
            <div class="sourcesPills">
              <span v-for="src in effect.sources" :key="src" class="sourcePill">
                {{ src }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE VIEW -->
    <div v-else class="tableWrapper">
      <table class="effectsTable">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Cleansable</th>
            <th>Effect Description</th>
            <th>Applied By / Sources</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="effect in filteredEffects"
            :key="effect.id"
            :id="effect.id"
            :class="{ isModRow: effect.isMod }"
          >
            <td class="iconCell">
              <img
                :src="`${basePath}/images/${effect.icon}.png`"
                :alt="effect.name"
                class="tableSprite sprite"
                width="28"
                height="28"
                loading="lazy"
              />
            </td>
            <td class="nameCell">
              <strong>{{ effect.name }}</strong>
              <span v-if="effect.isMod" class="tableModBadge">MOD</span>
            </td>
            <td>
              <span class="categoryBadge" :class="getCategoryBadgeClass(effect.category)">
                {{ getCategoryLabel(effect.category) }}
              </span>
            </td>
            <td class="durationCell">{{ effect.duration || '—' }}</td>
            <td>
              <span class="cleanseBadge" :class="{ uncleansable: !effect.cleansable }">
                {{ effect.cleansable ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="descCell">{{ effect.description }}</td>
            <td class="sourcesCell">
              <div class="sourcesPills">
                <span v-for="src in (effect.sources || [])" :key="src" class="sourcePill">
                  {{ src }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.effectBrowser {
  margin-top: 1rem;
}

/* Controls Header */
.browserControls {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

/* Search Bar */
.searchWrapper {
  position: relative;
  margin-bottom: 1rem;
}

.searchIcon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.95rem;
  pointer-events: none;
}

.searchInput {
  width: 100%;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  color: var(--text-primary);
  font-size: 0.92rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.searchInput:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 2px var(--brand-glow);
}

.clearBtn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.clearBtn:hover {
  color: var(--text-primary);
}

/* Filter Row */
.filterRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.filterTabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tabBtn {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.tabBtn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--border-card);
}

.tabBtn.active {
  background: rgba(110, 168, 254, 0.15);
  border-color: var(--brand-primary);
  color: #93c5fd;
}

.tabBtnMod.active {
  background: rgba(16, 185, 129, 0.18);
  border-color: #34d399;
  color: #34d399;
}

.tabBadge {
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.tabBadgeMod {
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
}

/* View Mode Toggle */
.viewModeToggle {
  display: flex;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 2px;
}

.modeBtn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modeBtn.active {
  background: var(--bg-card);
  color: #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Results Count Bar */
.resultsCount {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.activeFilterTag {
  background: rgba(110, 168, 254, 0.1);
  color: var(--brand-primary);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(110, 168, 254, 0.25);
}

/* Empty State */
.emptyState {
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
}

.emptyTitle {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.35rem;
}

.emptySub {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.resetBtn {
  background: var(--brand-primary);
  color: #0f1319;
  font-weight: 700;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

/* GRID VIEW */
.effectGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.effectCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, border-color 0.15s ease;
  scroll-margin-top: 90px;
}

.effectCard:hover {
  transform: translateY(-2px);
  border-color: rgba(110, 168, 254, 0.4);
}

.effectCard.isModCard {
  border-left: 3px solid #10b981;
}

.cardTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0.85rem;
}

.effectIdentity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.effectSprite {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px;
  border-radius: 6px;
}

.effectName {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: #f1f5f9;
}

.badgeGroup {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.categoryBadge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 7px;
  border-radius: 4px;
}

.badge-buff {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-debuff {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-curse {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.badge-special {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.modBadge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  padding: 2px 6px;
  border-radius: 4px;
}

.cleanseBadge {
  font-size: 0.65rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  padding: 2px 6px;
  border-radius: 4px;
}

.cleanseBadge.uncleansable {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
}

.effectDesc {
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 0.85rem 0;
  flex: 1;
}

.logPreview {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.78rem;
  margin-bottom: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logLabel {
  color: var(--text-muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  font-weight: 700;
}

.logPhrase {
  color: #e2e8f0;
  font-style: italic;
}

.cardFooter {
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metaRow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.metaKey {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.76rem;
}

.metaVal {
  color: var(--text-primary);
  font-weight: 500;
}

.sourcesRow {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sourcesPills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sourcePill {
  background: var(--bg-inset);
  color: #93c5fd;
  border: 1px solid rgba(147, 197, 253, 0.15);
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.74rem;
}

/* TABLE VIEW */
.tableWrapper {
  overflow-x: auto;
  border: 1px solid var(--border-card);
  border-radius: 8px;
  background: var(--bg-card);
}

.effectsTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.effectsTable th {
  background: var(--bg-sidebar);
  color: #f1f5f9;
  font-weight: 700;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--border-card);
  white-space: nowrap;
}

.effectsTable td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  line-height: 1.45;
  vertical-align: top;
}

.effectsTable tr:last-child td {
  border-bottom: none;
}

.effectsTable tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.effectsTable tr.isModRow td {
  background: rgba(16, 185, 129, 0.02);
}

.iconCell {
  width: 44px;
  text-align: center;
}

.tableSprite {
  width: 28px;
  height: 28px;
  vertical-align: middle;
}

.nameCell {
  white-space: nowrap;
  color: #f1f5f9;
}

.tableModBadge {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 5px;
}

.durationCell {
  white-space: nowrap;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.descCell {
  min-width: 280px;
  max-width: 420px;
}

.sourcesCell {
  min-width: 200px;
}
</style>
