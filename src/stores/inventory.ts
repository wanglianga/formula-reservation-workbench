import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MilkSku, Batch, StockOut, StockOutStatus } from '@/types'
import { seedSkus, seedBatches, seedStockOuts } from '@/data/seed'

export const useInventoryStore = defineStore('inventory', () => {
  const skus = ref<MilkSku[]>([...seedSkus])
  const batches = ref<Batch[]>([...seedBatches])
  const stockOuts = ref<StockOut[]>([...seedStockOuts])

  function getStockBySku(skuId: string): number {
    return batches.value
      .filter(b => b.skuId === skuId)
      .reduce((sum, b) => sum + b.quantity, 0)
  }

  function getBatchesBySku(skuId: string): Batch[] {
    return batches.value
      .filter(b => b.skuId === skuId)
      .sort((a, b) => new Date(a.productionDate).getTime() - new Date(b.productionDate).getTime())
  }

  function getNearestExpiry(skuId: string): Batch | null {
    const skuBatches = batches.value.filter(b => b.skuId === skuId && b.quantity > 0)
    if (skuBatches.length === 0) return null
    return skuBatches.reduce((nearest, b) =>
      new Date(b.expiryDate).getTime() < new Date(nearest.expiryDate).getTime() ? b : nearest
    )
  }

  function addStockIn(batchData: Partial<Batch>): Batch {
    const id = `batch-${Date.now()}`
    const brandPrefix = batchData.skuId
      ? skus.value.find(s => s.id === batchData.skuId)?.brand.charAt(0) || 'X'
      : 'X'
    const batchNo = `${brandPrefix}${new Date().toISOString().slice(0, 7).replace(/-/g, '')}${String(batches.value.length + 1).padStart(3, '0')}`
    const newBatch: Batch = {
      id,
      skuId: batchData.skuId || '',
      batchNo,
      quantity: batchData.quantity || 0,
      productionDate: batchData.productionDate || new Date().toISOString().slice(0, 10),
      expiryDate: batchData.expiryDate || '',
      receivedDate: batchData.receivedDate || new Date().toISOString().slice(0, 10),
      supplier: batchData.supplier || '',
    }
    batches.value.push(newBatch)
    return newBatch
  }

  function deductStock(skuId: string, cans: number): { success: boolean; deducted: number } {
    const stock = getStockBySku(skuId)
    if (stock < cans) {
      return { success: false, deducted: 0 }
    }
    let remaining = cans
    const sortedBatches = [...batches.value]
      .filter(b => b.skuId === skuId && b.quantity > 0)
      .sort((a, b) => new Date(a.productionDate).getTime() - new Date(b.productionDate).getTime())

    for (const batch of sortedBatches) {
      if (remaining <= 0) break
      const deduct = Math.min(batch.quantity, remaining)
      const batchIndex = batches.value.findIndex(b => b.id === batch.id)
      if (batchIndex !== -1) {
        batches.value[batchIndex].quantity -= deduct
      }
      remaining -= deduct
    }
    return { success: true, deducted: cans - remaining }
  }

  function registerStockOut(data: Omit<StockOut, 'id' | 'reportDate' | 'status'> & { status?: StockOutStatus }): StockOut {
    const newStockOut: StockOut = {
      id: `so-${Date.now()}`,
      skuId: data.skuId,
      quantity: data.quantity,
      reportDate: new Date().toISOString().slice(0, 10),
      expectedArrival: data.expectedArrival,
      status: data.status || 'pending',
      note: data.note,
    }
    stockOuts.value.push(newStockOut)
    return newStockOut
  }

  function resolveStockOut(id: string): boolean {
    const index = stockOuts.value.findIndex(so => so.id === id)
    if (index === -1) return false
    stockOuts.value[index].status = 'resolved'
    return true
  }

  return {
    skus,
    batches,
    stockOuts,
    getStockBySku,
    getBatchesBySku,
    getNearestExpiry,
    addStockIn,
    deductStock,
    registerStockOut,
    resolveStockOut,
  }
})
