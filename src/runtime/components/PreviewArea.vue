<script setup lang="ts">
import { computed, onErrorCaptured, ref, watch } from "vue";
import type { Component } from "vue";
import type {
  ComponentCase,
  ComponentVariant,
  Viewport,
} from "../../core/types.js";
import { calculateResizedViewport } from "../viewportResize.js";
import type { ViewportResizeAxis } from "../viewportResize.js";

const props = defineProps<{
  selectedCase: ComponentCase | null;
  selectedVariant: ComponentVariant | null;
  wrapperComponent: Component | null;
  currentProps: Record<string, unknown>;
  eventNames: string[];
  viewport: Viewport | null;
  wrapperWarning: string | null;
}>();

const emit = defineEmits<{
  eventCaptured: [name: string, payload: unknown];
  resizeViewport: [viewport: Viewport];
}>();

const renderError = ref<string | null>(null);
const resizeDrag = ref<{
  axis: ViewportResizeAxis;
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
} | null>(null);

const warningDismissed = ref(false);

watch(
  () => props.wrapperWarning,
  () => {
    warningDismissed.value = false;
  },
);

function eventPayload(args: unknown[]): unknown {
  if (args.length === 0) return undefined;
  if (args.length === 1) return args[0];
  return args;
}

const eventListeners = computed<Record<string, (...args: unknown[]) => void>>(
  () => {
    const listeners: Record<string, (...args: unknown[]) => void> = {};

    for (const eventName of props.eventNames) {
      listeners[eventName] = (...args: unknown[]) => {
        emit("eventCaptured", eventName, eventPayload(args));
      };
    }

    return listeners;
  },
);

const viewportStyle = computed<Record<string, string>>(() => {
  if (!props.viewport) return {};

  return {
    width: `${props.viewport.width}px`,
    height: `${props.viewport.height}px`,
    minWidth: `${props.viewport.width}px`,
    minHeight: `${props.viewport.height}px`,
  };
});

const dimensionLabel = computed(() =>
  props.viewport ? `${props.viewport.width} × ${props.viewport.height}` : null,
);

function startResize(axis: ViewportResizeAxis, event: PointerEvent): void {
  if (!props.viewport) return;

  resizeDrag.value = {
    axis,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: props.viewport.width,
    startHeight: props.viewport.height,
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  event.preventDefault();
}

function moveResize(event: PointerEvent): void {
  const drag = resizeDrag.value;
  if (!drag || event.pointerId !== drag.pointerId) return;

  emit(
    "resizeViewport",
    calculateResizedViewport(drag, event.clientX, event.clientY),
  );
}

function stopResize(event: PointerEvent): void {
  const drag = resizeDrag.value;
  if (!drag || event.pointerId !== drag.pointerId) return;

  resizeDrag.value = null;
}

onErrorCaptured((err) => {
  renderError.value = err instanceof Error ? err.message : String(err);
  return false;
});

watch(
  () => [props.selectedCase?.id, props.selectedVariant?.id],
  () => {
    renderError.value = null;
  },
);
</script>

<template>
  <div class="ml-preview">
    <!-- Dot-grid background -->
    <div class="ml-preview__grid" aria-hidden="true" />

    <!-- Wrapper warning bar -->
    <div
      v-if="wrapperWarning && !warningDismissed"
      class="ml-preview__warning"
      role="status"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        style="flex-shrink: 0"
      >
        <path
          d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        />
        <path d="M12 9v4M12 17h.01" />
      </svg>
      <span class="ml-preview__warning-text">{{ wrapperWarning }}</span>
      <button
        class="ml-preview__warning-dismiss"
        type="button"
        @click="warningDismissed = true"
      >
        dismiss
      </button>
    </div>

    <!-- Canvas -->
    <div class="ml-preview__canvas">
      <!-- Empty state -->
      <div v-if="!selectedCase" class="ml-preview__empty">
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="ml-preview__empty-icon"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p class="ml-preview__empty-title">Select a component</p>
        <p class="ml-preview__empty-hint">
          Pick a case from the sidebar to mount it here.
        </p>
        <div class="ml-preview__empty-kbd">
          <span class="ml-preview__kbd">⌘K</span>
          <span class="ml-preview__empty-kbd-label">to search</span>
        </div>
      </div>

      <!-- Render error -->
      <div v-else-if="renderError" class="ml-preview__error">
        <div class="ml-preview__error-title">Render error</div>
        <pre class="ml-preview__error-message">{{ renderError }}</pre>
      </div>

      <!-- Component surface -->
      <template v-else>
        <div class="ml-preview__frame-wrap">
          <!-- Dimension label -->
          <div v-if="dimensionLabel" class="ml-preview__dim-label">
            {{ dimensionLabel }}
          </div>

          <div class="ml-preview__surface" :style="viewportStyle">
            <component
              :is="wrapperComponent ?? 'div'"
              class="ml-preview__wrapper"
            >
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
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  aria-hidden="true"
                >
                  <path
                    d="M9 1L1 9M9 5L5 9M9 9L9 9"
                    stroke="var(--ml-text-faint)"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ml-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--ml-bg-preview);
  position: relative;
  overflow: hidden;
}

