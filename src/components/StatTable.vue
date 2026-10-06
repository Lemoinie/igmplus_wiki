<script setup lang="ts">
defineProps<{
  title?: string;
  headers?: string[];
  stats?: Record<string, number | string>;
  rows?: Array<{
    label: string;
    values: Array<string | number>;
  }>;
}>();
</script>

<template>
  <div class="statTableContainer">
    <h4 v-if="title" class="tableTitle">{{ title }}</h4>

    <!-- Simple Key-Value Mode -->
    <table v-if="stats" class="statTable keyValueMode">
      <tbody>
        <tr v-for="(val, key) in stats" :key="key">
          <td class="statKey">{{ key }}</td>
          <td class="statValue">{{ val }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Multi-Column Table Mode -->
    <table v-else-if="rows && rows.length" class="statTable multiColMode">
      <thead v-if="headers && headers.length">
        <tr>
          <th v-for="(h, idx) in headers" :key="idx">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIdx) in rows" :key="rIdx">
          <td class="rowLabel">{{ row.label }}</td>
          <td v-for="(val, vIdx) in row.values" :key="vIdx" class="statValue">
            {{ val }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.statTableContainer {
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-card);
  background: var(--bg-card);
}

.tableTitle {
  margin: 0;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.statTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.statTable th {
  padding: 0.6rem 0.85rem;
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-muted);
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-subtle);
}

.statTable td {
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.statTable tr:last-child td {
  border-bottom: none;
}

.statTable tr:hover td {
  background: var(--bg-card-hover);
}

.statKey {
  color: var(--text-muted);
  font-weight: 500;
  width: 50%;
  text-transform: capitalize;
}

.statValue {
  color: var(--text-gold);
  font-weight: 600;
}

.rowLabel {
  font-weight: 600;
  color: var(--text-primary);
}
</style>
