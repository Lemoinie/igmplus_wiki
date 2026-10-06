<script setup>
/**
 * Modern Class Tree component inspired by idleguildmaster.info/class
 * 6 Categories: Footman, Apprentice, Archer, Rogue, Outlander, Summon
 * Collapsible tiers, big 68px sprites, base stats, full skill descriptions,
 * and interactive promotion navigation.
 */
import { computed, ref, reactive } from 'vue'
import { withBase } from 'vitepress'
import unitsData from '../../../data/units_adventurers.json'
import skillsData from '../../../data/skills.json'
import manifest from '../../../data/sprites_manifest.json'

const units = unitsData.units.filter((u) => !u.missing)
const byKey = Object.fromEntries(units.map((u) => [u.key, u]))
const skillsByKey = Object.fromEntries(skillsData.map((s) => [s.key, s]))

// Build reverse promotion mapping (Promoted from)
const promotedFromMap = {}
for (const u of units) {
  for (const nxt of u.next_classes || []) {
    if (!promotedFromMap[nxt]) promotedFromMap[nxt] = []
    promotedFromMap[nxt].push(u.key)
  }
}

// Build category trees
function getDescendants(rootKey) {
  const set = new Set()
  function dfs(k) {
    if (set.has(k) || !byKey[k]) return
    set.add(k)
    for (const nxt of byKey[k].next_classes || []) {
      dfs(nxt)
    }
  }
  dfs(rootKey)
  return set
}

const footmanSet = getDescendants('Footman')
const apprenticeSet = getDescendants('Apprentice')
const archerSet = getDescendants('Archer')
const rogueSet = getDescendants('Rogue')
const outlanderSet = getDescendants('Outlander')

const CATEGORIES = [
  { id: 'Footman', label: 'Footman', icon: 'unit_footman', set: footmanSet },
  { id: 'Apprentice', label: 'Apprentice', icon: 'unit_apprentice', set: apprenticeSet },
  { id: 'Archer', label: 'Archer', icon: 'unit_archer', set: archerSet },
  { id: 'Rogue', label: 'Rogue', icon: 'unit_rogue', set: rogueSet },
  { id: 'Outlander', label: 'Outlander', icon: 'unit_outlander', set: outlanderSet },
  {
    id: 'Summon',
    label: 'Summon',
    icon: 'unit_skeleton',
    set: new Set(
      units
        .map((u) => u.key)
        .filter(
          (k) =>
            !footmanSet.has(k) &&
            !apprenticeSet.has(k) &&
            !archerSet.has(k) &&
            !rogueSet.has(k) &&
            !outlanderSet.has(k),
        ),
    ),
  },
]

function getCategoryForUnit(u) {
  for (const c of CATEGORIES) {
    if (c.set.has(u.key)) return c.id
  }
  return 'Footman'
}

const activeCategory = ref('Footman')
const searchQuery = ref('')
const highlightedKey = ref(null)

// Set of collapsed tier numbers (e.g. 1, 2, 3...)
const collapsedTiers = ref(new Set())

function toggleTier(tierNum) {
  if (collapsedTiers.value.has(tierNum)) {
    collapsedTiers.value.delete(tierNum)
  } else {
    collapsedTiers.value.add(tierNum)
  }
}

function expandAllTiers() {
  collapsedTiers.value.clear()
}

function collapseAllTiers() {
  if (activeGroupedTiers.value) {
    for (const g of activeGroupedTiers.value) {
      collapsedTiers.value.add(g.tier)
    }
  }
}

const currentCategoryObj = computed(() =>
  CATEGORIES.find((c) => c.id === activeCategory.value) || CATEGORIES[0],
)

