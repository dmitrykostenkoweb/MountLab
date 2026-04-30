<script setup lang="ts">
import type { ComponentCase, MountLabConfig } from '../../core/types.js'

const props = defineProps<{
  selectedCase: ComponentCase | null
  selectedVariantId: string | null
  selectedWrapper: string | null
  wrapperWarning: string | null
  config: MountLabConfig
}>()

const emit = defineEmits<{
  'update:selectedVariantId': [id: string]
  'update:selectedWrapper': [key: string]
}>()
</script>

<template>
  <header class="ml-topbar">
    <span class="ml-topbar__title">
      {{ selectedCase?.title ?? selectedCase?.id ?? 'No component selected' }}
    </span>

    <div class="ml-topbar__controls" v-if="selectedCase">
      <label class="ml-topbar__label">
        Variant
        <select
          class="ml-topbar__select"
          :value="selectedVariantId ?? ''"
          @change="emit('update:selectedVariantId', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="v in selectedCase.variants"
            :key="v.id"
            :value="v.id"
          >{{ v.title ?? v.id }}</option>
        </select>
      </label>

      <label class="ml-topbar__label" v-if="config.wrappers && Object.keys(config.wrappers).length > 0">
        Wrapper
        <select
          class="ml-topbar__select"
          :value="selectedWrapper ?? ''"
          @change="emit('update:selectedWrapper', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="key in Object.keys(config.wrappers ?? {})"
            :key="key"
            :value="key"
          >{{ key }}</option>
        </select>
      </label>
    </div>

    <div
      v-if="wrapperWarning"
      class="ml-topbar__warning"
      role="status"
    >
      {{ wrapperWarning }}
    </div>
  </header>
</template>

<style scoped>
.ml-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  height: 48px;
  background: #0f0f1a;
  border-bottom: 1px solid #2d2d4e;
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: #e2e8f0;
  flex-shrink: 0;
}

.ml-topbar__title {
  font-weight: 600;
  color: #a78bfa;
  margin-right: auto;
}

.ml-topbar__controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ml-topbar__warning {
  max-width: min(520px, 40vw);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #fbbf24;
  background: #2d220b;
  border: 1px solid #70540f;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.ml-topbar__label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
}

.ml-topbar__select {
  background: #1a1a2e;
  border: 1px solid #2d2d4e;
  color: #e2e8f0;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
}
</style>
