<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { ComponentCase, MountLabConfig } from '../core/types.js'
import type { RuntimeCaseEntry } from './caseMetadata.js'
import { deriveFallbackGroup, normalizeCaseEntries, toSidebarCaseEntries } from './caseMetadata.js'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import PreviewArea from './components/PreviewArea.vue'
import RightPanel from './components/RightPanel.vue'
import StatusBar from './components/StatusBar.vue'
import { useWorkbenchState } from './composables/useWorkbenchState.js'

const cases = inject<ComponentCase[]>('mountlab:cases', [])
const caseEntries = inject<RuntimeCaseEntry[]>('mountlab:caseEntries', [])
const config = inject<MountLabConfig>('mountlab:config', {})

const workbenchState = useWorkbenchState(cases, config)

const themeMode = ref<'light' | 'dark'>('light')
function toggleTheme() {
  themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
}

const sidebarEntries = computed(() =>
  toSidebarCaseEntries(normalizeCaseEntries(cases, caseEntries)),
)

const selectedCaseGroup = computed(() => {
  const selectedId = workbenchState.selectedCase.value?.id
  if (!selectedId) return null
  const entry = sidebarEntries.value.find(e => e.case.id === selectedId)
  if (entry) return entry.group
  const rawCase = workbenchState.selectedCase.value
  return rawCase?.group ?? deriveFallbackGroup(null)
})

const variantCount = computed(() =>
  cases.reduce((sum, c) => sum + (c.variants?.length ?? 0), 0),
)
</script>

<template>
  <div class="ml-workbench" :data-theme="themeMode">
    <div class="ml-workbench__body">
      <Sidebar
        :cases="cases"
        :case-entries="caseEntries"
        :selected-id="workbenchState.selectedCaseId.value"
        @select="workbenchState.selectCase"
      />

      <div class="ml-workbench__main">
        <TopBar
          :selected-case="workbenchState.selectedCase.value"
          :selected-variant-id="workbenchState.selectedVariantId.value"
          :selected-wrapper="workbenchState.selectedWrapperKey.value"
          :selected-viewport-key="workbenchState.selectedViewportKey.value"
          :config="config"
          :viewport-options="workbenchState.viewportOptions.value"
          :editable-viewport="workbenchState.editableViewport.value"
          :group="selectedCaseGroup"
          :theme-mode="themeMode"
          @update:selected-variant-id="workbenchState.selectVariant"
          @update:selected-wrapper="workbenchState.selectWrapper"
          @update:selected-viewport="workbenchState.selectViewport"
          @update:custom-viewport="workbenchState.setCustomViewportDimensions"
          @copy-url="workbenchState.copyCurrentUrl"
          @toggle-theme="toggleTheme"
        />

        <PreviewArea
          :selected-case="workbenchState.selectedCase.value"
          :selected-variant="workbenchState.selectedVariant.value"
          :wrapper-component="workbenchState.wrapperComponent.value"
          :current-props="workbenchState.currentProps.value"
          :event-names="workbenchState.selectedCase.value?.events ?? []"
          :viewport="workbenchState.selectedViewport.value"
          :wrapper-warning="workbenchState.wrapperWarning.value"
          @resize-viewport="workbenchState.setCustomViewportDimensions"
          @event-captured="workbenchState.recordEvent"
        />
      </div>

      <RightPanel
        :selected-case="workbenchState.selectedCase.value"
        :selected-variant="workbenchState.selectedVariant.value"
        :props-json-text="workbenchState.propsJsonText.value"
        :props-json-parse-error="workbenchState.propsJsonParseError.value"
        :validation-result="workbenchState.propsValidationResult.value"
        :event-log="workbenchState.eventLog.value"
        @update:props-json-text="workbenchState.updatePropsJsonText"
        @reset-props="workbenchState.resetCurrentProps"
        @copy-props="workbenchState.copyPropsJson"
        @clear-events="workbenchState.clearEventLog"
      />
    </div>

    <StatusBar :case-count="cases.length" :variant-count="variantCount" />
  </div>
</template>

<style>
/* Theme tokens — cascade into all child components */
.ml-workbench {
  --ml-font-sans:
    "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ml-font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;

  /* Light theme (default) */
  --ml-bg-app: #efefe9;
  --ml-bg-chrome: #ffffff;
  --ml-bg-preview: #f8fafc;
  --ml-bg-input: #f6f8f7;
  --ml-bg-hover: #f0f4f2;
  --ml-bg-active: #e6f4ed;
  --ml-border: #e3e7e5;
  --ml-border-strong: #cdd5d1;
  --ml-border-focus: #42b883;
  --ml-text: #35495e;
  --ml-text-strong: #2c3e50;
  --ml-text-muted: #7a8a96;
  --ml-text-faint: #a3afb8;
  --ml-accent: #42b883;
  --ml-accent-deep: #2d8a62;
  --ml-accent-soft: #e6f4ed;
  --ml-success: #42b883;
  --ml-success-bg: #e6f4ed;
  --ml-success-border: rgba(66, 184, 131, 0.3);
  --ml-error: #e1574c;
  --ml-error-bg: #fdecea;
  --ml-error-border: rgba(225, 87, 76, 0.3);
  --ml-warning: #d97e1f;
  --ml-warning-bg: #fdf2e3;
  --ml-warning-border: #f5e0bf;
  --ml-event-chip: #106c8a;
  --ml-event-chip-bg: #e0f2f7;
}

.ml-workbench[data-theme="dark"] {
  --ml-bg-app: #161a1d;
  --ml-bg-chrome: #1e2428;
  --ml-bg-preview: #f8fafc;
  --ml-bg-input: #161a1d;
  --ml-bg-hover: #262d31;
  --ml-bg-active: #1f3a2e;
  --ml-border: #2a3236;
  --ml-border-strong: #3a4348;
  --ml-border-focus: #42b883;
  --ml-text: #dbe2e7;
  --ml-text-strong: #f3f6f7;
  --ml-text-muted: #7d8a93;
  --ml-text-faint: #5a6670;
  --ml-accent: #42b883;
  --ml-accent-deep: #5cd6a0;
  --ml-accent-soft: #1f3a2e;
  --ml-success: #5cd6a0;
  --ml-success-bg: #1f3a2e;
  --ml-success-border: rgba(92, 214, 160, 0.3);
  --ml-error: #ff8a7e;
  --ml-error-bg: #3a1f1c;
  --ml-error-border: rgba(255, 138, 126, 0.3);
  --ml-warning: #f0a85a;
  --ml-warning-bg: #3a2a14;
  --ml-warning-border: #5a4020;
  --ml-event-chip: #7dd3ec;
  --ml-event-chip-bg: #0f2d3a;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
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
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  font-family: var(--ml-font-sans);
  font-size: 13px;
  color: var(--ml-text);
  background: var(--ml-bg-app);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.ml-workbench__body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.ml-workbench__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
</style>
