<script setup lang="ts">
interface Column {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: Column[]
  rows: Record<string, unknown>[]
  selectable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
})

const slots = defineSlots<{
  cell(props: { row: Record<string, unknown>; key: string; index: number }): unknown
}>()
</script>

<template>
  <div class="rounded-xl2 overflow-hidden bg-white shadow-softer">
    <table class="w-full">
      <thead>
        <tr class="bg-cream-50">
          <th
            v-if="selectable"
            class="text-xs font-medium text-brown-400 py-3 px-4 text-left w-12"
          >
            <input type="checkbox" class="rounded cursor-pointer" />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            class="text-xs font-medium text-brown-400 py-3 px-4 text-left"
            :style="{ width: col.width }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, idx) in rows"
          :key="idx"
          :class="[
            'border-b border-cream-100 hover:bg-cream-50 transition-colors',
            idx % 2 === 1 ? 'bg-cream-50/40' : '',
          ]"
        >
          <td v-if="selectable" class="py-3 px-4">
            <input type="checkbox" class="rounded cursor-pointer" />
          </td>
          <td
            v-for="col in columns"
            :key="col.key"
            class="py-3 px-4 text-sm text-brown-500"
          >
            <slot
              v-if="slots.cell"
              name="cell"
              :row="row"
              :key="col.key"
              :index="idx"
            >
              {{ row[col.key] }}
            </slot>
            <template v-else>
              {{ row[col.key] }}
            </template>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td
            :colspan="selectable ? columns.length + 1 : columns.length"
            class="py-12 text-center text-brown-300 text-sm"
          >
            暂无数据
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
