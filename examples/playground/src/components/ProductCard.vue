<script setup lang="ts">
const props = withDefaults(defineProps<{
  name?: string
  category?: string
  price?: number
  stock?: number
  selected?: boolean
  featured?: boolean
}>(), {
  name: 'Trail Pack',
  category: 'Equipment',
  price: 129,
  stock: 24,
  selected: false,
  featured: false,
})

const emit = defineEmits<{
  select: [payload: { name: string, selected: boolean }]
  restock: [payload: { name: string, amount: number }]
}>()
</script>

<template>
  <article class="product-card" :class="{ 'product-card--selected': selected }">
    <div class="product-card__media">
      <span v-if="featured" class="product-card__badge">Featured</span>
      <div class="product-card__box">{{ name.slice(0, 2).toUpperCase() }}</div>
    </div>

    <div class="product-card__body">
      <p class="product-card__category">{{ category }}</p>
      <h2>{{ name }}</h2>
      <div class="product-card__meta">
        <strong>${{ price.toFixed(2) }}</strong>
        <span :class="{ 'product-card__stock--low': stock < 10 }">
          {{ stock }} in stock
        </span>
      </div>
      <div class="product-card__actions">
        <button type="button" @click="emit('select', { name, selected: !props.selected })">
          {{ selected ? 'Selected' : 'Select' }}
        </button>
        <button type="button" class="product-card__secondary" @click="emit('restock', { name, amount: 5 })">
          Restock
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  width: min(100%, 420px);
  overflow: hidden;
  border: 1px solid #d7deea;
  border-radius: 8px;
  background: white;
  box-shadow: 0 18px 40px rgb(31 41 55 / 0.1);
}

.product-card--selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15), 0 18px 40px rgb(31 41 55 / 0.1);
}

.product-card__media {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 180px;
  background: linear-gradient(135deg, #e0f2fe, #fef3c7);
}

.product-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  border-radius: 999px;
  padding: 5px 9px;
  background: #111827;
  color: white;
  font-size: 12px;
  font-weight: 800;
}

.product-card__box {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  border-radius: 22px;
  background: white;
  color: #2563eb;
  font-size: 30px;
  font-weight: 900;
  box-shadow: 0 16px 34px rgb(37 99 235 / 0.18);
}

.product-card__body {
  padding: 20px;
}

.product-card__category {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-card h2 {
  margin: 0 0 16px;
  color: #172033;
  font-size: 24px;
  line-height: 1.15;
  letter-spacing: 0;
}

.product-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  color: #475569;
}

.product-card__meta strong {
  color: #111827;
  font-size: 22px;
}

.product-card__stock--low {
  color: #b45309;
  font-weight: 800;
}

.product-card__actions {
  display: flex;
  gap: 10px;
}

.product-card button {
  min-height: 40px;
  flex: 1;
  border: 1px solid #2563eb;
  border-radius: 6px;
  padding: 0 14px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  font-weight: 800;
}

.product-card__secondary {
  border-color: #cbd5e1 !important;
  background: white !important;
  color: #334155 !important;
}
</style>
