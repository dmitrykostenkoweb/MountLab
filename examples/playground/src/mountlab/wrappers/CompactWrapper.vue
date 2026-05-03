<template>
  <div class="compact-wrapper">
    <slot />
  </div>
</template>

<style scoped>
.compact-wrapper {
  min-height: 100%;
  display: grid;
  place-items: start center;
  padding: 20px;
  background: #fff7ed;
}
</style>
