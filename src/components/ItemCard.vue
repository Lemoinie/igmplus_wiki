<script setup lang="ts">
import EquipmentCard from './EquipmentCard.vue';
import type { EquipmentDefinition } from '../types';

defineProps<{
  item: EquipmentDefinition;
  basePath?: string;
}>();
</script>

<template>
  <EquipmentCard :item="item" :basePath="basePath" />
</template>
