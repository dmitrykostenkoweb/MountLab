<script setup lang="ts">
import type { ComponentCase, ComponentVariant } from '../../core/types.js'
import type { EventLogEntry, PropsValidationResult } from '../composables/useWorkbenchState.js'

const props = defineProps<{
  selectedCase: ComponentCase | null
  selectedVariant: ComponentVariant | null
  propsJsonText: string
  propsJsonParseError: string | null
  validationResult: PropsValidationResult
  eventLog: EventLogEntry[]
}>()

const emit = defineEmits<{
  'update:propsJsonText': [value: string]
  resetProps: []
  copyProps: []
  clearEvents: []
}>()

function formatPayload(payload: unknown): string {
  if (payload === undefined) return 'undefined'
  if (typeof payload === 'string') return payload

  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}
</script>

<template>
  <aside class="ml-right-panel">
    <section class="ml-right-panel__section">
      <div class="ml-right-panel__section-header">
        <h2 class="ml-right-panel__title">Props JSON</h2>
        <div class="ml-right-panel__actions">
          <button
            class="ml-right-panel__button"
            type="button"
            :disabled="!selectedCase"
            @click="emit('resetProps')"
          >
            Reset
          </button>
          <button
            class="ml-right-panel__button"
            type="button"
            :disabled="!selectedCase"
            @click="emit('copyProps')"
          >
            Copy
          </button>
        </div>
      </div>

      <textarea
        class="ml-right-panel__editor"
        :value="propsJsonText"
        :disabled="!selectedCase"
        spellcheck="false"
        @input="emit('update:propsJsonText', ($event.target as HTMLTextAreaElement).value)"
        @change="emit('update:propsJsonText', ($event.target as HTMLTextAreaElement).value)"
      />

      <p v-if="propsJsonParseError" class="ml-right-panel__message ml-right-panel__message--error">
        {{ propsJsonParseError }}
      </p>
    </section>

    <section class="ml-right-panel__section">
      <h2 class="ml-right-panel__title">Validation</h2>
      <p
        class="ml-right-panel__message"
        :class="{
          'ml-right-panel__message--success': validationResult.status === 'valid',
          'ml-right-panel__message--error': validationResult.status === 'invalid',
        }"
      >
        {{ validationResult.message }}
      </p>

      <ul v-if="validationResult.issues.length > 0" class="ml-right-panel__issues">
        <li
          v-for="(issue, index) in validationResult.issues"
          :key="`${issue.path}:${index}`"
          class="ml-right-panel__issue"
        >
          <span v-if="issue.path" class="ml-right-panel__issue-path">{{ issue.path }}</span>
          <span>{{ issue.message }}</span>
          <span v-if="issue.expected || issue.received" class="ml-right-panel__issue-meta">
            <template v-if="issue.expected">expected {{ issue.expected }}</template>
            <template v-if="issue.expected && issue.received">, </template>
            <template v-if="issue.received">received {{ issue.received }}</template>
          </span>
        </li>
      </ul>
    </section>

    <section class="ml-right-panel__section">
      <div class="ml-right-panel__section-header">
        <h2 class="ml-right-panel__title">Events</h2>
        <button
          class="ml-right-panel__button"
          type="button"
          :disabled="eventLog.length === 0"
          @click="emit('clearEvents')"
        >
          Clear
        </button>
      </div>

      <div v-if="selectedCase?.events?.length" class="ml-right-panel__event-names">
        <span
          v-for="eventName in selectedCase.events"
          :key="eventName"
          class="ml-right-panel__event-name"
        >
          {{ eventName }}
        </span>
      </div>
      <p v-else class="ml-right-panel__muted">No events configured.</p>

      <ol v-if="eventLog.length > 0" class="ml-right-panel__events">
        <li
          v-for="entry in eventLog"
          :key="entry.id"
          class="ml-right-panel__event"
        >
          <div class="ml-right-panel__event-header">
            <span class="ml-right-panel__event-title">{{ entry.name }}</span>
            <time class="ml-right-panel__event-time">{{ entry.timestamp }}</time>
          </div>
          <pre class="ml-right-panel__payload">{{ formatPayload(entry.payload) }}</pre>
        </li>
      </ol>
    </section>

    <section class="ml-right-panel__section">
      <h2 class="ml-right-panel__title">Notes</h2>

      <div v-if="selectedCase?.notes" class="ml-right-panel__note">
        <h3 class="ml-right-panel__subtitle">Case</h3>
        <p>{{ selectedCase.notes }}</p>
      </div>

      <div v-if="selectedVariant?.notes" class="ml-right-panel__note">
        <h3 class="ml-right-panel__subtitle">Variant</h3>
        <p>{{ selectedVariant.notes }}</p>
      </div>

      <p v-if="!selectedCase?.notes && !selectedVariant?.notes" class="ml-right-panel__muted">
        No notes for this selection.
      </p>
    </section>
  </aside>
