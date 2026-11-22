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

interface LocationItemIngredient {
  id: string;
  name: string;
  sprite?: string;
  qty: number;
  hasPage: boolean;
}

interface LocationItemRecipe {
  id: string;
  name: string;
  sprite?: string;
  hasPage: boolean;
  ingredients: LocationItemIngredient[];
}

interface LocationItemCard {
  id: string;
  name: string;
  sprite?: string;
  hasPage: boolean;
  usedInRecipes?: LocationItemRecipe[];
  ownRecipe?: LocationItemIngredient[];
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
  locationItems?: LocationItemCard[];
}

const props = defineProps<{
  locations: LocationData[];
  basePath?: string;
}>();

const selectedLocationId = ref(props.locations[0]?.id || '');
const searchQuery = ref('');
const activeSubTab = ref<'monster' | 'item'>('monster');
const showRecipes = ref(false);

interface LocationExtraInfo {
  unlockReq: string;
  darkness?: number;
  notes?: string[];
}

const LOCATION_INFO: Record<string, LocationExtraInfo> = {
  EnchantedForest: { unlockReq: 'Unlocked by default' },
  TheDesert: { unlockReq: 'Reach area 80 in D1. Enchanted Forest' },
  EternalBattlefield: { unlockReq: 'Reach area 100 in D2. The Desert', darkness: 20 },
  TheGoldenCity: { unlockReq: 'Reach area 100 in D3. Eternal Battlefield' },
  BlackwaterPort: { unlockReq: 'Reach area 100 in D4. The Golden City' },
  FrostbitePeaks: { unlockReq: 'Reach area 100 in D5. Blackwater Port' },
  ObsidianMines: { unlockReq: 'Reach area 100 in D6. Frostbite Peaks' },
  TheSouthernGrove: { unlockReq: 'Complete R6. The Dreadful Ascent', darkness: 15 },
  BarrenWastelands: { unlockReq: 'Reach area 60 in D8. The Southern Grove' },
  HiddenCityOfLarox: { unlockReq: 'Reach area 100 in D9. Barren Wastelands', darkness: 8 },
  LostLands: { unlockReq: 'Reach area 100 in D10. Hidden City of Larox', darkness: 12 },
  TheSunkenCitadel: {
    unlockReq: 'Reach area 150 in D11. Lost Lands',
    darkness: 50,
    notes: ['Elite Room Entry Requirement: Have an adventurer wearing [Accessory: Tidal Lantern]'],
  },
  CorruptedForest: { unlockReq: 'Unlocked by default' },
  CorruptedDesert: {
    unlockReq: 'Reach area 100 in C1. Corrupted Forest (or D2. The Desert)',
    darkness: 10,
    notes: ["Elite Room Entry Requirement: Everytime defeating Corrupted Sha'Kire 10 times, has 10% to summon Corrupted Sha"],
  },
  TheSlimePond: { unlockReq: 'Reach area 150 in D1. Enchanted Forest' },
  DivineArcheology: {
    unlockReq: 'Reach area 150 in D2. The Desert',
    notes: ['Boss Room Entry Requirement: Total Adventurer Con Score 200 or Higher'],
  },
  AncientGraveDigging: { unlockReq: 'Reach area 150 in D3. Eternal Battlefield' },
  ImperialRescue: { unlockReq: 'Reach area 150 in D4. The Golden City' },
  TheCultistRebels: {
    unlockReq: 'Reach area 150 in D6. Frostbite Peaks',
    notes: [
      'Boss Appearance Conditions:',
      '- If there is an adventurer wearing [Accessory: Skeleton Key] among the adventurers, you can meet the Primordial Titan.',
      '- If not, you will meet Claris & Torvus.',
    ],
  },
  TheDreadfulAscent: { unlockReq: 'Reach area 100 in D7. Obsidian Mines' },
  TheLostExpedition: { unlockReq: 'Reach area 220 in D7. Obsidian Mines', darkness: 100 },
  CelestialMothership: { unlockReq: 'Reach area 180 in D9. Barren Wastelands' },
  TheDireDescent: { unlockReq: 'Reach area 100 in D11. Lost Lands' },
  SleepingPlanet: { unlockReq: 'Complete R9. The Dire Descent' },
  Kaunis: { unlockReq: 'Complete R9. The Dire Descent', darkness: 18 },
  TheTower: {
    unlockReq: 'Complete R9. The Dire Descent',
    notes: ['Special: Revives 1 adventurer each time they encounter a monster.'],
  },
  SanguineCrucible: { unlockReq: 'Complete R12. The Tower' },
  TheHadalAbyss: { unlockReq: 'Defeat 10 Leviathan Hatchlings in D12. The Sunken Citadel', darkness: 90 },
  TheSlumberingShallowsArea: { unlockReq: 'Unlocked by default' },
  GuildRequestArea: { unlockReq: 'Unlocked by default', darkness: 50 },
  GuildSiegeArea: { unlockReq: 'Unlocked by default', darkness: 15 },
};

