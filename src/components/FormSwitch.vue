<script setup lang="ts">
import { isMobile } from '@/utils/system.ts'

const emit = defineEmits(['save'])

const props = defineProps<{
  value: boolean
  name: string
  label: string
  tooltip: string
}>()

// console.log(`FormSwitch.vue: ${props.name}: props.value:`, props.value)

function onChange(event: Event) {
  console.log('onChange:', event)
  const target = event.target as HTMLInputElement
  console.log('target:', target)
  emit('save', event)
}
</script>

<template>
  <div class="form-check form-switch">
    <input :checked="value" :id="name" @change="onChange" class="form-check-input" type="checkbox" role="switch" />
    <label class="form-check-label" :for="name">{{ label }}</label>
    <i v-if="!isMobile" class="fa-solid fa-circle-info ms-2" data-bs-toggle="tooltip" :data-bs-title="tooltip" v-bs></i>
  </div>
</template>
