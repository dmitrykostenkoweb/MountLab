<script setup lang="ts">
import type { ComponentCase } from '../../core/types.js'

const props = defineProps<{
  cases: ComponentCase[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [caseId: string]
}>()

function groupCases(cases: ComponentCase[]): Record<string, ComponentCase[]> {
  const groups: Record<string, ComponentCase[]> = {}
  for (const c of cases) {
    const key = c.group ?? 'Components'
    ;(groups[key] ??= []).push(c)
  }
  return groups
}
</script>

<template>
  <nav class="ml-sidebar">
    <div class="ml-sidebar__header">MountLab</div>
    <template v-for="(groupCaseList, groupName) in groupCases(cases)" :key="groupName">
      <div class="ml-sidebar__group">{{ groupName }}</div>
      <button
        v-for="c in groupCaseList"
        :key="c.id"
        class="ml-sidebar__item"
        :class="{ 'ml-sidebar__item--active': c.id === selectedId }"
        @click="emit('select', c.id)"
      >
        {{ c.title ?? c.id }}
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