// Active units filtered by category and search query
const activeGroupedTiers = computed(() => {
  const catSet = currentCategoryObj.value.set
  const q = searchQuery.value.trim().toLowerCase()

  const tierMap = new Map()

  for (const u of units) {
    if (!catSet.has(u.key)) continue

    if (q) {
      const activeSkill = skillsByKey[u.active_skill]
      const passiveSkill = skillsByKey[u.passive_skill]
      const hay = [
        u.name,
        u.key,
        u.weapon_type,
        u.armor_type,
        u.description,
        activeSkill?.name,
        activeSkill?.description,
        passiveSkill?.name,
        passiveSkill?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) continue
    }

    const t = u.tier || 1
    if (!tierMap.has(t)) tierMap.set(t, [])
    tierMap.get(t).push(u)
  }

  const sortedTiers = [...tierMap.keys()].sort((a, b) => a - b)
  return sortedTiers.map((tier) => ({
    tier,
    units: tierMap.get(tier).sort((a, b) => a.name.localeCompare(b.name)),
  }))
})

const totalCategoryUnitsCount = computed(() => {
  return currentCategoryObj.value.set.size
})

function spriteFile(name) {
  const entry = manifest.exported[name]
  return entry ? withBase(`/images/${entry.file}`) : null
}

const WEAPON_MAP = {
  type_sword: { label: 'Sword', icon: '⚔️' },
  type_axe: { label: 'Axe', icon: '🪓' },
  type_bow: { label: 'Bow', icon: '🏹' },
  type_staff: { label: 'Staff', icon: '🪄' },
  type_dagger: { label: 'Dagger', icon: '🗡️' },
}

const ARMOR_MAP = {
  type_armor_heavy: { label: 'Heavy', icon: '🛡️' },
  type_armor_medium: { label: 'Medium', icon: '🥋' },
  type_armor_light: { label: 'Cloth', icon: '🥼' },
}

function weaponInfo(key) {
  return WEAPON_MAP[key] || { label: key?.replace(/^type_/, '') || '—', icon: '⚔️' }
}

function armorInfo(key) {
  return ARMOR_MAP[key] || { label: key?.replace(/^type_armor_/, '') || '—', icon: '🛡️' }
}

