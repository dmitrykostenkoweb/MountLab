<script setup lang="ts">
import { computed } from "vue";
import type {
  ComponentCase,
  MountLabConfig,
  Viewport,
} from "../../core/types.js";
import type { ViewportOption } from "../composables/useWorkbenchState.js";

const props = defineProps<{
  selectedCase: ComponentCase | null;
  selectedVariantId: string | null;
  selectedWrapper: string | null;
  selectedViewportKey: string | null;
  config: MountLabConfig;
  viewportOptions: ViewportOption[];
  editableViewport: Viewport;
  group: string | null;
  themeMode: "light" | "dark";
}>();

const emit = defineEmits<{
  "update:selectedVariantId": [id: string];
  "update:selectedWrapper": [key: string];
  "update:selectedViewport": [key: string];
  "update:customViewport": [viewport: Partial<Viewport>];
  copyUrl: [];
  toggleTheme: [];
}>();

const selectedVariantTitle = computed(() => {
  if (!props.selectedCase) return null;
  const variant = props.selectedCase.variants.find(
    (v) => v.id === props.selectedVariantId,
  );
  return variant?.title ?? variant?.id ?? null;
});

function emitDimensionUpdate(
  dimension: "width" | "height",
  event: Event,
): void {
  const value = (event.target as HTMLInputElement).value;
  emit("update:customViewport", { [dimension]: value });
}
</script>

<template>
  <header class="ml-topbar">
    <!-- Breadcrumb title -->
    <div class="ml-topbar__title-area">
      <template v-if="selectedCase">
        <span class="ml-topbar__group">{{ group ?? "Components" }}</span>
        <span class="ml-topbar__breadcrumb-sep">/</span>
        <span class="ml-topbar__title">{{
          selectedCase.title ?? selectedCase.id
        }}</span>
        <span v-if="selectedVariantTitle" class="ml-topbar__variant-badge">{{
          selectedVariantTitle
        }}</span>
      </template>
      <span v-else class="ml-topbar__title ml-topbar__title--empty"
        >No component selected</span
      >
    </div>

    <!-- Right-side controls -->
    <div v-if="selectedCase" class="ml-topbar__controls">
      <!-- Variant select -->
      <label class="ml-topbar__label">
        <span class="ml-topbar__label-text">Variant</span>
        <div class="ml-topbar__select-wrap">
          <select
            class="ml-topbar__select"
            :value="selectedVariantId ?? ''"
            @change="
              emit(
                'update:selectedVariantId',
                ($event.target as HTMLSelectElement).value,
              )
            "
          >
            <option
              v-for="v in selectedCase.variants"
              :key="v.id"
              :value="v.id"
            >
              {{ v.title ?? v.id }}
            </option>
          </select>
          <svg
            class="ml-topbar__select-chevron"
            width="9"
            height="9"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path
              d="M2 4.5L6 8.5L10 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </label>

      <!-- Wrapper select -->
      <label
        v-if="config.wrappers && Object.keys(config.wrappers).length > 0"
        class="ml-topbar__label"
      >
        <span class="ml-topbar__label-text">Wrapper</span>
        <div class="ml-topbar__select-wrap">
          <select
            class="ml-topbar__select"
            :value="selectedWrapper ?? ''"
            @change="
              emit(
                'update:selectedWrapper',
                ($event.target as HTMLSelectElement).value,
              )
            "
          >
            <option
              v-for="key in Object.keys(config.wrappers ?? {})"
              :key="key"
              :value="key"
            >
              {{ key }}
            </option>
          </select>
          <svg
            class="ml-topbar__select-chevron"
            width="9"
            height="9"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path
              d="M2 4.5L6 8.5L10 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </label>

      <!-- Viewport select -->
      <label v-if="viewportOptions.length > 0" class="ml-topbar__label">
        <span class="ml-topbar__label-text">Viewport</span>
        <div class="ml-topbar__select-wrap">
          <select
            class="ml-topbar__select"
            :value="selectedViewportKey ?? ''"
            @change="
              emit(
                'update:selectedViewport',
                ($event.target as HTMLSelectElement).value,
              )
            "
          >
            <option
              v-for="option in viewportOptions"
              :key="option.key"
              :value="option.key"
            >
              {{ option.title }}
              <template v-if="option.viewport">
                ({{ option.viewport.width }}×{{
                  option.viewport.height
                }})</template
              >
            </option>
          </select>
          <svg
            class="ml-topbar__select-chevron"
            width="9"
            height="9"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path
              d="M2 4.5L6 8.5L10 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </label>

      <!-- Dimensions -->
      <div v-if="viewportOptions.length > 0" class="ml-topbar__dims">
        <div class="ml-topbar__dim-input-wrap">
          <input
            class="ml-topbar__dim-input"
            type="number"
            min="100"
            max="7680"
            step="1"
            :value="editableViewport.width"
            @change="emitDimensionUpdate('width', $event)"
          />
          <span class="ml-topbar__dim-suffix">W</span>
        </div>
        <span class="ml-topbar__dim-sep">×</span>
        <div class="ml-topbar__dim-input-wrap">
          <input
            class="ml-topbar__dim-input"
            type="number"
            min="100"
            max="4320"
            step="1"
            :value="editableViewport.height"
            @change="emitDimensionUpdate('height', $event)"
          />
          <span class="ml-topbar__dim-suffix">H</span>
        </div>
      </div>
    </div>

    <div class="ml-topbar__actions">
      <div class="ml-topbar__divider" />

      <!-- Dark/light toggle -->
      <button
        class="ml-topbar__icon-btn"
        type="button"
        :title="
          themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
        "
        @click="emit('toggleTheme')"
      >
        <!-- Moon icon for light mode (click to go dark) -->
        <svg
          v-if="themeMode === 'light'"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <!-- Sun icon for dark mode (click to go light) -->
        <svg
          v-else
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
      </button>

      <!-- Copy URL -->
      <button
        class="ml-topbar__copy-btn"
        type="button"
        @click="emit('copyUrl')"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copy URL
      </button>
    </div>
  </header>
