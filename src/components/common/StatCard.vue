<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  value: number | string
  icon?: Component
  trend?: string
  level?: 'default' | 'green' | 'orange' | 'red'
}

const props = withDefaults(defineProps<Props>(), {
  level: 'default',
})

const levelBgClass = {
  default: 'bg-white',
  green: 'bg-gradient-to-br from-white to-mint-soft/30',
  orange: 'bg-gradient-to-br from-white to-orange-soft/30',
  red: 'bg-gradient-to-br from-white to-coral-soft/30',
}

const levelBarClass = {
  default: 'bg-cream-200',
  green: 'bg-mint-500',
  orange: 'bg-orange-400',
  red: 'bg-coral-500',
}

const isTrendUp = () => {
  if (!props.trend) return null
  return props.trend.startsWith('+')
}
</script>

<template>
  <div
    :class="[
      'relative rounded-xl2 p-5 shadow-softer transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 overflow-hidden',
      levelBgClass[level],
    ]"
  >
    <div
      :class="['absolute top-0 right-4 w-10 h-1.5 rounded-b-md', levelBarClass[level]]"
    ></div>

    <div class="flex justify-between items-start mb-3">
      <span class="text-xs text-brown-400">{{ title }}</span>
      <component
        v-if="icon"
        :is="icon"
        class="w-5 h-5 text-brown-300"
      />
    </div>

    <div class="flex items-end justify-between">
      <span class="text-2xl font-semibold text-brown-500">{{ value }}</span>
      <span
        v-if="trend"
        :class="[
          'text-sm font-medium',
          isTrendUp() ? 'text-mint-500' : 'text-coral-500',
        ]"
      >
        {{ trend }}
      </span>
    </div>
  </div>
</template>
