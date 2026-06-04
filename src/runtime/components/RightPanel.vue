<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ComponentCase, ComponentVariant } from '../../core/types.js'
import type {
  EventLogEntry,
  PropEditorField,
  PropFieldEdit,
} from '../composables/useWorkbenchState.js'

type TabId = 'props' | 'events' | 'notes'

const props = defineProps<{
  selectedCase: ComponentCase | null
  selectedVariant: ComponentVariant | null
  propFields: PropEditorField[]
  eventLog: EventLogEntry[]
}>()

const emit = defineEmits<{
  'update:propField': [key: string, edit: PropFieldEdit]
  resetProps: []
  copyProps: []
  clearEvents: []
}>()

const activeTab = ref<TabId>('props')

const eventsBadge = computed(() =>
  props.eventLog.length > 0 ? props.eventLog.length : null,
)

function updateStringField(field: PropEditorField, value: string): void {
  emit('update:propField', field.key, { kind: 'string', value })
}

function updateNumberField(field: PropEditorField, value: string): void {
  emit('update:propField', field.key, { kind: 'number', value })
}

function updateBooleanField(field: PropEditorField, value: boolean): void {
  emit('update:propField', field.key, { kind: 'boolean', value })
}

function updateJsonField(field: PropEditorField, value: string): void {
  emit('update:propField', field.key, { kind: 'json', value })
}

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
  <aside class="ml-panel">
    <!-- Tab bar -->
    <div class="ml-panel__tabs" role="tablist">
      <button
        v-for="tab in [
          { id: 'props', label: 'Props' },
          { id: 'events', label: 'Events', badge: eventsBadge },
          { id: 'notes', label: 'Notes' },
        ] as { id: TabId; label: string; badge?: string | number | null }[]"
        :key="tab.id"
        class="ml-panel__tab"
        :class="{ 'ml-panel__tab--active': activeTab === tab.id }"
        role="tab"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span
          v-if="tab.badge != null"
          class="ml-panel__tab-badge"
          :class="{ 'ml-panel__tab-badge--active': activeTab === tab.id }"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <div class="ml-panel__body">
      <!-- Props tab -->
      <div
        v-show="activeTab === 'props'"
        class="ml-panel__section"
        role="tabpanel"
      >
        <div class="ml-panel__section-header">
          <h2 class="ml-panel__title">Props</h2>
          <div class="ml-panel__actions">
            <button
              class="ml-panel__btn"
              type="button"
              :disabled="!selectedCase"
              @click="emit('resetProps')"
            >
              Reset
            </button>
            <button
              class="ml-panel__btn"
              type="button"
              :disabled="!selectedCase"
              @click="emit('copyProps')"
            >
              Copy
            </button>
          </div>
        </div>

        <div v-if="propFields.length > 0" class="ml-panel__prop-list">
          <label
            v-for="field in propFields"
            :key="field.key"
            class="ml-panel__prop-field"
          >
            <span class="ml-panel__prop-label">
              <span class="ml-panel__prop-name">{{ field.key }}</span>
              <span class="ml-panel__prop-kind">{{ field.kind }}</span>
            </span>

            <input
              v-if="field.kind === 'string'"
              class="ml-panel__input"
              type="text"
              :value="field.draftText"
              :disabled="!selectedCase"
              @input="
                updateStringField(
                  field,
                  ($event.target as HTMLInputElement).value,
                )
              "
            />

            <input
              v-else-if="field.kind === 'number'"
              class="ml-panel__input"
              type="number"
              :value="field.draftText"
              :disabled="!selectedCase"
              @input="
                updateNumberField(
                  field,
                  ($event.target as HTMLInputElement).value,
                )
              "
            />

            <span v-else-if="field.kind === 'boolean'" class="ml-panel__switch-row">
              <input
                :id="`ml-prop-${field.key}`"
                class="ml-panel__switch-input"
                type="checkbox"
                :checked="Boolean(field.value)"
                :disabled="!selectedCase"
                @change="
                  updateBooleanField(
                    field,
                    ($event.target as HTMLInputElement).checked,
                  )
                "
              />
              <span class="ml-panel__switch" aria-hidden="true">
                <span class="ml-panel__switch-thumb" />
              </span>
              <span class="ml-panel__switch-text">
                {{ field.value ? 'On' : 'Off' }}
              </span>
            </span>

            <textarea
              v-else
              class="ml-panel__editor ml-panel__editor--field"
              :value="field.draftText"
              :disabled="!selectedCase"
              spellcheck="false"
              @input="
                updateJsonField(
                  field,
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              @change="
                updateJsonField(
                  field,
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
            />

            <span
              v-if="field.error"
              class="ml-panel__field-error"
            >
              {{ field.error }}
            </span>
          </label>
        </div>

        <p v-else class="ml-panel__muted">
          No props for this variant.
        </p>

      </div>

      <!-- Events tab -->
      <div
        v-show="activeTab === 'events'"
        class="ml-panel__section"
        role="tabpanel"
      >
        <div class="ml-panel__section-header">
          <h2 class="ml-panel__title">Events</h2>
          <button
            class="ml-panel__btn"
            type="button"
            :disabled="eventLog.length === 0"
            @click="emit('clearEvents')"
          >
            Clear
          </button>
        </div>

        <div v-if="selectedCase?.events?.length" class="ml-panel__event-chips">
          <span
            v-for="eventName in selectedCase.events"
            :key="eventName"
            class="ml-panel__event-chip"
          >
            {{ eventName }}
          </span>
        </div>
        <p v-else class="ml-panel__muted">No events configured.</p>

        <ol v-if="eventLog.length > 0" class="ml-panel__event-log">
          <li
            v-for="entry in eventLog"
            :key="entry.id"
            class="ml-panel__event-entry"
          >
            <div class="ml-panel__event-header">
              <span class="ml-panel__event-name">{{ entry.name }}</span>
              <time class="ml-panel__event-time">{{ entry.timestamp }}</time>
            </div>
            <pre class="ml-panel__event-payload">{{
              formatPayload(entry.payload)
            }}</pre>
          </li>
        </ol>
        <p
          v-else-if="selectedCase?.events?.length"
          class="ml-panel__muted ml-panel__muted--top"
        >
          No events recorded yet.
        </p>
      </div>

      <!-- Notes tab -->
      <div
        v-show="activeTab === 'notes'"
        class="ml-panel__section"
        role="tabpanel"
      >
        <h2 class="ml-panel__title">Notes</h2>

        <div v-if="selectedCase?.notes" class="ml-panel__note">
          <h3 class="ml-panel__subtitle">Case</h3>
          <p>{{ selectedCase.notes }}</p>
        </div>

        <div v-if="selectedVariant?.notes" class="ml-panel__note">
          <h3 class="ml-panel__subtitle">Variant</h3>
          <p>{{ selectedVariant.notes }}</p>
        </div>

        <p
          v-if="!selectedCase?.notes && !selectedVariant?.notes"
          class="ml-panel__muted"
        >
          No notes for this selection.
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.ml-panel {
  width: 320px;
  flex: 0 0 320px;
  height: 100%;
  overflow: hidden;
  background: var(--ml-bg-chrome);
  border-left: 1px solid var(--ml-border);
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: var(--ml-text);
}

/* ── Tab bar ── */

.ml-panel__tabs {
  display: flex;
  padding: 0 12px;
  background: var(--ml-bg-chrome);
  border-bottom: 1px solid var(--ml-border);
  flex-shrink: 0;
}

.ml-panel__tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 10px 9px;
  font-size: 11.5px;
  font-weight: 500;
  font-family: inherit;
  color: var(--ml-text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: color 0.1s;
}

.ml-panel__tab:hover {
  color: var(--ml-text);
}

.ml-panel__tab--active {
  font-weight: 600;
  color: var(--ml-accent);
  border-bottom-color: var(--ml-accent);
}

.ml-panel__tab-badge {
  font-size: 9px;
  font-family: var(--ml-font-mono);
  padding: 1px 5px;
  background: var(--ml-bg-input);
  color: var(--ml-text-muted);
  border-radius: 8px;
  font-weight: 600;
}

.ml-panel__tab-badge--active {
  background: var(--ml-accent-soft);
  color: var(--ml-accent);
}

/* ── Body ── */

.ml-panel__body {
  flex: 1;
  overflow-y: auto;
}

.ml-panel__section {
  padding: 14px;
}

.ml-panel__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.ml-panel__title {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ml-text-strong);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ml-panel__section-header .ml-panel__title {
  margin-bottom: 0;
}

.ml-panel__subtitle {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ml-accent);
}

.ml-panel__actions {
  display: flex;
  gap: 4px;
}

.ml-panel__btn {
  height: 22px;
  padding: 0 8px;
  font-size: 10.5px;
  font-weight: 500;
  font-family: inherit;
  background: transparent;
  border: 1px solid var(--ml-border);
  border-radius: 4px;
  color: var(--ml-text-muted);
  cursor: pointer;
  transition:
    background 0.1s,
    color 0.1s;
}

.ml-panel__btn:hover:not(:disabled) {
  background: var(--ml-bg-hover);
  color: var(--ml-text);
}

.ml-panel__btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

/* Props editor */

.ml-panel__prop-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ml-panel__prop-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ml-panel__prop-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ml-panel__prop-name {
  min-width: 0;
  overflow-wrap: anywhere;
  font-family: var(--ml-font-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ml-text-strong);
}

.ml-panel__prop-kind {
  flex-shrink: 0;
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--ml-bg-input);
  color: var(--ml-text-muted);
  font-family: var(--ml-font-mono);
  font-size: 9.5px;
  line-height: 1;
}

