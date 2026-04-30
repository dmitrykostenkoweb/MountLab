<script setup lang="ts">
import { inject } from 'vue'
import type { ComponentCase, MountLabConfig } from '../core/types.js'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import PreviewArea from './components/PreviewArea.vue'
import RightPanel from './components/RightPanel.vue'
import { useWorkbenchState } from './composables/useWorkbenchState.js'

const cases = inject<ComponentCase[]>('mountlab:cases', [])
const config = inject<MountLabConfig>('mountlab:config', {})

const workbenchState = useWorkbenchState(cases, config)
</script>

<template>
  <div class="ml-workbench">
    <Sidebar
      :cases="cases"
      :selected-id="workbenchState.selectedCaseId.value"
      @select="workbenchState.selectCase"
    />

    <div class="ml-workbench__main">
      <TopBar
        :selected-case="workbenchState.selectedCase.value"
        :selected-variant-id="workbenchState.selectedVariantId.value"
        :selected-wrapper="workbenchState.selectedWrapperKey.value"
        :config="config"
        @update:selected-variant-id="workbenchState.selectVariant"
        @update:selected-wrapper="workbenchState.selectWrapper"
      />

      <PreviewArea
        :selected-case="workbenchState.selectedCase.value"
        :selected-variant="workbenchState.selectedVariant.value"
        :wrapper-component="workbenchState.wrapperComponent.value"
        :current-props="workbenchState.currentProps.value"
        :event-names="workbenchState.selectedCase.value?.events ?? []"
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
