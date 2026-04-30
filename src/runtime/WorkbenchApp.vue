<script setup lang="ts">
import { computed, inject, ref, shallowRef } from 'vue'
import type { Component } from 'vue'
import type { ComponentCase, ComponentVariant, MountLabConfig } from '../core/types.js'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import PreviewArea from './components/PreviewArea.vue'

const cases = inject<ComponentCase[]>('mountlab:cases', [])
const config = inject<MountLabConfig>('mountlab:config', {})

const selectedCaseId = ref<string | null>(cases[0]?.id ?? null)
const selectedVariantId = ref<string | null>(null)
const selectedWrapperKey = ref<string | null>(null)

const selectedCase = computed(() =>
  cases.find(c => c.id === selectedCaseId.value) ?? null,
)

const activeVariantId = computed(() =>
  selectedVariantId.value ?? selectedCase.value?.variants[0]?.id ?? null,
)

const selectedVariant = computed<ComponentVariant | null>(() =>
  selectedCase.value?.variants.find(v => v.id === activeVariantId.value) ?? null,
)

const activeWrapperKey = computed(() =>
  selectedWrapperKey.value
  ?? selectedCase.value?.wrapper
  ?? config.defaultWrapper
  ?? null,
)

const wrapperComponent = computed<Component | null>(() => {
  if (!activeWrapperKey.value || !config.wrappers) return null
  return config.wrappers[activeWrapperKey.value] ?? null
})

function selectCase(id: string) {
  selectedCaseId.value = id
  selectedVariantId.value = null
  selectedWrapperKey.value = null
}
</script>

<template>
  <div class="ml-workbench">
    <Sidebar
      :cases="cases"
      :selected-id="selectedCaseId"
      @select="selectCase"
    />

    <div class="ml-workbench__main">
      <TopBar
        :selected-case="selectedCase"
        :selected-variant-id="activeVariantId"
        :selected-wrapper="activeWrapperKey"
        :config="config"
        @update:selected-variant-id="selectedVariantId = $event"
        @update:selected-wrapper="selectedWrapperKey = $event"
      />

      <PreviewArea
        :selected-case="selectedCase"
        :selected-variant="selectedVariant"
        :wrapper-component="wrapperComponent"
      />
    </div>
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#mountlab {
  height: 100%;
}
</style>

<style scoped>
.ml-workbench {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: system-ui, sans-serif;
}

.ml-workbench__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #0f0f1a;
}
</style>
