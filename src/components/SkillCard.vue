<script setup lang="ts">
import type { SkillDefinition } from '../types';

defineProps<{
  skill: SkillDefinition;
  basePath?: string;
}>();
</script>

<template>
  <div :id="skill.id" class="skillCard">
    <div class="skillHeader">
      <div class="skillInfo">
        <div class="skillTitleRow">
          <span class="skillKindBadge" :class="skill.kind">{{ skill.kind.toUpperCase() }}</span>
          <h4 class="skillName">{{ skill.name }}</h4>
        </div>
        <p class="skillDesc">{{ skill.description }}</p>
      </div>
    </div>
    <div v-if="skill.scaling" class="skillScaling">
      <span class="scalingLabel">Scaling:</span>
      <span class="scalingVal">{{ skill.scaling }}</span>
    </div>
  </div>
</template>

<style scoped>
.skillCard {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skillCard:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-gold);
}

.skillHeader {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.skillInfo {
  flex: 1;
  min-width: 0;
}

.skillTitleRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.skillName {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.skillKindBadge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.skillKindBadge.active {
  background: rgba(224, 86, 36, 0.2);
  color: #ff8a65;
  border: 1px solid rgba(224, 86, 36, 0.4);
}

.skillKindBadge.passive {
  background: rgba(110, 168, 254, 0.2);
  color: #90caf9;
  border: 1px solid rgba(110, 168, 254, 0.4);
}

.skillDesc {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.4;
  color: var(--text-muted);
}

.skillScaling {
  padding-top: 0.4rem;
  border-top: 1px dashed var(--border-subtle);
  font-size: 0.75rem;
  display: flex;
  gap: 0.35rem;
}

.scalingLabel {
  color: var(--text-muted);
}

.scalingVal {
  color: var(--text-gold);
  font-weight: 600;
}
</style>
