<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ComponentCase } from '../../core/types.js'
import type { RuntimeCaseEntry } from '../caseMetadata.js'
import {
  filterSidebarCaseEntries,
  groupSidebarCaseEntries,
  normalizeCaseEntries,
  toSidebarCaseEntries,
} from '../caseMetadata.js'

const props = defineProps<{
  cases: ComponentCase[]
  caseEntries?: RuntimeCaseEntry[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [caseId: string]
}>()

const searchQuery = ref('')

const sidebarEntries = computed(() =>
  toSidebarCaseEntries(normalizeCaseEntries(props.cases, props.caseEntries ?? [])),
)

const filteredEntries = computed(() =>
  filterSidebarCaseEntries(sidebarEntries.value, searchQuery.value),
)

const groupedEntries = computed(() =>
  groupSidebarCaseEntries(filteredEntries.value),
)
</script>

<template>
  <nav class="ml-sidebar">
    <div class="ml-sidebar__header">MountLab</div>

    <div class="ml-sidebar__search-wrap">
      <input
        v-model="searchQuery"
        class="ml-sidebar__search"
        type="search"
        placeholder="Search cases"
        aria-label="Search cases"
      >
    </div>

    <p v-if="filteredEntries.length === 0" class="ml-sidebar__empty">
      No matching cases
    </p>

    <template v-for="(groupCaseList, groupName) in groupedEntries" :key="groupName">
      <div class="ml-sidebar__group">{{ groupName }}</div>
      <button
        v-for="entry in groupCaseList"
        :key="entry.case.id"
        class="ml-sidebar__item"
        :class="{ 'ml-sidebar__item--active': entry.case.id === selectedId }"
        :title="entry.path ?? entry.case.id"
        @click="emit('select', entry.case.id)"
      >
        {{ entry.case.title ?? entry.case.id }}
      </button>
    </template>
  </nav>
</template>

<style scoped>
.ml-sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  min-width: 220px;
  height: 100vh;
  overflow-y: auto;
  background: #1a1a2e;
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
  font-size: 13px;
}

.ml-sidebar__header {
  padding: 14px 16px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.05em;
  color: #a78bfa;
  border-bottom: 1px solid #2d2d4e;
}

.ml-sidebar__search-wrap {
  padding: 10px 12px 6px;
}

.ml-sidebar__search {
  width: 100%;
  border: 1px solid #2d2d4e;
  border-radius: 4px;
  padding: 6px 8px;
  background: #111827;
  color: #e2e8f0;
  font: inherit;
  outline: none;
}

.ml-sidebar__search:focus {
  border-color: #7c3aed;
}

.ml-sidebar__search::placeholder {
  color: #64748b;
}

.ml-sidebar__empty {
  margin: 12px 16px;
  color: #64748b;
  font-size: 12px;
}

.ml-sidebar__group {
  padding: 10px 16px 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.ml-sidebar__item {
  display: block;
  width: 100%;
  padding: 7px 16px;
  text-align: left;
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.1s;
}

.ml-sidebar__item:hover {
  background: #2d2d4e;
  color: #f1f5f9;
}

.ml-sidebar__item--active {
  background: #312e81;
  color: #a78bfa;
  font-weight: 500;
}
</style>
