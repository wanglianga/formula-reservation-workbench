<script setup lang="ts">
import { Baby } from 'lucide-vue-next'
import RoleTabs from '@/components/common/RoleTabs.vue'
</script>

<template>
  <div class="min-h-screen bg-cream-50">
    <header class="bg-white shadow-softer sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-pink-soft flex items-center justify-center">
            <Baby class="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h1 class="text-lg font-semibold text-brown-500">母婴宝</h1>
            <p class="text-xs text-brown-400">奶粉预约系统</p>
          </div>
        </div>

        <RoleTabs />

        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-medium text-brown-500">李小梅</p>
            <p class="text-xs text-brown-400">工号：EMP2024001</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
            <span class="text-sm font-medium text-pink-500">李</span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-6">
      <router-view />
    </main>
  </div>
</template>
