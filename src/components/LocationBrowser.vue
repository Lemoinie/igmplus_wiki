<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { base } from '../lib/base';

interface EnemyDrop {
  item: string;
  name?: string;
  qty: number;
  chance: number;
  sprite?: string;
}

interface SkillDetail {
  key?: string;
  name: string;
  description: string;
  kind?: string;
}

interface LocationMonster {
  id: string;
  name: string;
  rate?: string;
  role?: string;
  isBoss?: boolean;
  sprite?: string;
  type?: string;
  stats?: {
    hp?: number;
    constitution?: number;
    intelligence?: number;
    dexterity?: number;
    defense?: number;
    magicDefense?: number;
  };
  damage?: {
    min?: number | string;
    max?: number | string;
  };
  expGiven?: number;
  drops?: EnemyDrop[];
  isMagic?: boolean;
  isRanged?: boolean;
  attackType?: string;
  activeSkill?: string;
  passiveSkill?: string;
  activeSkillDetail?: SkillDetail | null;
  passiveSkillDetail?: SkillDetail | null;
}

interface LootItem {
  id: string;
  name?: string;
  sprite?: string;
}

interface LocationData {
  id: string;
  name: string;
  type: 'dungeon' | 'raid' | 'epic_raid' | 'guildactivity' | string;
  level?: number | null;
  encounterChance?: number;
  sprite?: string;
  enemies: LocationMonster[];
  loot?: string[];
  lootDetails?: LootItem[];
}

const props = defineProps<{
  locations: LocationData[];
  basePath?: string;
}>();

const selectedLocationId = ref(props.locations[0]?.id || '');
const searchQuery = ref('');
const isLootOpen = ref(false);

const selectedLocation = computed<LocationData | undefined>(() => {
  return props.locations.find((loc) => loc.id === selectedLocationId.value) || props.locations[0];
});

// Categorized locations for dropdown
const dungeons = computed(() => props.locations.filter((l) => l.type === 'dungeon'));
const raids = computed(() => props.locations.filter((l) => l.type === 'raid' || l.type === 'epic_raid'));
const guildActivities = computed(() => props.locations.filter((l) => l.type === 'guildactivity' || l.type === 'guild_activity'));

// Filtered monsters in selected location
const filteredMonsters = computed(() => {
  if (!selectedLocation.value) return [];
  const list = selectedLocation.value.enemies || [];
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;

  return list.filter((m) => {
    const matchName = m.name?.toLowerCase().includes(q);
    const matchRole = m.role?.toLowerCase().includes(q);
    const matchAtk = m.attackType?.toLowerCase().includes(q);
    const matchActive = m.activeSkillDetail?.name?.toLowerCase().includes(q);
    const matchPassive = m.passiveSkillDetail?.name?.toLowerCase().includes(q);
    const matchDrops = m.drops?.some((d) => (d.name || d.item)?.toLowerCase().includes(q));
    return matchName || matchRole || matchAtk || matchActive || matchPassive || matchDrops;
  });
});

function onSelectLocation(id: string) {
  selectedLocationId.value = id;
  searchQuery.value = '';
  isLootOpen.value = false;
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set('location', id);
    window.history.replaceState({}, '', url.toString());
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get('location') || window.location.hash.replace(/^#/, '');
    if (locParam && props.locations.some((l) => l.id === locParam)) {
      selectedLocationId.value = locParam;
    }
  }
});

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function getDropSprite(drop: EnemyDrop): string {
  if (drop.sprite) return drop.sprite;
  const id = drop.item || '';
  if (id.endsWith('Egg')) {
    return 'egg_' + id.replace('Egg', '').toLowerCase();
  }
  return toSnakeCase(id);
}

function getDropName(drop: EnemyDrop): string {
  if (drop.name) return drop.name;
  const id = drop.item || '';
  return id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}

function getTypeLabel(type: string): string {
  if (type === 'dungeon') return 'DUNGEON';
  if (type === 'raid') return 'RAID';
  if (type === 'epic_raid') return 'EPIC RAID';
  if (type === 'guildactivity' || type === 'guild_activity') return 'GUILD';
  return type.toUpperCase();
}

function getTypeClass(type: string): string {
  if (type === 'dungeon') return 'badge-dungeon';
  if (type === 'raid') return 'badge-raid';
  if (type === 'epic_raid') return 'badge-epic-raid';
  return 'badge-guild';
}

