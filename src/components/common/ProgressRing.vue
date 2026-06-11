<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 80,
  strokeWidth: 8,
  color: '#4CAF6B',
  bgColor: '#FDEFD8',
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(
  () => circumference.value * (1 - Math.max(0, Math.min(100, props.percent)) / 100)
)
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="transform -rotate-90"
    >
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="bgColor"
        :stroke-width="strokeWidth"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        class="transition-all duration-500 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center">
      <span
        :class="[
          'font-semibold text-brown-500',
          size >= 80 ? 'text-lg' : 'text-sm',
        ]"
      >
        {{ Math.round(percent) }}%
      </span>
    </div>
  </div>
</template>
