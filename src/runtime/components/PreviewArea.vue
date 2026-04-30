<script setup lang="ts">
import { computed, onErrorCaptured, ref, watch } from 'vue'
import type { Component } from 'vue'
import type { ComponentCase, ComponentVariant } from '../../core/types.js'

const props = defineProps<{
  selectedCase: ComponentCase | null
  selectedVariant: ComponentVariant | null
  wrapperComponent: Component | null
  currentProps: Record<string, unknown>
  eventNames: string[]
}>()

const emit = defineEmits<{
  eventCaptured: [name: string, payload: unknown]
}>()

const renderError = ref<string | null>(null)

function eventPayload(args: unknown[]): unknown {
  if (args.length === 0) return undefined
  if (args.length === 1) return args[0]
  return args
}

const eventListeners = computed<Record<string, (...args: unknown[]) => void>>(() => {
  const listeners: Record<string, (...args: unknown[]) => void> = {}

  for (const eventName of props.eventNames) {
    listeners[eventName] = (...args: unknown[]) => {
      emit('eventCaptured', eventName, eventPayload(args))
    }
  }

  return listeners
})

onErrorCaptured((err) => {
  renderError.value = err instanceof Error ? err.message : String(err)
  return false
})

watch(
  () => [props.selectedCase?.id, props.selectedVariant?.id],
  () => { renderError.value = null },
)
</script>

<template>
  <div class="ml-preview">
    <div v-if="!selectedCase" class="ml-preview__empty">
      Select a component from the sidebar
    </div>

    <div v-else-if="renderError" class="ml-preview__error">
      <div class="ml-preview__error-title">Render error</div>
      <pre class="ml-preview__error-message">{{ renderError }}</pre>
    </div>

    <template v-else>
      <component :is="wrapperComponent ?? 'div'" class="ml-preview__wrapper">
        <component
          :is="selectedCase.component"
          v-bind="currentProps"
          v-on="eventListeners"
        />
      </component>
    </template>
  </div>
</template>

<style scoped>
.ml-preview {
  flex: 1;
  overflow: auto;
  background: #f8fafc;
  min-height: 0;
}

.ml-preview__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-family: system-ui, sans-serif;
  font-size: 14px;
}

.ml-preview__error {
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.ml-preview__error-title {
  color: #ef4444;
  font-weight: 600;
  margin-bottom: 8px;
}

.ml-preview__error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
  color: #dc2626;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.ml-preview__wrapper {
  min-height: 100%;
}
</style>
