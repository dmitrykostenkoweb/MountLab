<template>
  <div class="default-wrapper">
    <div class="default-wrapper__toolbar">
      <span>Demo Shell</span>
      <button type="button">Save draft</button>
    </div>
    <div class="default-wrapper__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.default-wrapper {
  min-height: 100%;
  padding: 32px;
  background:
    linear-gradient(#d9e2ef 1px, transparent 1px),
    linear-gradient(90deg, #d9e2ef 1px, transparent 1px),
    #f7f9fc;
  background-size: 24px 24px;
}

.default-wrapper__toolbar {
  max-width: 980px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto 18px;
  border: 1px solid #d6deea;
  border-radius: 8px;
  padding: 10px 12px;
  background: rgb(255 255 255 / 0.88);
  color: #5b6778;
  font-size: 13px;
  font-weight: 700;
}

.default-wrapper__toolbar button {
  border: 1px solid #2563eb;
  border-radius: 6px;
  padding: 7px 10px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.default-wrapper__content {
  max-width: 980px;
  margin: 0 auto;
}
</style>