const selectedLocation = computed<LocationData | undefined>(() => {
  return props.locations.find((loc) => loc.id === selectedLocationId.value) || props.locations[0];
});

const currentLocationInfo = computed<LocationExtraInfo | undefined>(() => {
  if (!selectedLocation.value) return undefined;
  return LOCATION_INFO[selectedLocation.value.id];
});

// Categorized locations for dropdown
const dungeons = computed(() => props.locations.filter((l) => l.type === 'dungeon' && !l.id.startsWith('Corrupted')));
const corruptedDungeons = computed(() => props.locations.filter((l) => l.type === 'dungeon' && l.id.startsWith('Corrupted')));
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

function matchesItemQuery(item: LocationItemCard, q: string): boolean {
  if (!q) return true;
  if (item.name?.toLowerCase().includes(q) || item.id?.toLowerCase().includes(q)) return true;
  if (item.usedInRecipes?.some((r) => r.name?.toLowerCase().includes(q) || r.ingredients.some((i) => i.name?.toLowerCase().includes(q)))) {
    return true;
  }
  if (item.ownRecipe?.some((i) => i.name?.toLowerCase().includes(q))) return true;
  return false;
}

const filteredLocationItems = computed(() => {
  if (!selectedLocation.value) return [];
  const list = selectedLocation.value.locationItems || [];
  const q = searchQuery.value.trim().toLowerCase();
  return q ? list.filter((item) => matchesItemQuery(item, q)) : list;
});

const totalLocationItemsCount = computed(() => {
  return selectedLocation.value?.locationItems?.length || 0;
});

function getItemUrl(id: string): string {
  return `${props.basePath ?? base}/items/${id}`;
}

function getItemSpriteUrl(sprite?: string, id?: string): string {
  const file = sprite || (id ? toSnakeCase(id) : '');
  return `${props.basePath ?? base}/images/${file}.png`;
}

