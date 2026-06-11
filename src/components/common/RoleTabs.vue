<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { path: '/staff', label: '店员工作台' },
  { path: '/warehouse', label: '仓管工作台' },
  { path: '/supervisor', label: '督导工作台' },
]

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const handleClick = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="flex gap-2">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      :class="[
        'px-4 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer',
        isActive(tab.path)
          ? 'bg-pink-400 text-white'
          : 'bg-cream-100 text-brown-400 hover:bg-cream-200',
      ]"
      @click="handleClick(tab.path)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