function getAtkTypeClass(atkType?: string): string {
  if (!atkType) return 'atk-default';
  const lower = atkType.toLowerCase();
  if (lower.includes('magic')) return 'atk-magic';
  if (lower.includes('ranged')) return 'atk-ranged';
  return 'atk-melee';
}
</script>

<template>
  <div class="locationBrowser">
    <!-- Top Selector Bar -->
    <div class="selectorCard">
      <div class="selectorRow">
        <div class="dropdownGroup">
          <label for="locationSelect" class="dropdownLabel">Select Location</label>
          <div class="selectWrapper">
            <select
              id="locationSelect"
              :value="selectedLocationId"
              class="locationSelect"
              @change="onSelectLocation(($event.target as HTMLSelectElement).value)"
            >
              <optgroup v-if="dungeons.length" label="Regular Dungeons">
                <option v-for="d in dungeons" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </optgroup>
              <optgroup v-if="raids.length" label="Raids & Epic Raids">
                <option v-for="r in raids" :key="r.id" :value="r.id">
                  {{ r.name }} ({{ r.type === 'epic_raid' ? 'Epic Raid' : 'Raid' }})
                </option>
              </optgroup>
              <optgroup v-if="guildActivities.length" label="Guild Activities">
                <option v-for="g in guildActivities" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </optgroup>
            </select>
            <span class="selectArrow">▼</span>
          </div>
        </div>

        <!-- Quick Search input within the location -->
        <div class="searchGroup">
          <label for="monsterSearch" class="dropdownLabel">Filter Monsters</label>
          <div class="searchBox">
            <span class="searchIcon">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              id="monsterSearch"
              v-model="searchQuery"
              type="search"
              placeholder="Filter by name, skill, drop…"
              class="searchInput"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Active Location Banner / Info -->
    <div v-if="selectedLocation" class="locationHeaderCard">
      <div class="locationHeaderMain">
        <div v-if="selectedLocation.sprite" class="locationSpriteBox">
          <img
            :src="`${basePath ?? base}/images/${selectedLocation.sprite}.png`"
            :alt="selectedLocation.name"
            class="locationSprite sprite"
            width="80"
            height="80"
          />
        </div>

        <div class="locationMetaGroup">
          <div class="titleRow">
            <h2 class="locationTitle">{{ selectedLocation.name }}</h2>
            <span class="typeBadge" :class="getTypeClass(selectedLocation.type)">
              {{ getTypeLabel(selectedLocation.type) }}
            </span>
          </div>

          <div class="statsPills">
            <div v-if="selectedLocation.level" class="pill">
              <span class="pillLabel">Req. Level:</span>
              <strong class="pillVal">{{ selectedLocation.level }}</strong>
            </div>

            <div v-if="selectedLocation.encounterChance !== undefined" class="pill">
              <span class="pillLabel">Encounter Chance:</span>
              <strong class="pillVal">{{ selectedLocation.encounterChance }}% / room</strong>
            </div>

            <div class="pill">
              <span class="pillLabel">Monsters:</span>
              <strong class="pillVal">{{ selectedLocation.enemies?.length || 0 }}</strong>
            </div>

            <div v-if="selectedLocation.loot?.length" class="pill">
              <span class="pillLabel">Loot Pool:</span>
              <strong class="pillVal">{{ selectedLocation.loot.length }} Items</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Expandable Loot Reference drawer -->
      <div v-if="selectedLocation.lootDetails?.length" class="lootSection">
        <button
          type="button"
          class="lootToggleBtn"
          @click="isLootOpen = !isLootOpen"
        >
          <span class="lootToggleIcon">{{ isLootOpen ? '▼' : '▶' }}</span>
          <span>Dungeon Loot & Item References ({{ selectedLocation.lootDetails.length }} items)</span>
        </button>

        <div v-if="isLootOpen" class="lootGrid">
          <div
            v-for="item in selectedLocation.lootDetails"
            :key="item.id"
            class="lootChip"
            :title="item.name || item.id"
          >
            <img
              :src="`${basePath ?? base}/images/${item.sprite || toSnakeCase(item.id)}.png`"
              :alt="item.name || item.id"
              class="lootSprite sprite"
              width="20"
              height="20"
              loading="lazy"
            />
            <span class="lootName">{{ item.name || item.id }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Monsters Table & Responsive Cards -->
    <div v-if="selectedLocation" class="monstersSection">
      <div class="sectionHeader">
        <div class="sectionTitleRow">
          <h3 class="sectionTitle">Monster Encounters</h3>
          <span class="countPill">
            {{ filteredMonsters.length }} of {{ selectedLocation.enemies?.length || 0 }}
          </span>
        </div>
      </div>

      <!-- Desktop View: Table -->
      <div v-if="filteredMonsters.length > 0" class="tableWrapper">
        <table class="monstersTable">
          <thead>
            <tr>
              <th class="thImage">IMAGE</th>
              <th class="thName">NAME</th>
              <th class="thStat">HP</th>
              <th class="thStat">DEF</th>
              <th class="thStat">MDEF</th>
              <th class="thStat thDmg">DMG</th>
              <th class="thStat">EXP</th>
              <th class="thAtk">ATK TYPE</th>
              <th class="thDrops">DROP ITEMS (WITH RATE)</th>
              <th class="thSkill">ACTIVE SKILL</th>
              <th class="thSkill">PASSIVE SKILL</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in filteredMonsters"
              :key="m.id"
              :class="{ isBossRow: m.isBoss || m.role === 'Boss' }"
            >
              <!-- 1. IMAGE -->
              <td class="tdImage">
                <div class="monsterSpriteBox" :class="{ isBossSprite: m.isBoss || m.role === 'Boss' }">
                  <img
                    :src="`${basePath ?? base}/images/${m.sprite || 'unit_slime'}.png`"
                    :alt="m.name"
                    class="monsterSprite sprite"
                    width="44"
                    height="44"
                    loading="lazy"
                  />
                </div>
              </td>

              <!-- 2. NAME + ROLE + RATE -->
              <td class="tdName">
                <div class="nameStack">
                  <div class="nameHeader">
                    <strong class="monsterName" :class="{ isBossName: m.isBoss || m.role === 'Boss' }">
                      {{ m.name }}
                    </strong>
                    <span v-if="m.isBoss || m.role === 'Boss'" class="badge bossBadge">Boss</span>
                  </div>
                  <div class="roleMeta">
                    <span v-if="m.role && m.role !== 'Boss'" class="badge roleBadge">{{ m.role }}</span>
                    <span v-if="m.rate" class="rateText">Rate: <strong>{{ m.rate }}</strong></span>
                  </div>
                </div>
              </td>

              <!-- 3. HP -->
              <td class="tdStat">
                <span class="statHp">{{ m.stats?.hp ?? '—' }}</span>
              </td>

              <!-- 4. DEF -->
              <td class="tdStat">
                <span class="statDef">{{ m.stats?.defense ?? '—' }}</span>
              </td>

              <!-- 5. MDEF -->
              <td class="tdStat">
                <span class="statMdef">{{ m.stats?.magicDefense ?? '—' }}</span>
              </td>

              <!-- 6. DMG -->
              <td class="tdStat tdDmg">
                <span class="statDmg">
                  {{ m.damage?.min !== undefined ? `${m.damage.min} – ${m.damage.max}` : '—' }}
                </span>
              </td>

              <!-- 7. EXP -->
              <td class="tdStat">
                <span class="statExp">{{ m.expGiven ?? '—' }}</span>
              </td>

              <!-- 8. ATK TYPE -->
              <td class="tdAtk">
                <span
                  class="atkTypeBadge"
                  :class="getAtkTypeClass(m.attackType)"
                >
                  {{ m.attackType || 'Melee, Physical' }}
                </span>
              </td>

              <!-- 9. DROP ITEMS (WITH RATE) -->
              <td class="tdDrops">
                <div v-if="m.drops?.length" class="dropsList">
                  <div
                    v-for="(drop, dIdx) in m.drops"
                    :key="`${drop.item}-${dIdx}`"
                    class="dropItemPill"
                    :title="`${getDropName(drop)} ×${drop.qty} (${drop.chance}%)`"
                  >
                    <div class="dropSpriteWrapper">
                      <img
                        :src="`${basePath ?? base}/images/${getDropSprite(drop)}.png`"
                        :alt="getDropName(drop)"
                        class="dropSprite sprite"
                        width="18"
                        height="18"
                        loading="lazy"
                      />
                    </div>
                    <span class="dropNameText">{{ getDropName(drop) }}</span>
                    <span class="dropQtyText">×{{ drop.qty }}</span>
                    <span class="dropRateBadge">{{ drop.chance }}%</span>
                  </div>
                </div>
                <span v-else class="emptyVal">—</span>
              </td>

              <!-- 10. ACTIVE SKILL -->
              <td class="tdSkill">
                <div v-if="m.activeSkillDetail" class="skillBox activeSkillBox">
                  <div class="skillHeader">
                    <span class="skillTag activeTag">Active</span>
                    <strong class="skillTitle">{{ m.activeSkillDetail.name }}</strong>
                  </div>
                  <p class="skillDesc">{{ m.activeSkillDetail.description }}</p>
                </div>
                <span v-else class="emptyVal">—</span>
              </td>

              <!-- 11. PASSIVE SKILL -->
              <td class="tdSkill">
                <div v-if="m.passiveSkillDetail" class="skillBox passiveSkillBox">
                  <div class="skillHeader">
                    <span class="skillTag passiveTag">Passive</span>
                    <strong class="skillTitle">{{ m.passiveSkillDetail.name }}</strong>
                  </div>
                  <p class="skillDesc">{{ m.passiveSkillDetail.description }}</p>
                </div>
                <span v-else class="emptyVal">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile / Narrow Screen View: Responsive Cards -->
      <div v-if="filteredMonsters.length > 0" class="cardsWrapper">
        <div
          v-for="m in filteredMonsters"
          :key="`card-${m.id}`"
          class="monsterMobileCard"
          :class="{ isBossCard: m.isBoss || m.role === 'Boss' }"
        >
          <!-- Card Header: Image, Name, Role, Atk Type -->
          <div class="cardHeaderRow">
            <div class="cardSpriteBox" :class="{ isBossSprite: m.isBoss || m.role === 'Boss' }">
              <img
                :src="`${basePath ?? base}/images/${m.sprite || 'unit_slime'}.png`"
                :alt="m.name"
                class="monsterSprite sprite"
                width="48"
                height="48"
                loading="lazy"
              />
            </div>

            <div class="cardHeaderInfo">
              <div class="cardNameRow">
                <h4 class="cardMonsterName" :class="{ isBossName: m.isBoss || m.role === 'Boss' }">
                  {{ m.name }}
                </h4>
                <span v-if="m.isBoss || m.role === 'Boss'" class="badge bossBadge">Boss</span>
              </div>

              <div class="cardMetaRow">
                <span v-if="m.role && m.role !== 'Boss'" class="badge roleBadge">{{ m.role }}</span>
                <span v-if="m.rate" class="rateText">Rate: <strong>{{ m.rate }}</strong></span>
                <span
                  class="atkTypeBadge"
                  :class="getAtkTypeClass(m.attackType)"
                >
                  {{ m.attackType || 'Melee, Physical' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Card Stats Grid -->
          <div class="cardStatsGrid">
            <div class="statCell">
              <span class="statLabel">HP</span>
              <strong class="statHp">{{ m.stats?.hp ?? '—' }}</strong>
            </div>
            <div class="statCell">
              <span class="statLabel">DEF</span>
              <strong class="statDef">{{ m.stats?.defense ?? '—' }}</strong>
            </div>
            <div class="statCell">
              <span class="statLabel">MDEF</span>
              <strong class="statMdef">{{ m.stats?.magicDefense ?? '—' }}</strong>
            </div>
            <div class="statCell">
              <span class="statLabel">DMG</span>
              <strong class="statDmg">{{ m.damage?.min !== undefined ? `${m.damage.min} – ${m.damage.max}` : '—' }}</strong>
            </div>
            <div class="statCell">
              <span class="statLabel">EXP</span>
              <strong class="statExp">{{ m.expGiven ?? '—' }}</strong>
            </div>
          </div>

          <!-- Card Drops -->
          <div class="cardSection">
            <span class="cardSectionTitle">Drops ({{ m.drops?.length || 0 }})</span>
            <div v-if="m.drops?.length" class="cardDropsList">
              <div
                v-for="(drop, dIdx) in m.drops"
                :key="`card-drop-${drop.item}-${dIdx}`"
                class="dropItemPill"
              >
                <div class="dropSpriteWrapper">
                  <img
                    :src="`${basePath ?? base}/images/${getDropSprite(drop)}.png`"
                    :alt="getDropName(drop)"
                    class="dropSprite sprite"
                    width="18"
                    height="18"
                    loading="lazy"
                  />
                </div>
                <span class="dropNameText">{{ getDropName(drop) }}</span>
                <span class="dropQtyText">×{{ drop.qty }}</span>
                <span class="dropRateBadge">{{ drop.chance }}%</span>
              </div>
            </div>
            <span v-else class="emptyVal">No drops</span>
          </div>

          <!-- Card Active Skill -->
          <div v-if="m.activeSkillDetail" class="cardSection">
            <div class="skillBox activeSkillBox">
              <div class="skillHeader">
                <span class="skillTag activeTag">Active</span>
                <strong class="skillTitle">{{ m.activeSkillDetail.name }}</strong>
              </div>
              <p class="skillDesc">{{ m.activeSkillDetail.description }}</p>
            </div>
          </div>

          <!-- Card Passive Skill -->
          <div v-if="m.passiveSkillDetail" class="cardSection">
            <div class="skillBox passiveSkillBox">
              <div class="skillHeader">
                <span class="skillTag passiveTag">Passive</span>
                <strong class="skillTitle">{{ m.passiveSkillDetail.name }}</strong>
              </div>
              <p class="skillDesc">{{ m.passiveSkillDetail.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state if search has no matches -->
      <div v-if="filteredMonsters.length === 0" class="emptyStateCard">
        <p>No monsters found matching "{{ searchQuery }}" in this location.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.locationBrowser {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ================= Top Selector Bar ================= */
.selectorCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 1.25rem;
}

.selectorRow {
  display: flex;
  align-items: flex-end;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.dropdownGroup {
  flex: 1 1 280px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.searchGroup {
  flex: 1 1 240px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dropdownLabel {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-gold);
}

.selectWrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.locationSelect {
  width: 100%;
  appearance: none;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.65rem 2.2rem 0.65rem 0.85rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.locationSelect:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 2px rgba(110, 168, 254, 0.2);
}

.locationSelect optgroup {
  background: var(--bg-card);
  color: var(--text-gold);
  font-weight: 700;
}

.locationSelect option {
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 500;
}

.selectArrow {
  position: absolute;
  right: 12px;
  pointer-events: none;
  font-size: 0.65rem;
  color: var(--text-muted);
}

.searchBox {
  display: flex;
  align-items: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  transition: border-color 0.15s ease;
}

.searchBox:focus-within {
  border-color: var(--brand-primary);
}

.searchIcon {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  margin-right: 8px;
}

.searchInput {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.searchInput::placeholder {
  color: var(--text-muted);
}

/* ================= Location Header Card ================= */
.locationHeaderCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.locationHeaderMain {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.locationSpriteBox {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}

.locationSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.locationMetaGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.titleRow {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.locationTitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  border: none;
  padding: 0;
}

.typeBadge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.badge-dungeon {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.badge-raid {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.badge-epic-raid {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.badge-guild {
  background: rgba(168, 85, 247, 0.15);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.35);
}

.statsPills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 0.8rem;
}

.pillLabel {
  color: var(--text-muted);
}

.pillVal {
  color: var(--text-primary);
}

/* Loot Drawer */
.lootSection {
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.75rem;
}

.lootToggleBtn {
  background: transparent;
  border: none;
  color: var(--brand-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  outline: none;
}

.lootToggleIcon {
  font-size: 0.7rem;
}

.lootGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 0.75rem;
  max-height: 180px;
  overflow-y: auto;
  padding: 4px;
}

.lootChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 3px 8px 3px 4px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.lootSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* ================= Monsters Section ================= */
.monstersSection {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sectionTitleRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sectionTitle {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  border: none;
  padding: 0;
}

.countPill {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-gold);
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  padding: 2px 8px;
  border-radius: 10px;
}

/* ================= Table (Desktop / Tablet) ================= */
.tableWrapper {
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
}

.monstersTable {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
  margin: 0;
}

.monstersTable thead {
  background: var(--bg-sidebar);
  border-bottom: 2px solid var(--border-card);
}

.monstersTable th {
  padding: 0.75rem 0.85rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-gold);
  white-space: nowrap;
}

.thImage { width: 56px; text-align: center; }
.thName { min-width: 150px; }
.thStat { width: 60px; text-align: center; }
.thDmg { min-width: 80px; }
.thAtk { width: 120px; text-align: center; }
.thDrops { min-width: 220px; }
.thSkill { min-width: 220px; }

.monstersTable tbody tr {
  border-bottom: 1px solid var(--border-subtle);
  transition: background-color 0.15s ease;
}

.monstersTable tbody tr:hover {
  background-color: var(--bg-card-hover);
}

.monstersTable tbody tr:last-child {
  border-bottom: none;
}

.isBossRow {
  background: rgba(245, 158, 11, 0.04);
}

.isBossRow:hover {
  background: rgba(245, 158, 11, 0.08) !important;
}

.monstersTable td {
  padding: 0.7rem 0.85rem;
  vertical-align: middle;
}

/* Column 1: Image */
.tdImage {
  text-align: center;
}

.monsterSpriteBox {
  width: 48px;
  height: 48px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.monsterSpriteBox.isBossSprite {
  border-color: rgba(245, 158, 11, 0.45);
  background: radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, var(--bg-inset) 85%);
}

.monsterSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 40px;
  height: 40px;
  object-fit: contain;
}

/* Column 2: Name */
.nameStack {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nameHeader {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.monsterName {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.monsterName.isBossName {
  color: #fbbf24;
}

.roleMeta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.3;
}

.bossBadge {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.45);
}

.roleBadge {
  background: var(--bg-inset);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.rateText {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.rateText strong {
  color: var(--brand-primary);
}

/* Columns 3-7: Stats */
.tdStat {
  text-align: center;
  font-weight: 600;
}

.statHp {
  color: #34d399;
}

.statDef {
  color: #cbd5e1;
}

.statMdef {
  color: #c084fc;
}

.statDmg {
  color: #f87171;
  white-space: nowrap;
}

.statExp {
  color: #38bdf8;
}

/* Column 8: Atk Type */
.tdAtk {
  text-align: center;
}

.atkTypeBadge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.atk-magic {
  background: rgba(168, 85, 247, 0.12);
  color: #d8b4fe;
  border-color: rgba(168, 85, 247, 0.35);
}

.atk-ranged {
  background: rgba(52, 211, 153, 0.12);
  color: #86efac;
  border-color: rgba(52, 211, 153, 0.35);
}

.atk-melee {
  background: rgba(251, 146, 60, 0.12);
  color: #fdba74;
  border-color: rgba(251, 146, 60, 0.35);
}

.atk-default {
  background: var(--bg-inset);
  color: var(--text-secondary);
  border-color: var(--border-subtle);
}

/* Column 9: Drops */
.dropsList {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropItemPill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 2px 6px 2px 3px;
  font-size: 0.76rem;
  width: fit-content;
}

.dropSpriteWrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

.dropSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.dropNameText {
  color: var(--text-primary);
  font-weight: 500;
}

.dropQtyText {
  color: var(--text-muted);
  font-weight: 600;
}

.dropRateBadge {
  color: var(--text-gold);
  font-weight: 700;
  margin-left: 2px;
}

/* Columns 10 & 11: Skills */
.skillBox {
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  border: 1px solid transparent;
}

.activeSkillBox {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.3);
}

.passiveSkillBox {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.3);
}

.skillHeader {
  display: flex;
  align-items: center;
  gap: 5px;
}

.skillTag {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 4px;
  border-radius: 3px;
}

.activeTag {
  background: #38bdf8;
  color: #000;
}

.passiveTag {
  background: #f59e0b;
  color: #000;
}

.skillTitle {
  font-size: 0.82rem;
  color: var(--text-primary);
}

.skillDesc {
  margin: 0;
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

.emptyVal {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.85rem;
}

/* ================= Cards (Mobile / Narrow View) ================= */
.cardsWrapper {
  display: none;
}

.monsterMobileCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: border-color 0.15s ease;
}

.monsterMobileCard.isBossCard {
  border-color: rgba(245, 158, 11, 0.45);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, var(--bg-card) 60%);
}

.cardHeaderRow {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.cardSpriteBox {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.cardHeaderInfo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.cardNameRow {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cardMonsterName {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.cardMetaRow {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cardStatsGrid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
  text-align: center;
}

.statCell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.statLabel {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.cardSection {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cardSectionTitle {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-gold);
}

.cardDropsList {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.emptyStateCard {
  background: var(--bg-card);
  border: 1px dashed var(--border-card);
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

/* Responsive breakpoint: switch to card when width doesn't fit table anymore */
@media (max-width: 1024px) {
  .tableWrapper {
    display: none;
  }
  .cardsWrapper {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
}

@media (max-width: 640px) {
  .locationHeaderMain {
    flex-direction: column;
    align-items: flex-start;
  }
  .locationSpriteBox {
    width: 64px;
    height: 64px;
  }
  .locationSprite {
    width: 56px;
    height: 56px;
  }
  .cardStatsGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