function onSelectLocation(id: string) {
  selectedLocationId.value = id;
  searchQuery.value = '';
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
                <option v-for="(d, idx) in dungeons" :key="d.id" :value="d.id">
                  D{{ idx + 1 }}. {{ d.name }}
                </option>
              </optgroup>
              <optgroup v-if="corruptedDungeons.length" label="Corrupted Dungeons">
                <option v-for="(cd, idx) in corruptedDungeons" :key="cd.id" :value="cd.id">
                  C{{ idx + 1 }}. {{ cd.name }}
                </option>
              </optgroup>
              <optgroup v-if="raids.length" label="Raids & Epic Raids">
                <option v-for="(r, idx) in raids" :key="r.id" :value="r.id">
                  R{{ idx + 1 }}. {{ r.name }}{{ r.type === 'epic_raid' ? ' [E]' : '' }}
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
          <label for="monsterSearch" class="dropdownLabel">
            {{ activeSubTab === 'monster' ? 'Filter Monsters' : 'Filter Items' }}
          </label>
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
              :placeholder="activeSubTab === 'monster' ? 'Filter by name, skill, drop…' : 'Filter by item or recipe…'"
              class="searchInput"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Active Location Banner / Info -->
    <div v-if="selectedLocation" class="locationHeaderCard">
      <div class="locationHeaderMain">
        <div class="locationMetaGroup">
          <p v-if="currentLocationInfo" class="locationInfoLine">
            Unlock Requirements: {{ currentLocationInfo.unlockReq }}
          </p>
          <p v-if="(currentLocationInfo?.darkness ?? 0) > 0" class="locationInfoLine">
            Darkness: {{ currentLocationInfo!.darkness }}
          </p>
          <p
            v-for="(note, nIdx) in currentLocationInfo?.notes ?? []"
            :key="nIdx"
            class="locationInfoLine"
          >
            {{ note }}
          </p>
        </div>
      </div>
    </div>

    <!-- Sub-page Tabs: Monster / Item -->
    <div v-if="selectedLocation" class="subTabBar" role="tablist" aria-label="Location views">
      <button
        type="button"
        role="tab"
        class="subTabBtn"
        :class="{ active: activeSubTab === 'monster' }"
        :aria-selected="activeSubTab === 'monster'"
        @click="activeSubTab = 'monster'"
      >
        <span>Monster</span>
        <span class="subTabCount">{{ selectedLocation.enemies?.length || 0 }}</span>
      </button>
      <button
        type="button"
        role="tab"
        class="subTabBtn"
        :class="{ active: activeSubTab === 'item' }"
        :aria-selected="activeSubTab === 'item'"
        @click="activeSubTab = 'item'"
      >
        <span>Item</span>
        <span class="subTabCount">{{ totalLocationItemsCount }}</span>
      </button>

      <button
        v-if="activeSubTab === 'item'"
        type="button"
        class="recipeToggleBtn"
        :class="{ active: showRecipes }"
        :aria-pressed="showRecipes"
        @click="showRecipes = !showRecipes"
      >
        <span class="recipeToggleDot" aria-hidden="true" />
        <span>Recipe</span>
      </button>
    </div>

    <!-- Monsters Table & Responsive Cards -->
    <div v-if="selectedLocation && activeSubTab === 'monster'" class="monstersSection">
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
                    loading="eager"
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
                    :title="`${getDropName(drop)}${drop.qty > 1 ? ` ×${drop.qty}` : ''} (${drop.chance}%)`"
                  >
                    <div class="dropSpriteWrapper">
                      <img
                        :src="`${basePath ?? base}/images/${getDropSprite(drop)}.png`"
                        :alt="getDropName(drop)"
                        class="dropSprite sprite"
                        width="24"
                        height="24"
                        loading="eager"
                      />
                    </div>
                    <span v-if="drop.qty > 1" class="dropQtyText">×{{ drop.qty }}</span>
                    <span class="dropRateBadge">{{ drop.chance }}%</span>
                  </div>
                </div>
                <span v-else class="emptyVal">—</span>
              </td>

              <!-- 10. ACTIVE SKILL -->
              <td class="tdSkill">
                <div v-if="m.activeSkillDetail" class="skillBox">
                  <div class="skillHeader">
                    <strong class="skillTitle" style="color:red">[{{ m.activeSkillDetail.name }}]</strong>
                  </div>
                  <p class="skillDesc">{{ m.activeSkillDetail.description }}</p>
                </div>
                <span v-else class="emptyVal">—</span>
              </td>

              <!-- 11. PASSIVE SKILL -->
              <td class="tdSkill">
                <div v-if="m.passiveSkillDetail" class="skillBox">
                  <div class="skillHeader">
                    <strong class="skillTitle" style="color:green">[{{ m.passiveSkillDetail.name }}]</strong>
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
                loading="eager"
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
                <span v-if="m.rate && m.rate !== 'Event'" class="rateText">Rate: <strong>{{ m.rate }}</strong></span>
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
                class="dropItemPill cardDropPill"
                :title="`${getDropName(drop)}${drop.qty > 1 ? ` ×${drop.qty}` : ''} (${drop.chance}%)`"
              >
                <div class="dropSpriteWrapper">
                  <img
                    :src="`${basePath ?? base}/images/${getDropSprite(drop)}.png`"
                    :alt="getDropName(drop)"
                    class="dropSprite sprite"
                    width="22"
                    height="22"
                    loading="lazy"
                  />
                </div>
                <span class="dropNameText">{{ getDropName(drop) }}</span>
                <span v-if="drop.qty > 1" class="dropQtyText">×{{ drop.qty }}</span>
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

    <!-- Items Sub-page -->
    <div v-if="selectedLocation && activeSubTab === 'item'" class="itemsSection">
      <div v-if="filteredLocationItems.length > 0" class="itemCardsGrid">
        <div v-for="item in filteredLocationItems" :key="item.id" class="locationItemCard">
          <a
            v-if="item.hasPage"
            :href="getItemUrl(item.id)"
            class="itemCardHeader itemCardHeaderLink"
            :title="item.name"
          >
            <div class="itemSpriteWrap">
              <img
                :src="getItemSpriteUrl(item.sprite, item.id)"
                :alt="item.name"
                class="itemCardSprite sprite"
                width="36"
                height="36"
                loading="lazy"
              />
            </div>
            <span class="itemCardName">{{ item.name }}</span>
          </a>
          <div v-else class="itemCardHeader">
            <div class="itemSpriteWrap">
              <img
                :src="getItemSpriteUrl(item.sprite, item.id)"
                :alt="item.name"
                class="itemCardSprite sprite"
                width="36"
                height="36"
                loading="lazy"
              />
            </div>
            <span class="itemCardName">{{ item.name }}</span>
          </div>

          <div v-if="showRecipes && item.ownRecipe?.length" class="recipeBlock">
            <div class="recipeBlockLabel">Recipe</div>
            <div class="recipeEquationRow">
              <template v-for="(ing, iIdx) in item.ownRecipe" :key="ing.id">
                <span v-if="iIdx > 0" class="recipeOp">+</span>
                <a
                  v-if="ing.hasPage"
                  :href="getItemUrl(ing.id)"
                  class="recipeSlot"
                  :title="`${ing.name} ×${ing.qty}`"
                >
                  <img
                    :src="getItemSpriteUrl(ing.sprite, ing.id)"
                    :alt="ing.name"
                    class="recipeSlotSprite sprite"
                    width="26"
                    height="26"
                    loading="lazy"
                  />
                  <span class="recipeSlotQty">{{ ing.qty }}</span>
                </a>
                <span v-else class="recipeSlot" :title="`${ing.name} ×${ing.qty}`">
                  <img
                    :src="getItemSpriteUrl(ing.sprite, ing.id)"
                    :alt="ing.name"
                    class="recipeSlotSprite sprite"
                    width="26"
                    height="26"
                    loading="lazy"
                  />
                  <span class="recipeSlotQty">{{ ing.qty }}</span>
                </span>
              </template>

              <span class="recipeArrow">→</span>

              <a
                v-if="item.hasPage"
                :href="getItemUrl(item.id)"
                class="recipeSlot recipeSlotOutput"
                :title="item.name"
              >
                <img
                  :src="getItemSpriteUrl(item.sprite, item.id)"
                  :alt="item.name"
                  class="recipeSlotSprite sprite"
                  width="26"
                  height="26"
                  loading="lazy"
                />
              </a>
              <span v-else class="recipeSlot recipeSlotOutput" :title="item.name">
                <img
                  :src="getItemSpriteUrl(item.sprite, item.id)"
                  :alt="item.name"
                  class="recipeSlotSprite sprite"
                  width="26"
                  height="26"
                  loading="lazy"
                />
              </span>
            </div>
          </div>

          <div v-if="showRecipes && item.usedInRecipes?.length" class="recipeBlock">
            <div class="recipeBlockLabel">Used in Recipes ({{ item.usedInRecipes.length }})</div>
            <div class="recipeList">
              <div v-for="rec in item.usedInRecipes" :key="rec.id" class="recipeEquationRow">
                <template v-for="(ing, iIdx) in rec.ingredients" :key="ing.id">
                  <span v-if="iIdx > 0" class="recipeOp">+</span>
                  <a
                    v-if="ing.hasPage"
                    :href="getItemUrl(ing.id)"
                    class="recipeSlot"
                    :title="`${ing.name} ×${ing.qty}`"
                  >
                    <img
                      :src="getItemSpriteUrl(ing.sprite, ing.id)"
                      :alt="ing.name"
                      class="recipeSlotSprite sprite"
                      width="26"
                      height="26"
                      loading="lazy"
                    />
                    <span class="recipeSlotQty">{{ ing.qty }}</span>
                  </a>
                  <span v-else class="recipeSlot" :title="`${ing.name} ×${ing.qty}`">
                    <img
                      :src="getItemSpriteUrl(ing.sprite, ing.id)"
                      :alt="ing.name"
                      class="recipeSlotSprite sprite"
                      width="26"
                      height="26"
                      loading="lazy"
                    />
                    <span class="recipeSlotQty">{{ ing.qty }}</span>
                  </span>
                </template>

                <span class="recipeArrow">→</span>

                <a
                  v-if="rec.hasPage"
                  :href="getItemUrl(rec.id)"
                  class="recipeSlot recipeSlotOutput"
                  :title="rec.name"
                >
                  <img
                    :src="getItemSpriteUrl(rec.sprite, rec.id)"
                    :alt="rec.name"
                    class="recipeSlotSprite sprite"
                    width="26"
                    height="26"
                    loading="lazy"
                  />
                </a>
                <span v-else class="recipeSlot recipeSlotOutput" :title="rec.name">
                  <img
                    :src="getItemSpriteUrl(rec.sprite, rec.id)"
                    :alt="rec.name"
                    class="recipeSlotSprite sprite"
                    width="26"
                    height="26"
                    loading="lazy"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state if search has no matches -->
      <div v-if="filteredLocationItems.length === 0" class="emptyStateCard">
        <p v-if="searchQuery">No items found matching "{{ searchQuery }}" in this location.</p>
        <p v-else>No items listed for this location.</p>
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

.locationInfoLine {
  margin: 0;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.55;
}

/* Sub-page Tabs (Monster / Item) */
.subTabBar {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.5rem;
}

.subTabBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  border: 1px solid var(--border-card);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.subTabBtn:hover {
  color: var(--text-primary);
  border-color: var(--border-focus);
  background: var(--bg-card-hover);
}

.subTabBtn.active {
  color: #ffffff;
  background: color-mix(in srgb, var(--brand-primary) 22%, var(--bg-card));
  border-color: var(--brand-primary);
}

.subTabCount {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--bg-inset);
  color: var(--text-muted);
}

