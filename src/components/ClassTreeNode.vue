<script setup lang="ts">
import type { ClassDefinition } from '../types';
import ClassCard from './ClassCard.vue';

const props = defineProps<{
  node: ClassDefinition;
  childrenOf: (id: string) => ClassDefinition[];
  expanded: Set<string>;
  basePath?: string;
  depth?: number;
}>();

const emit = defineEmits<{ (e: 'toggle', id: string): void }>();
</script>

<template>
  <div class="treeNode">
    <ClassCard
      :class-data="node"
      :base-path="basePath"
      :child-count="childrenOf(node.id).length"
      :expanded="expanded.has(node.id)"
      @toggle="emit('toggle', node.id)"
    />
    <div v-if="expanded.has(node.id) && childrenOf(node.id).length" class="children">
      <ClassTreeNode
        v-for="child in childrenOf(node.id)"
        :key="child.id"
        :node="child"
        :children-of="childrenOf"
        :expanded="expanded"
        :base-path="basePath"
        :depth="(depth ?? 0) + 1"
        @toggle="(id: string) => emit('toggle', id)"
      />
    </div>
  </div>
</template>

<style scoped>
.treeNode {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.children {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 24px;
  padding-left: 6px;
  border-left: 2px solid var(--border-subtle);
}

@media (max-width: 640px) {
  .children {
    margin-left: 10px;
    padding-left: 4px;
    border-left: 1.5px solid var(--border-subtle);
  }
}
</style>
