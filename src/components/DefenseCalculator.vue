<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const isExpanded = ref(false);

onMounted(() => {
  try {
    const saved = localStorage.getItem('igm_defense_calc_open');
    if (saved !== null) {
      isExpanded.value = saved === '1';
    }
  } catch {}
});

function toggleCalculator() {
  isExpanded.value = !isExpanded.value;
  try {
    localStorage.setItem('igm_defense_calc_open', isExpanded.value ? '1' : '0');
  } catch {}
}

const defense = ref(50);
const penetration = ref(0);
const incomingDamage = ref(100);

// Presets for quick evaluation
const presets = [
  { label: '0 DEF (0%)', def: 0 },
  { label: '10 DEF (16%)', def: 10 },
  { label: '25 DEF (33%)', def: 25 },
  { label: '50 DEF (50%)', def: 50 },
  { label: '75 DEF (60%)', def: 75 },
  { label: '100 DEF (66%)', def: 100 },
  { label: '117 DEF (70%)', def: 117 },
  { label: '150 DEF (75%)', def: 150 },
  { label: '200 DEF (80%)', def: 200 },
  { label: '450 DEF (90%)', def: 450 },
];

function setPreset(val: number) {
  defense.value = val;
}

const effectiveDef = computed(() => {
  const d = Math.max(0, defense.value || 0);
  const pen = Math.max(0, Math.min(100, penetration.value || 0));
  return Math.max(0, d * (1 - pen / 100));
});

// Formula: (100 * DEF) / (50 + DEF), floored
const damageReductionPercent = computed(() => {
  const def = effectiveDef.value;
  if (def <= 0) return 0;
  return Math.floor((100 * def) / (50 + def));
});

const damageMultiplier = computed(() => {
  return Math.max(0, (100 - damageReductionPercent.value) / 100);
});

const damageTaken = computed(() => {
  const inc = Math.max(0, incomingDamage.value || 0);
  return Math.round(inc * damageMultiplier.value * 10) / 10;
});

const ehpMultiplier = computed(() => {
  const red = damageReductionPercent.value;
  if (red >= 100) return 999;
  return 100 / (100 - red);
});
</script>