.subTabBtn.active .subTabCount {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.recipeToggleBtn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-card);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.recipeToggleBtn:hover {
  color: var(--text-primary);
  border-color: var(--border-focus);
  background: var(--bg-card-hover);
}

.recipeToggleBtn.active {
  color: #ffffff;
  border-color: rgba(245, 158, 11, 0.7);
  background: rgba(245, 158, 11, 0.18);
}

.recipeToggleDot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--text-muted);
  opacity: 0.55;
  transition: all 0.15s ease;
}

.recipeToggleBtn.active .recipeToggleDot {
  background: #f59e0b;
  opacity: 1;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
}

/* ================= Items Sub-page ================= */
.itemsSection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.itemGroup {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.itemCardsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 0.85rem;
}

.locationItemCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.itemCardHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #ffffff;
}

.itemCardHeaderLink:hover .itemCardName {
  color: var(--brand-primary);
}

.itemSpriteWrap {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.itemCardSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.itemCardName {
  font-size: 0.98rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.25;
  transition: color 0.15s ease;
}

.recipeBlock {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-subtle);
}

.recipeBlockLabel {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.recipeList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipeEquationRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  padding: 0.45rem 0.55rem;
  border-radius: 8px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
}

.recipeOp,
.recipeArrow {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  user-select: none;
  line-height: 1;
}