</template>

<style scoped>
.ml-right-panel {
  width: clamp(280px, 24vw, 380px);
  min-width: 280px;
  height: 100vh;
  overflow-y: auto;
  background: #111827;
  border-left: 1px solid #263244;
  color: #d8dee9;
  font-family: system-ui, sans-serif;
  font-size: 12px;
}

.ml-right-panel__section {
  padding: 14px;
  border-bottom: 1px solid #263244;
}

.ml-right-panel__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.ml-right-panel__title {
  margin: 0 0 10px;
  color: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ml-right-panel__section-header .ml-right-panel__title {
  margin-bottom: 0;
}

.ml-right-panel__subtitle {
  margin: 0 0 4px;
  color: #93c5fd;
  font-size: 11px;
  font-weight: 700;
}

.ml-right-panel__actions {
  display: flex;
  gap: 6px;
}

.ml-right-panel__button {
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 4px 8px;
  background: #172033;
  color: #cbd5e1;
  font-size: 11px;
  cursor: pointer;
}

.ml-right-panel__button:hover:not(:disabled) {
  background: #1e293b;
  color: #f8fafc;
}

.ml-right-panel__button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.ml-right-panel__editor {
  display: block;
  width: 100%;
  min-height: 190px;
  resize: vertical;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px;
  background: #0b1020;
  color: #e5e7eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
  tab-size: 2;
}

.ml-right-panel__editor:disabled {
  opacity: 0.55;
}

.ml-right-panel__message,
.ml-right-panel__muted {
  margin: 8px 0 0;
  color: #94a3b8;
  line-height: 1.45;
}

.ml-right-panel__message--success {
  color: #86efac;
}

.ml-right-panel__message--error {
  color: #fca5a5;
}

.ml-right-panel__issues {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.ml-right-panel__issue {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px;
  border: 1px solid #7f1d1d;
  border-radius: 6px;
  background: #2a1117;
  color: #fecaca;
}

.ml-right-panel__issue-path,
.ml-right-panel__issue-meta {
  color: #fda4af;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
}

.ml-right-panel__event-names {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ml-right-panel__event-name {
  max-width: 100%;
  overflow-wrap: anywhere;
  border: 1px solid #315b74;
  border-radius: 4px;
  padding: 3px 6px;
  background: #0f2533;
  color: #bae6fd;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
}

.ml-right-panel__events {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.ml-right-panel__event {
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0b1020;
}

.ml-right-panel__event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 8px;
  border-bottom: 1px solid #1e293b;
}

.ml-right-panel__event-title {
  overflow-wrap: anywhere;
  color: #f8fafc;
  font-weight: 600;
}

.ml-right-panel__event-time {
  flex-shrink: 0;
  color: #64748b;
  font-size: 11px;
}

.ml-right-panel__payload {
  max-height: 160px;
  margin: 0;
  overflow: auto;
  padding: 8px;
  color: #cbd5e1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.ml-right-panel__note {
  margin-top: 10px;
}

.ml-right-panel__note p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
