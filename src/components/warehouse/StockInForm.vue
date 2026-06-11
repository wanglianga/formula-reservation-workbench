<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'

const inventoryStore = useInventoryStore()

const skuId = ref('')
const quantity = ref<number | null>(null)
const productionDate = ref('')
const expiryDate = ref('')
const supplier = ref('')

const batchNo = computed(() => {
  const timestamp = Date.now().toString().slice(-6)
  return `B${timestamp}`
})

const errors = ref<Record<string, string>>({})

const validate = (): boolean => {
  errors.value = {}
  if (!skuId.value) errors.value.skuId = '请选择商品SKU'
  if (!quantity.value || quantity.value < 1) errors.value.quantity = '数量必须大于等于1'
  if (!productionDate.value) errors.value.productionDate = '请选择生产日期'
  if (!expiryDate.value) errors.value.expiryDate = '请选择过期日期'
  if (!supplier.value.trim()) errors.value.supplier = '请填写供应商'
  if (productionDate.value && expiryDate.value && new Date(expiryDate.value) <= new Date(productionDate.value)) {
    errors.value.expiryDate = '过期日期必须晚于生产日期'
  }
  return Object.keys(errors.value).length === 0
}

const resetForm = () => {
  skuId.value = ''
  quantity.value = null
  productionDate.value = ''
  expiryDate.value = ''
  supplier.value = ''
  errors.value = {}
}

const showToast = ref(false)
const toastMessage = ref('')

const handleSubmit = () => {
  if (!validate()) return
  inventoryStore.addStockIn({
    skuId: skuId.value,
    quantity: quantity.value || 0,
    productionDate: productionDate.value,
    expiryDate: expiryDate.value,
    receivedDate: new Date().toISOString().slice(0, 10),
    supplier: supplier.value.trim(),
  })
  toastMessage.value = '入库登记成功'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
  resetForm()
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="showToast" class="fixed top-4 right-4 z-50 bg-mint-500 text-white px-4 py-2 rounded-xl shadow-soft">
      {{ toastMessage }}
    </div>
    <div>
      <label class="block text-sm text-brown-400 mb-1.5">商品SKU</label>
      <select
        v-model="skuId"
        class="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
      >
        <option value="" disabled>请选择商品</option>
        <option v-for="sku in inventoryStore.skus" :key="sku.id" :value="sku.id">
          {{ sku.brand }} {{ sku.stage }}
        </option>
      </select>
      <p v-if="errors.skuId" class="text-xs text-coral-500 mt-1">{{ errors.skuId }}</p>
    </div>
    <div>
      <label class="block text-sm text-brown-400 mb-1.5">批次号</label>
      <input
        type="text"
        :value="batchNo"
        readonly
        class="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-brown-400 cursor-not-allowed"
      />
    </div>
    <div>
      <label class="block text-sm text-brown-400 mb-1.5">数量（罐）</label>
      <input
        v-model.number="quantity"
        type="number"
        min="1"
        placeholder="请输入入库数量"
        class="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
      />
      <p v-if="errors.quantity" class="text-xs text-coral-500 mt-1">{{ errors.quantity }}</p>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-brown-400 mb-1.5">生产日期</label>
        <input
          v-model="productionDate"
          type="date"
          class="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
        />
        <p v-if="errors.productionDate" class="text-xs text-coral-500 mt-1">{{ errors.productionDate }}</p>
      </div>
      <div>
        <label class="block text-sm text-brown-400 mb-1.5">过期日期</label>
        <input
          v-model="expiryDate"
          type="date"
          class="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
        />
        <p v-if="errors.expiryDate" class="text-xs text-coral-500 mt-1">{{ errors.expiryDate }}</p>
      </div>
    </div>
    <div>
      <label class="block text-sm text-brown-400 mb-1.5">供应商</label>
      <input
        v-model="supplier"
        type="text"
        placeholder="请输入供应商名称"
        class="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-brown-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
      />
      <p v-if="errors.supplier" class="text-xs text-coral-500 mt-1">{{ errors.supplier }}</p>
    </div>
    <button class="btn-primary w-full" @click="handleSubmit">
      入库登记
    </button>
  </div>
</template>
