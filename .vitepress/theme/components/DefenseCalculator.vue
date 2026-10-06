<script setup>
/**
 * Hyperbolic defense mitigation calculator.
 * DR% = DEF * 100 / (DEF + 50);  EHP multiplier = 1 + DEF / 50
 */
import { ref, computed } from 'vue'

const def = ref(50)
const mdef = ref(0)
const hp = ref(1000)

const reduce = (d) => d / (d + 50)
const drPct = computed(() => (reduce(def.value) * 100).toFixed(1))
const mdrPct = computed(() => (reduce(mdef.value) * 100).toFixed(1))
const ehp = computed(() => Math.round(hp.value * (1 + def.value / 50)))
const ehpMag = computed(() => Math.round(hp.value * (1 + mdef.value / 50)))

const anchors = [0, 10, 20, 50, 100, 200, 300, 500]
</script>

<template>
  <div class="defcalc">
    <div class="defcalc-row">
      <label>DEF <strong>{{ def }}</strong></label>
      <input v-model.number="def" type="range" min="0" max="500" step="1" />
    </div>
    <div class="defcalc-row">
      <label>MDEF <strong>{{ mdef }}</strong></label>
      <input v-model.number="mdef" type="range" min="0" max="500" step="1" />
    </div>
    <div class="defcalc-row">
      <label>Max HP <strong>{{ hp }}</strong></label>
      <input v-model.number="hp" type="range" min="1" max="50000" step="100" />
    </div>

    <table class="defcalc-out">
      <thead>
        <tr><th></th><th>Physical</th><th>Magic</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Damage reduction</td>
          <td>{{ drPct }}%</td>
          <td>{{ mdrPct }}%</td>
        </tr>
        <tr>
          <td>Effective HP</td>
          <td>{{ ehp.toLocaleString() }}</td>
          <td>{{ ehpMag.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>

    <details>
      <summary>Reference anchors</summary>
      <table class="defcalc-out">
        <thead>
          <tr><th>DEF</th><th>DR%</th><th>EHP×</th></tr>
        </thead>
        <tbody>
          <tr v-for="a in anchors" :key="a">
            <td>{{ a }}</td>
            <td>{{ (reduce(a) * 100).toFixed(1) }}%</td>
            <td>{{ (1 + a / 50).toFixed(1) }}×</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<style scoped>
.defcalc {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}
.defcalc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.defcalc-row label {
  min-width: 110px;
  font-size: 14px;
}
.defcalc-row input[type='range'] {
  flex: 1;
  accent-color: var(--vp-c-brand-1);
}
.defcalc-out {
  width: 100%;
  margin-top: 8px;
  font-size: 14px;
}
.defcalc-out th,
.defcalc-out td {
  padding: 6px 10px;
  text-align: left;
}
</style>
