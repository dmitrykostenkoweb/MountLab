<script setup lang="ts">
import { computed, onErrorCaptured, ref, watch } from 'vue'
import type { Component } from 'vue'
import type { ComponentCase, ComponentVariant, Viewport } from '../../core/types.js'
import { calculateResizedViewport } from '../viewportResize.js'
import type { ViewportResizeAxis } from '../viewportResize.js'

const props = defineProps<{
  selectedCase: ComponentCase | null
  selectedVariant: ComponentVariant | null
  wrapperComponent: Component | null
  currentProps: Record<string, unknown>
  eventNames: string[]
  viewport: Viewport | null
}>()

const emit = defineEmits<{
  eventCaptured: [name: string, payload: unknown]
  resizeViewport: [viewport: Viewport]
}>()

const renderError = ref<string | null>(null)
const resizeDrag = ref<{
  axis: ViewportResizeAxis
  pointerId: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
} | null>(null)

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

const viewportStyle = computed<Record<string, string>>(() => {
  if (!props.viewport) return {}

  return {
    width: `${props.viewport.width}px`,
    height: `${props.viewport.height}px`,
    minWidth: `${props.viewport.width}px`,
    minHeight: `${props.viewport.height}px`,
  }
})

function startResize(
  axis: ViewportResizeAxis,
  event: PointerEvent,
): void {
  if (!props.viewport) return

  resizeDrag.value = {
    axis,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: props.viewport.width,
    startHeight: props.viewport.height,
  }

  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  event.preventDefault()
}

function moveResize(event: PointerEvent): void {
  const drag = resizeDrag.value
  if (!drag || event.pointerId !== drag.pointerId) return

  emit('resizeViewport', calculateResizedViewport(drag, event.clientX, event.clientY))
}

function stopResize(event: PointerEvent): void {
  const drag = resizeDrag.value
  if (!drag || event.pointerId !== drag.pointerId) return

  resizeDrag.value = null
}

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
      <div class="ml-preview__surface" :style="viewportStyle">
        <component :is="wrapperComponent ?? 'div'" class="ml-preview__wrapper">
          <component
            :is="selectedCase.component"
            v-bind="currentProps"
            v-on="eventListeners"
          />
        </component>

        <template v-if="viewport">
          <div
            class="ml-preview__resize-handle ml-preview__resize-handle--right"
            data-testid="viewport-resize-right"
            @pointerdown="startResize('width', $event)"
            @pointermove="moveResize"
            @pointerup="stopResize"
            @pointercancel="stopResize"
          />
          <div
            class="ml-preview__resize-handle ml-preview__resize-handle--bottom"
            data-testid="viewport-resize-bottom"
            @pointerdown="startResize('height', $event)"
            @pointermove="moveResize"
            @pointerup="stopResize"
            @pointercancel="stopResize"
          />
          <div
            class="ml-preview__resize-handle ml-preview__resize-handle--corner"
            data-testid="viewport-resize-corner"
            @pointerdown="startResize('both', $event)"
            @pointermove="moveResize"
            @pointerup="stopResize"
            @pointercancel="stopResize"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ml-preview {
  flex: 1;
  overflow: auto;
  background: #f8fafc;
  min-height: 0;
  padding: 0;
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

.ml-preview__surface {
  min-width: 100%;
  min-height: 100%;
  background: #f8fafc;
  position: relative;
}

.ml-preview__wrapper {
  min-height: 100%;
}

.ml-preview__resize-handle {
  position: absolute;
  z-index: 2;
  background: transparent;
  touch-action: none;
}

.ml-preview__resize-handle:hover {
  background: rgba(15, 23, 42, 0.08);
}

.ml-preview__resize-handle--right {
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: ew-resize;
}

.ml-preview__resize-handle--bottom {
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 8px;
  cursor: ns-resize;
}

.ml-preview__resize-handle--corner {
  right: -5px;
  bottom: -5px;
  width: 12px;
  height: 12px;
  border: 1px solid rgba(15, 23, 42, 0.28);
  border-radius: 3px;
  background: rgba(248, 250, 252, 0.92);
  cursor: nwse-resize;
}

.ml-preview__resize-handle--corner:hover {
  background: #e2e8f0;
}
</style>