.recipeArrow {
  color: var(--text-gold);
  padding: 0 2px;
}

.recipeSlot {
  position: relative;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  text-decoration: none;
  flex-shrink: 0;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

a.recipeSlot:hover {
  border-color: var(--brand-primary);
  transform: translateY(-1px);
}

.recipeSlotOutput {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.08);
}

.recipeSlotSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.recipeSlotQty {
  position: absolute;
  right: 2px;
  bottom: 1px;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
  text-shadow: 0 1px 2px #000000, 0 0 3px #000000;
  pointer-events: none;
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
  padding: 0.5rem 0.35rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-gold);
  white-space: nowrap;
}

.thImage { width: 42px; text-align: center; }
.thName { width: 90px; min-width: 85px; }
.thStat { width: 40px; text-align: center; }
.thDmg { width: 56px; text-align: center; }
.thAtk { width: 78px; text-align: center; }
.thDrops { width: 110px; min-width: 100px; }
.thSkill { width: 135px; min-width: 120px; }

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
  padding: 0.45rem 0.35rem;
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
  color: #ffffff;
}

.statDef {
  color: #ffffff;
}

.statMdef {
  color: #ffffff;
}

.statDmg {
  color: #ffffff;
  white-space: nowrap;
}

.statExp {
  color: #ffffff;
}

/* Column 8: Atk Type */
.tdAtk {
  text-align: center;
}

.atkTypeBadge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 4px;
  border: 0px solid transparent;
  line-height: 1.2;
  white-space: normal;
  max-width: 78px;
  text-align: center;
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
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.dropItemPill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 5px;
  padding: 2px 4px 2px 2px;
  font-size: 0.73rem;
  white-space: nowrap;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.dropItemPill:hover {
  border-color: rgba(245, 158, 11, 0.45);
  background: var(--bg-card-hover);
}

.dropSpriteWrapper {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  flex-shrink: 0;
}

.dropSprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.dropNameText {
  color: var(--text-primary);
  font-weight: 500;
}

.dropQtyText {
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.72rem;
  margin-left: 1px;
}

.dropRateBadge {
  color: var(--text-gold);
  font-weight: 700;
  font-size: 0.72rem;
  margin-left: 1px;
}

.cardDropPill {
  padding: 2px 6px 2px 2px;
}

.cardDropPill .dropSpriteWrapper {
  width: 24px;
  height: 24px;
}

.cardDropPill .dropSprite {
  width: 20px;
  height: 20px;
}

/* Columns 10 & 11: Skills */
.skillBox {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 6px;
  padding: 0.25rem 0.4rem;
  border: 1px solid transparent;
  max-width: 135px;
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
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-primary);
}

.skillDesc {
  margin: 0;
  font-size: 0.68rem;
  color: var(--text-secondary);
  line-height: 1.25;
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
@media (max-width: 1080px) {
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