.ml-panel__input {
  display: block;
  width: 100%;
  height: 30px;
  border: 1px solid var(--ml-border);
  border-radius: 5px;
  padding: 0 9px;
  background: var(--ml-bg-input);
  color: var(--ml-text);
  font-family: inherit;
  font-size: 12px;
  outline: none;
}

.ml-panel__input:focus {
  border-color: var(--ml-border-focus);
}

.ml-panel__input:disabled {
  opacity: 0.55;
}

.ml-panel__editor {
  display: block;
  width: 100%;
  min-height: 190px;
  resize: vertical;
  border: 1px solid var(--ml-border);
  border-radius: 6px;
  padding: 10px;
  background: var(--ml-bg-input);
  color: var(--ml-text);
  font-family: var(--ml-font-mono);
  font-size: 12px;
  line-height: 1.5;
  tab-size: 2;
  outline: none;
}

.ml-panel__editor:focus {
  border-color: var(--ml-border-focus);
}

.ml-panel__editor:disabled {
  opacity: 0.55;
}

.ml-panel__editor--field {
  min-height: 86px;
  font-size: 11.5px;
}

.ml-panel__switch-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  cursor: pointer;
}

.ml-panel__switch-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.ml-panel__switch {
  position: relative;
  width: 34px;
  height: 18px;
  flex: 0 0 34px;
  border-radius: 999px;
  background: var(--ml-border-strong);
  transition: background 0.1s;
}