<template>
  <div class="defenseCalcContainer">
    <!-- Collapsible Toggle Header Bar -->
    <div
      class="calcToggleBar"
      @click="toggleCalculator"
      role="button"
      :aria-expanded="isExpanded"
      tabindex="0"
      @keydown.enter.prevent="toggleCalculator"
      @keydown.space.prevent="toggleCalculator"
    >
      <div class="toggleBarLeft">
        <div class="calcIconBox">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="18" />
            <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
          </svg>
        </div>
        <div class="toggleText">
          <span class="toggleTitle">Damage Reduction Calculator</span>
          <span class="toggleSub">Interactive Tool</span>
        </div>
      </div>

      <button type="button" class="toggleActionBtn" @click.stop="toggleCalculator">
        <span>{{ isExpanded ? 'Hide Calculator' : 'Show Calculator' }}</span>
        <span class="toggleChevron" :class="{ open: isExpanded }">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
    </div>

    <!-- Collapsible Content -->
    <div v-show="isExpanded" class="calcContentWrap">
      <!-- Interactive Calculator -->
      <div class="calcCard">
        <div class="calcHeader">
          <h3>Damage Reduction Calculator</h3>
          <span class="calcBadge">Interactive</span>
        </div>

        <!-- Quick Presets -->
        <div class="presetRow">
          <span class="presetLabel">Quick Presets:</span>
          <div class="presetButtons">
            <button
              v-for="p in presets"
              :key="p.def"
              type="button"
              class="presetBtn"
              :class="{ active: defense === p.def }"
              @click="setPreset(p.def)"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Inputs Grid -->
        <div class="inputsGrid">
          <!-- Defense Input -->
          <div class="inputGroup">
            <label for="defInput">DEF / MDEF</label>
            <div class="sliderAndNum">
              <input
                id="defInput"
                v-model.number="defense"
                type="range"
                min="0"
                max="600"
                step="1"
                class="rangeSlider"
              />
              <input
                v-model.number="defense"
                type="number"
                min="0"
                max="9999"
                class="numInput"
              />
            </div>
          </div>

          <!-- Armor Penetration -->
          <div class="inputGroup">
            <label for="penInput">Enemy Armor Penetration</label>
            <div class="sliderAndNum">
              <input
                id="penInput"
                v-model.number="penetration"
                type="range"
                min="0"
                max="100"
                step="5"
                class="rangeSlider"
              />
              <input
                v-model.number="penetration"
                type="number"
                min="0"
                max="100"
                class="numInput"
              />
            </div>
          </div>

          <!-- Raw Incoming Damage -->
          <div class="inputGroup">
            <label for="dmgInput">Incoming Hit Damage</label>
            <input
              id="dmgInput"
              v-model.number="incomingDamage"
              type="number"
              min="1"
              max="100000"
              class="numInput fullWidth"
            />
          </div>
        </div>

        <!-- Calculation Results -->
        <div class="resultsSection">
          <div class="mainResultCard">
            <span class="mainResultTitle">Damage Reduction</span>
            <div class="mainResultVal">
              {{ damageReductionPercent }}%
            </div>
            <div class="progressBarWrap">
              <div
                class="progressBarFill"
                :style="{ width: `${Math.min(100, damageReductionPercent)}%` }"
              ></div>
            </div>
            <span class="mainResultSub">
              Mitigates {{ damageReductionPercent }}% of incoming damage
            </span>
          </div>

          <div class="metricCardsGrid">
            <div class="metricCard">
              <span class="metricLabel">Effective Defense</span>
              <strong class="metricVal">{{ effectiveDef % 1 === 0 ? effectiveDef.toFixed(0) : effectiveDef.toFixed(1) }}</strong>
              <span class="metricDesc">After penetration</span>
            </div>

            <div class="metricCard">
              <span class="metricLabel">Damage Multiplier</span>
              <strong class="metricVal">{{ damageMultiplier.toFixed(3) }}×</strong>
              <span class="metricDesc">{{ 100 - damageReductionPercent }}% damage taken</span>
            </div>

            <div class="metricCard">
              <span class="metricLabel">Actual Damage Taken</span>
              <strong class="metricVal textGold">{{ damageTaken }}</strong>
              <span class="metricDesc">From {{ incomingDamage }} raw hit</span>
            </div>

            <div class="metricCard">
              <span class="metricLabel">Effective Health (EHP)</span>
              <strong class="metricVal textTeal">{{ ehpMultiplier.toFixed(2) }}×</strong>
              <span class="metricDesc">+{{ ((ehpMultiplier - 1) * 100).toFixed(0) }}% survival capacity</span>
            </div>
          </div>
        </div>

        <!-- Linear EHP Insight -->
        <div class="insightBox">
          <strong>Mechanical Insight:</strong> Damage reduction is computed as <code>floor((100 × DEF) / (50 + DEF))</code>.
          At <strong>50 DEF</strong>, incoming damage is reduced by exactly <strong>50%</strong>, doubling Effective Health (2.0× EHP).
          Every 50 points of Defense linearly grants another +100% of base health in effective durability (+2% EHP per DEF point).
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.defenseCalcContainer {
  margin: 1.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Toggle Header Bar */
.calcToggleBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.calcToggleBar:hover {
  background: var(--bg-card-hover);
  border-color: var(--brand-primary);
}

.toggleBarLeft {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.calcIconBox {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(110, 168, 254, 0.12);
  color: var(--brand-primary);
  border: 1px solid rgba(110, 168, 254, 0.25);
  flex-shrink: 0;
}

.toggleText {
  display: flex;
  flex-direction: column;
}

.toggleTitle {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-primary);
}

.toggleSub {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.toggleActionBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  color: var(--brand-primary);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.calcToggleBar:hover .toggleActionBtn {
  border-color: var(--brand-primary);
  background: rgba(110, 168, 254, 0.15);
}

.toggleChevron {
  display: inline-flex;
  transition: transform 0.2s ease;
}

.toggleChevron.open {
  transform: rotate(180deg);
}

.calcContentWrap {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}



/* Calculator Card */
.calcCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.calcHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.calcHeader h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.calcBadge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(110, 168, 254, 0.15);
  color: var(--brand-primary);
  border: 1px solid rgba(110, 168, 254, 0.3);
  padding: 2px 7px;
  border-radius: 4px;
}

/* Presets */
.presetRow {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.presetLabel {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.presetButtons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.presetBtn {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 5px;
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 500;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.presetBtn:hover {
  border-color: var(--brand-primary);
  color: var(--text-primary);
}

.presetBtn.active {
  background: rgba(110, 168, 254, 0.2);
  border-color: var(--brand-primary);
  color: #93c5fd;
  font-weight: 700;
}

/* Inputs */
.inputsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inputGroup label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.sliderAndNum {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rangeSlider {
  flex: 1;
  accent-color: var(--brand-primary);
  cursor: pointer;
}

.numInput {
  width: 75px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  padding: 6px 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: right;
  outline: none;
}

.numInput:focus {
  border-color: var(--brand-primary);
}

.numInput.fullWidth {
  width: 100%;
  box-sizing: border-box;
  text-align: left;
}

/* Results */
.resultsSection {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

@media (max-width: 768px) {
  .resultsSection {
    grid-template-columns: 1fr;
  }
}

.mainResultCard {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.mainResultTitle {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6ee7b7;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.mainResultVal {
  font-size: 2.4rem;
  font-weight: 800;
  color: #a7f3d0;
  line-height: 1.1;
  margin-bottom: 8px;
}

.progressBarWrap {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progressBarFill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
  border-radius: 4px;
  transition: width 0.15s ease;
}

.mainResultSub {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.metricCardsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.metricCard {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metricLabel {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.metricVal {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.metricDesc {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.textGold {
  color: #fbbf24;
}

.textTeal {
  color: #38bdf8;
}

.insightBox {
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text-secondary);
  background: var(--bg-inset);
  border-left: 3px solid var(--brand-primary);
  padding: 0.75rem 1rem;
  border-radius: 0 6px 6px 0;
}

.insightBox strong {
  color: var(--text-primary);
}
</style>
