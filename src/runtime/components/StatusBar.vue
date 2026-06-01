<script setup lang="ts">
defineProps<{
  caseCount: number;
  variantCount: number;
}>();
</script>

<template>
  <div class="ml-statusbar">
    <div class="ml-statusbar__left">
      <div class="ml-statusbar__item">
        <span class="ml-statusbar__led" />
        <span>vite · :5173</span>
      </div>

      <div class="ml-statusbar__item">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 1 1-3.51-7.13" />
          <path d="M21 4v5h-5" />
        </svg>
        <span>HMR ready</span>
      </div>

      <div class="ml-statusbar__item">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <span>/__mountlab/entry.js</span>
      </div>
    </div>

    <div class="ml-statusbar__right">
      <span class="ml-statusbar__item"
        >{{ caseCount }} cases · {{ variantCount }} variants</span
      >
      <span class="ml-statusbar__item">
        <span class="ml-statusbar__dot" />
        60 fps
      </span>
    </div>
  </div>
</template>

<style scoped>
.ml-statusbar {
  height: 24px;
  flex: 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: var(--ml-bg-chrome);
  border-top: 1px solid var(--ml-border);
  font-size: 10.5px;
  font-family: var(--ml-font-mono);
  color: var(--ml-text-muted);
  letter-spacing: 0.02em;
}

.ml-statusbar__left,
.ml-statusbar__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ml-statusbar__item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ml-statusbar__led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ml-success);
  box-shadow: 0 0 6px var(--ml-success);
}

.ml-statusbar__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ml-accent);
}
</style>