</template>

<style scoped>
.ml-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 48px;
  flex: 0 0 48px;
  background: var(--ml-bg-chrome);
  border-bottom: 1px solid var(--ml-border);
  font-size: 13px;
  overflow: hidden;
}

/* ── Title area ── */

.ml-topbar__title-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: auto;
  min-width: 0;
  overflow: hidden;
}

.ml-topbar__group {
  font-size: 11px;
  color: var(--ml-text-muted);
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.ml-topbar__breadcrumb-sep {
  color: var(--ml-text-faint);
  font-size: 11px;
}

.ml-topbar__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ml-accent);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ml-topbar__title--empty {
  color: var(--ml-text-muted);
  font-size: 13px;
}

.ml-topbar__variant-badge {
  font-size: 10px;
  font-family: var(--ml-font-mono);
  color: var(--ml-text-muted);
  padding: 2px 6px;
  background: var(--ml-bg-input);
  border: 1px solid var(--ml-border);
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Controls ── */

.ml-topbar__controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.ml-topbar__label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ml-topbar__label-text {
  font-size: 11px;
  color: var(--ml-text-muted);
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.ml-topbar__select-wrap {
  position: relative;
  display: flex;
  align-items: center;
  height: 26px;
  min-width: 110px;
  background: var(--ml-bg-input);
  border: 1px solid var(--ml-border);
  border-radius: 5px;
}

.ml-topbar__select {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0 24px 0 8px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  color: var(--ml-text);
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ml-topbar__select-chevron {
  position: absolute;
  right: 7px;
  color: var(--ml-text-muted);
  pointer-events: none;
  flex-shrink: 0;
}

/* Dimension inputs */

.ml-topbar__dims {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ml-topbar__dim-input-wrap {
  position: relative;
  width: 70px;
  height: 26px;
  background: var(--ml-bg-input);
  border: 1px solid var(--ml-border);
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.ml-topbar__dim-input {
  width: 100%;
  height: 100%;
  padding: 0 22px 0 8px;
  font-size: 12px;
  font-family: var(--ml-font-mono);
  color: var(--ml-text);
  background: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.ml-topbar__dim-input::-webkit-inner-spin-button,
.ml-topbar__dim-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.ml-topbar__dim-input[type="number"] {
  -moz-appearance: textfield;
}

.ml-topbar__dim-suffix {
  position: absolute;
  right: 6px;
  font-size: 10px;
  color: var(--ml-text-faint);
  font-family: var(--ml-font-sans);
  pointer-events: none;
}

.ml-topbar__dim-sep {
  color: var(--ml-text-faint);
  font-size: 11px;
}

/* ── Right actions ── */

.ml-topbar__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ml-topbar__divider {
  width: 1px;
  height: 22px;
  background: var(--ml-border);
  margin: 0 2px;
}

.ml-topbar__icon-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--ml-border);
  border-radius: 5px;
  color: var(--ml-text-muted);
  cursor: pointer;
  padding: 0;
  transition:
    background 0.1s,
    color 0.1s;
}

.ml-topbar__icon-btn:hover {
  background: var(--ml-bg-hover);
  color: var(--ml-text);
}

.ml-topbar__copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  background: var(--ml-accent);
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.1s;
}

.ml-topbar__copy-btn:hover {
  opacity: 0.88;
}
</style>