/* Dot grid */
.ml-preview__grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at 1px 1px,
    var(--ml-border-strong) 1px,
    transparent 0
  );
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

/* Warning bar */
.ml-preview__warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--ml-warning-bg);
  color: var(--ml-warning);
  font-size: 11.5px;
  font-family: var(--ml-font-mono);
  border-bottom: 1px solid var(--ml-warning-border);
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.ml-preview__warning-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ml-preview__warning-dismiss {
  font-size: 10px;
  color: var(--ml-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  flex-shrink: 0;
}

/* Canvas */
.ml-preview__canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  position: relative;
  z-index: 1;
  min-height: 0;
  overflow: auto;
}

/* Empty state */
.ml-preview__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--ml-text-muted);
  text-align: center;
}

.ml-preview__empty-icon {
  opacity: 0.45;
}

.ml-preview__empty-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ml-text);
  margin: 4px 0 0;
}

.ml-preview__empty-hint {
  font-size: 12px;
  color: var(--ml-text-muted);
  margin: 0;
}

.ml-preview__empty-kbd {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 10.5px;
  color: var(--ml-text-faint);
  font-family: var(--ml-font-mono);
}

.ml-preview__kbd {
  padding: 2px 6px;
  background: var(--ml-bg-chrome);
  border: 1px solid var(--ml-border);
  border-radius: 3px;
}

.ml-preview__empty-kbd-label {
  font-family: var(--ml-font-sans);
}

/* Error state */
.ml-preview__error {
  padding: 24px;
  max-width: 560px;
}

.ml-preview__error-title {
  color: var(--ml-error);
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 13px;
}

.ml-preview__error-message {
  background: var(--ml-error-bg);
  border: 1px solid var(--ml-error-border);
  border-radius: 6px;
  padding: 12px;
  color: var(--ml-error);
  font-size: 12px;
  font-family: var(--ml-font-mono);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

/* Component frame */
.ml-preview__frame-wrap {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
}

.ml-preview__dim-label {
  font-size: 10px;
  font-family: var(--ml-font-mono);
  color: var(--ml-text-muted);
  letter-spacing: 0.02em;
  margin-bottom: 6px;
}

.ml-preview__surface {
  min-width: 100%;
  min-height: 100%;
  background: #ffffff;
  border: 1px dashed var(--ml-border-strong);
  border-radius: 4px;
  position: relative;
}

.ml-preview__wrapper {
  min-height: 100%;
}

/* Resize handles */
.ml-preview__resize-handle {
  position: absolute;
  z-index: 2;
  background: transparent;
  touch-action: none;
}

.ml-preview__resize-handle:hover {
  background: rgba(66, 184, 131, 0.1);
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
  right: -6px;
  bottom: -6px;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  background: transparent !important;
}
</style>
