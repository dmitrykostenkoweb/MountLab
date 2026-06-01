<script setup lang="ts">
import { computed, ref } from "vue";
import type { ComponentCase } from "../../core/types.js";
import type { RuntimeCaseEntry } from "../caseMetadata.js";
import {
  filterSidebarCaseEntries,
  groupSidebarCaseEntries,
  normalizeCaseEntries,
  toSidebarCaseEntries,
} from "../caseMetadata.js";

const props = defineProps<{
  cases: ComponentCase[];
  caseEntries?: RuntimeCaseEntry[];
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [caseId: string];
}>();

const searchQuery = ref("");

const sidebarEntries = computed(() =>
  toSidebarCaseEntries(
    normalizeCaseEntries(props.cases, props.caseEntries ?? []),
  ),
);

const filteredEntries = computed(() =>
  filterSidebarCaseEntries(sidebarEntries.value, searchQuery.value),
);

const groupedEntries = computed(() =>
  groupSidebarCaseEntries(filteredEntries.value),
);
</script>

<template>
  <nav class="ml-sidebar">
    <div class="ml-sidebar__header">
      <!-- Vue triangle logo -->
      <svg
        class="ml-sidebar__logo"
        width="18"
        height="15.75"
        viewBox="0 0 100 87.5"
        aria-hidden="true"
      >
        <path
          d="M0 0 L50 87.5 L100 0 L80 0 L50 52 L20 0 Z"
          fill="var(--ml-accent)"
        />
        <path
          d="M20 0 L50 52 L80 0 L62 0 L50 20 L38 0 Z"
          fill="var(--ml-text)"
        />
      </svg>
      <span class="ml-sidebar__brand">MOUNTLAB</span>
      <span class="ml-sidebar__version">v0.4</span>
    </div>

    <div class="ml-sidebar__search-wrap">
      <svg
        class="ml-sidebar__search-icon"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        v-model="searchQuery"
        class="ml-sidebar__search"
        type="search"
        placeholder="Search cases…"
        aria-label="Search cases"
      />
      <span class="ml-sidebar__kbd" aria-hidden="true">⌘K</span>
    </div>

    <div class="ml-sidebar__list">
      <p v-if="filteredEntries.length === 0" class="ml-sidebar__empty">
        No matching cases
      </p>

      <template
        v-for="(groupCaseList, groupName) in groupedEntries"
        :key="groupName"
      >
        <div class="ml-sidebar__group">{{ groupName }}</div>
        <button
          v-for="entry in groupCaseList"
          :key="entry.case.id"
          class="ml-sidebar__item"
          :class="{ 'ml-sidebar__item--active': entry.case.id === selectedId }"
          :title="entry.path ?? entry.case.id"
          @click="emit('select', entry.case.id)"
        >
          <span
            class="ml-sidebar__dot"
            :class="{ 'ml-sidebar__dot--active': entry.case.id === selectedId }"
          />
          <span class="ml-sidebar__item-title">{{
            entry.case.title ?? entry.case.id
          }}</span>
          <span
            v-if="entry.case.variants?.length"
            class="ml-sidebar__variant-count"
          >
            {{ entry.case.variants.length }}
          </span>
        </button>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.ml-sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  flex: 0 0 220px;
  height: 100%;
  overflow: hidden;
  background: var(--ml-bg-chrome);
  border-right: 1px solid var(--ml-border);
}

.ml-sidebar__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 12px;
  flex-shrink: 0;
}

.ml-sidebar__logo {
  flex-shrink: 0;
}

.ml-sidebar__brand {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--ml-accent);
}

.ml-sidebar__version {
  margin-left: auto;
  font-size: 9px;
  font-family: var(--ml-font-mono);
  color: var(--ml-text-muted);
  letter-spacing: 0.05em;
}

.ml-sidebar__search-wrap {
  position: relative;
  padding: 0 12px 12px;
  flex-shrink: 0;
}

.ml-sidebar__search-icon {
  position: absolute;
  left: 21px;
  top: 50%;
  transform: translateY(calc(-50% - 6px));
  color: var(--ml-text-muted);
  pointer-events: none;
}

.ml-sidebar__search {
  width: 100%;
  height: 30px;
  padding: 0 32px 0 28px;
  font-size: 12px;
  font-family: inherit;
  background: var(--ml-bg-input);
  border: 1px solid var(--ml-border);
  border-radius: 6px;
  color: var(--ml-text);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.ml-sidebar__search:focus {
  border-color: var(--ml-border-focus);
}

.ml-sidebar__search::placeholder {
  color: var(--ml-text-faint);
}

.ml-sidebar__search::-webkit-search-cancel-button {
  display: none;
}

.ml-sidebar__kbd {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(calc(-50% - 6px));
  font-size: 10px;
  font-family: var(--ml-font-mono);
  color: var(--ml-text-muted);
  background: var(--ml-bg-chrome);
  border: 1px solid var(--ml-border);
  border-radius: 3px;
  padding: 1px 5px;
  pointer-events: none;
}

.ml-sidebar__list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px 16px;
}

.ml-sidebar__empty {
  padding: 24px 12px;
  font-size: 12px;
  color: var(--ml-text-muted);
  text-align: center;
  font-style: italic;
  margin: 0;
}

.ml-sidebar__group {
  padding: 10px 8px 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ml-text-muted);
}

.ml-sidebar__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--ml-text);
  font-size: 12.5px;
  font-weight: 500;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.1s,
    color 0.1s;
}

.ml-sidebar__item:hover {
  background: var(--ml-bg-hover);
}

.ml-sidebar__item--active {
  background: var(--ml-bg-active);
  color: var(--ml-accent);
  font-weight: 600;
}

.ml-sidebar__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ml-text-faint);
  flex-shrink: 0;
}

.ml-sidebar__dot--active {
  background: var(--ml-accent);
}

.ml-sidebar__item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ml-sidebar__variant-count {
  font-size: 10px;
  font-family: var(--ml-font-mono);
  color: var(--ml-text-muted);
  flex-shrink: 0;
}
</style>