function resolveSkill(key) {
  if (!key || key === 'ACTIVE_NONE' || key === 'PASSIVE_NONE') return null
  const sk = skillsByKey[key]
  if (sk) {
    return {
      name: sk.name || key,
      description: sk.description || '',
      kind: sk.kind || 'skill',
    }
  }
  // Fallback formatting
  const name = key
    .replace(/^ACTIVE_|^PASSIVE_/, '')
    .split('_')
    .map((w) => (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ')
  return { name, description: '', kind: 'skill' }
}

function navigateToClass(targetKey) {
  const targetUnit = byKey[targetKey]
  if (!targetUnit) return

  const cat = getCategoryForUnit(targetUnit)
  if (cat && activeCategory.value !== cat) {
    activeCategory.value = cat
  }

  const tier = targetUnit.tier || 1
  collapsedTiers.value.delete(tier)

  setTimeout(() => {
    const el = document.getElementById(`class-${targetKey}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightedKey.value = targetKey
      setTimeout(() => {
        highlightedKey.value = null
      }, 2500)
    }
  }, 100)
}
</script>

<template>
  <div class="classTreeContainer">
    <!-- 6 Top Category Tabs -->
    <div class="categoryTabs">
      <button
        v-for="cat in CATEGORIES"
        :key="cat.id"
        type="button"
        class="categoryTab"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id; searchQuery = ''"
      >
        <div class="catIconBox">
          <img
            v-if="cat.icon && spriteFile(cat.icon)"
            class="sprite"
            :src="spriteFile(cat.icon)"
            :alt="cat.label"
            width="32"
            height="32"
          />
        </div>
        <span class="catLabel">{{ cat.label }}</span>
        <span class="catCount">{{ cat.set.size }}</span>
      </button>
    </div>

    <!-- Controls Bar -->
    <div class="treeControls">
      <div class="treeSearch">
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="`Search ${currentCategoryObj.label} classes, skills or equipments…`"
        />
      </div>

      <div class="treeActions">
        <button type="button" class="actionBtn" @click="expandAllTiers" title="Expand All Tiers">
          ▼ Expand All
        </button>
        <button type="button" class="actionBtn" @click="collapseAllTiers" title="Collapse All Tiers">
          ▶ Collapse All
        </button>
      </div>

      <div class="treeSummary">
        {{ totalCategoryUnitsCount }} classes in this line
      </div>
    </div>

    <!-- Tier Sections -->
    <div v-if="activeGroupedTiers.length" class="tiersList">
      <div
        v-for="g in activeGroupedTiers"
        :key="g.tier"
        class="tierSection"
      >
        <!-- Collapsible Tier Header -->
        <button
          type="button"
          class="tierHeader"
          @click="toggleTier(g.tier)"
          :title="collapsedTiers.has(g.tier) ? 'Click to expand' : 'Click to collapse'"
        >
          <span class="tierChevron">{{ collapsedTiers.has(g.tier) ? '▶' : '▼' }}</span>
          <span class="tierTitle">Tier {{ g.tier }}</span>
          <span class="tierCountBadge">{{ g.units.length }} {{ g.units.length === 1 ? 'Class' : 'Classes' }}</span>
          <span class="tierHint">
            {{ collapsedTiers.has(g.tier) ? 'Hidden (click to show)' : '' }}
          </span>
        </button>

        <!-- Tier Grid (Hidden if collapsed) -->
        <div v-show="!collapsedTiers.has(g.tier)" class="tierGrid">
          <div
            v-for="u in g.units"
            :id="`class-${u.key}`"
            :key="u.key"
            class="classCard"
            :class="{ isHighlighted: highlightedKey === u.key }"
          >
            <!-- Card Top: Big Sprite & Title -->
            <div class="cardTop">
              <div class="cardSpriteBox">
                <img
                  v-if="u.sprite && spriteFile(u.sprite)"
                  class="sprite classSprite"
                  :src="spriteFile(u.sprite)"
                  :alt="u.name"
                  width="68"
                  height="68"
                />
              </div>

              <div class="cardHeader">
                <div class="cardTitleRow">
                  <h3 class="cardTitle">{{ u.name }}</h3>
                  <span class="tierPill" :class="'tier-bg-' + (u.tier || 1)">
                    T{{ u.tier || 1 }}
                  </span>
                </div>

                <div class="cardEquipBadges">
                  <span v-if="u.weapon_type" class="equipBadge">
                    {{ weaponInfo(u.weapon_type).icon }} {{ weaponInfo(u.weapon_type).label }}
                  </span>
                  <span v-if="u.armor_type" class="equipBadge">
                    {{ armorInfo(u.armor_type).icon }} {{ armorInfo(u.armor_type).label }}
                  </span>
                  <span v-if="u.max_level" class="levelCapBadge">
                    Cap Lv.{{ u.max_level }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <p v-if="u.description" class="cardDescription">
              {{ u.description }}
            </p>

            <!-- Base Stats Grid -->
            <div v-if="u.stats" class="statsGrid">
              <div class="statCell">
                <span class="statLabel">HP</span>
                <span class="statVal hpVal">{{ u.stats.baseMaxHp ?? u.stats.maxHp ?? '—' }}</span>
              </div>
              <div class="statCell">
                <span class="statLabel">CON</span>
                <span class="statVal conVal">{{ u.stats.baseConstitution ?? '—' }}</span>
              </div>
              <div class="statCell">
                <span class="statLabel">INT</span>
                <span class="statVal intVal">{{ u.stats.baseIntelligence ?? '—' }}</span>
              </div>
              <div class="statCell">
                <span class="statLabel">DEX</span>
                <span class="statVal dexVal">{{ u.stats.baseDexterity ?? '—' }}</span>
              </div>
              <div class="statCell">
                <span class="statLabel">DEF</span>
                <span class="statVal defVal">{{ u.stats.baseDefense ?? '—' }}</span>
              </div>
              <div class="statCell">
                <span class="statLabel">MDEF</span>
                <span class="statVal mdefVal">{{ u.stats.baseMagicDefense ?? '—' }}</span>
              </div>
            </div>

            <!-- Skills Box -->
            <div class="skillsBox">
              <!-- Active Skill -->
              <div v-if="resolveSkill(u.active_skill)" class="skillRow activeSkillRow">
                <div class="skillHeader">
                  <span class="skillTag activeTag">⚡ Active</span>
                  <strong class="skillName">{{ resolveSkill(u.active_skill).name }}</strong>
                </div>
                <div v-if="resolveSkill(u.active_skill).description" class="skillDesc">
                  {{ resolveSkill(u.active_skill).description }}
                </div>
              </div>

              <!-- Passive Skill -->
              <div v-if="resolveSkill(u.passive_skill)" class="skillRow passiveSkillRow">
                <div class="skillHeader">
                  <span class="skillTag passiveTag">🛡️ Passive</span>
                  <strong class="skillName">{{ resolveSkill(u.passive_skill).name }}</strong>
                </div>
                <div v-if="resolveSkill(u.passive_skill).description" class="skillDesc">
                  {{ resolveSkill(u.passive_skill).description }}
                </div>
              </div>
            </div>

            <!-- Promotions Flow (Promotes to & Promoted from) -->
            <div class="promoFlow">
              <!-- Promoted from -->
              <div v-if="promotedFromMap[u.key]?.length" class="promoGroup">
                <span class="promoLabel">Promotes from:</span>
                <div class="promoChips">
                  <button
                    v-for="prevKey in promotedFromMap[u.key]"
                    :key="prevKey"
                    type="button"
                    class="promoChip prevChip"
                    @click="navigateToClass(prevKey)"
                    :title="`Jump to ${byKey[prevKey]?.name || prevKey}`"
                  >
                    <img
                      v-if="byKey[prevKey]?.sprite && spriteFile(byKey[prevKey].sprite)"
                      class="sprite promoMiniSprite"
                      :src="spriteFile(byKey[prevKey].sprite)"
                      alt=""
                      width="20"
                      height="20"
                    />
                    <span>{{ byKey[prevKey]?.name || prevKey }}</span>
                  </button>
                </div>
              </div>

              <!-- Promotes to -->
              <div v-if="u.next_classes?.length" class="promoGroup">
                <span class="promoLabel">Promotes to:</span>
                <div class="promoChips">
                  <button
                    v-for="nextKey in u.next_classes"
                    :key="nextKey"
                    type="button"
                    class="promoChip nextChip"
                    @click="navigateToClass(nextKey)"
                    :title="`Jump to ${byKey[nextKey]?.name || nextKey}`"
                  >
                    <img
                      v-if="byKey[nextKey]?.sprite && spriteFile(byKey[nextKey].sprite)"
                      class="sprite promoMiniSprite"
                      :src="spriteFile(byKey[nextKey].sprite)"
                      alt=""
                      width="20"
                      height="20"
                    />
                    <span>{{ byKey[nextKey]?.name || nextKey }}</span>
                    <span class="promoArrow">➔</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="treeEmpty">
      No classes found matching "<strong>{{ searchQuery }}</strong>" in {{ currentCategoryObj.label }}.
    </div>
  </div>
</template>

<style scoped>
.classTreeContainer {
  margin: 24px 0 40px 0;
}

/* ================= Category Tabs ================= */
.categoryTabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
  border-bottom: 2px solid var(--vp-c-divider);
  padding-bottom: 12px;
}

.categoryTab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.categoryTab:hover {
  background: var(--vp-c-bg-elv);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.categoryTab.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(110, 168, 254, 0.2);
}

.catIconBox {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.catLabel {
  font-size: 15px;
  font-weight: 600;
}

.catCount {
  font-size: 12px;
  padding: 2px 7px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.15);
  color: var(--vp-c-text-2);
}

.categoryTab.active .catCount {
  background: var(--vp-c-brand-1);
  color: #fff;
}

/* ================= Controls ================= */
.treeControls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.treeSearch {
  flex: 1 1 240px;
}

.treeSearch input[type='search'] {
  width: 100%;
  padding: 9px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.treeActions {
  display: flex;
  gap: 8px;
}

.actionBtn {
  padding: 7px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.actionBtn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.treeSummary {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-left: auto;
}

/* ================= Tier Section ================= */
.tierSection {
  margin-bottom: 24px;
}

.tierHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
  margin-bottom: 12px;
}

.tierHeader:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-2);
}

.tierChevron {
  font-size: 14px;
  color: var(--vp-c-brand-1);
}

.tierTitle {
  font-size: 16px;
  font-weight: 700;
}

.tierCountBadge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(110, 168, 254, 0.15);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.tierHint {
  margin-left: auto;
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-style: italic;
}

/* ================= Tier Grid ================= */
.tierGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

/* ================= Class Card ================= */
.classCard {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.classCard:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-2);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.classCard.isHighlighted {
  border-color: var(--vp-c-brand-1) !important;
  box-shadow: 0 0 0 3px rgba(110, 168, 254, 0.5) !important;
  animation: pulseHighlight 2s ease-out;
}

@keyframes pulseHighlight {
  0% { box-shadow: 0 0 0 6px rgba(110, 168, 254, 0.8); }
  100% { box-shadow: 0 0 0 1px rgba(110, 168, 254, 0.2); }
}

.cardTop {
  display: flex;
  gap: 14px;
  align-items: center;
}

.cardSpriteBox {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  border: 2px solid var(--vp-c-divider);
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.4);
}

.classSprite {
  width: 68px;
  height: 68px;
}

.cardHeader {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cardTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cardTitle {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.2;
}

.tierPill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fff;
  background: #475569;
}

.tier-bg-1 { background: #64748b; }
.tier-bg-2 { background: #059669; }
.tier-bg-3 { background: #0284c7; }
.tier-bg-4 { background: #7c3aed; }
.tier-bg-5 { background: #c026d3; }
.tier-bg-6 { background: #e11d48; }
.tier-bg-7 { background: #d97706; }
.tier-bg-8 { background: #ea580c; }
.tier-bg-9 { background: #b91c1c; }

.cardEquipBadges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.equipBadge {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.levelCapBadge {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 5px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.cardDescription {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
  font-style: italic;
}

/* ================= Base Stats Grid ================= */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 4px;
}

.statCell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.statLabel {
  font-size: 10px;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.statVal {
  font-size: 13px;
  font-weight: 700;
}

.hpVal { color: #4ade80; }
.conVal { color: #f97316; }
.intVal { color: #38bdf8; }
.dexVal { color: #facc15; }
.defVal { color: #94a3b8; }
.mdefVal { color: #c084fc; }

/* ================= Skills Box ================= */
.skillsBox {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 10px;
}

.skillRow {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.skillHeader {
  display: flex;
  align-items: center;
  gap: 6px;
}

.skillTag {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.activeTag {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.4);
}

.passiveTag {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.4);
}

.skillName {
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.skillDesc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.35;
  white-space: pre-line;
  padding-left: 2px;
}

/* ================= Promotions Flow ================= */
.promoFlow {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed var(--vp-c-divider);
}

.promoGroup {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.promoLabel {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.promoChips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.promoChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.promoChip:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.prevChip {
  opacity: 0.9;
}

.nextChip {
  font-weight: 600;
}

.promoMiniSprite {
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.promoArrow {
  font-size: 10px;
  color: var(--vp-c-brand-1);
}

.treeEmpty {
  padding: 40px;
  text-align: center;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  border: 1px dashed var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 15px;
}

.sprite {
  image-rendering: pixelated;
}
</style>