.ml-panel__switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--ml-bg-chrome);
  transition: transform 0.1s;
}

.ml-panel__switch-input:checked + .ml-panel__switch {
  background: var(--ml-accent);
}

.ml-panel__switch-input:checked + .ml-panel__switch .ml-panel__switch-thumb {
  transform: translateX(16px);
}

.ml-panel__switch-input:focus-visible + .ml-panel__switch {
  outline: 2px solid var(--ml-border-focus);
  outline-offset: 2px;
}

.ml-panel__switch-input:disabled + .ml-panel__switch,
.ml-panel__switch-input:disabled ~ .ml-panel__switch-text {
  opacity: 0.55;
}

.ml-panel__switch-text {
  color: var(--ml-text-muted);
  font-size: 11.5px;
  font-weight: 500;
}

.ml-panel__field-error {
  color: var(--ml-error);
  font-size: 11px;
  line-height: 1.35;
}

/* Messages */

.ml-panel__message {
  margin: 8px 0 0;
  color: var(--ml-text-muted);
  line-height: 1.45;
  font-size: 12px;
}

.ml-panel__message--success {
  color: var(--ml-success);
}

.ml-panel__message--error {
  color: var(--ml-error);
}

.ml-panel__muted {
  margin: 0;
  color: var(--ml-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.ml-panel__muted--top {
  margin-top: 10px;
}

/* Event chips */

.ml-panel__event-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.ml-panel__event-chip {
  font-size: 10.5px;
  font-family: var(--ml-font-mono);
  padding: 3px 7px;
  background: var(--ml-event-chip-bg);
  color: var(--ml-event-chip);
  border-radius: 3px;
  font-weight: 500;
  max-width: 100%;
  overflow-wrap: anywhere;
}

/* Event log */

.ml-panel__event-log {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}

.ml-panel__event-entry {
  border: 1px solid var(--ml-border);
  border-radius: 6px;
  background: var(--ml-bg-input);
  overflow: hidden;
}

.ml-panel__event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 8px;
  border-bottom: 1px solid var(--ml-border);
}

.ml-panel__event-name {
  font-family: var(--ml-font-mono);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ml-event-chip);
  overflow-wrap: anywhere;
}

.ml-panel__event-time {
  flex-shrink: 0;
  font-size: 10px;
  font-family: var(--ml-font-mono);
  color: var(--ml-text-muted);
}

.ml-panel__event-payload {
  max-height: 120px;
  margin: 0;
  overflow: auto;
  padding: 7px 8px;
  color: var(--ml-text-muted);
  font-family: var(--ml-font-mono);
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Notes */

.ml-panel__note {
  margin-top: 10px;
}

.ml-panel__note:first-of-type {
  margin-top: 0;
}

.ml-panel__note p {
  margin: 0;
  color: var(--ml-text);
  line-height: 1.55;
  white-space: pre-wrap;
  font-size: 12px;
}
</style>
