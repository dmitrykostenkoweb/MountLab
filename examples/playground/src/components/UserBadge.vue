<script setup lang="ts">
withDefaults(defineProps<{
  name: string
  role: string
  status: 'online' | 'offline' | 'busy'
  notifications?: number
  compact?: boolean
}>(), {
  notifications: 0,
  compact: false,
})

const emit = defineEmits<{
  openProfile: [name: string]
}>()
</script>

<template>
  <button
    type="button"
    class="user-badge"
    :class="[`user-badge--${status}`, { 'user-badge--compact': compact }]"
    @click="emit('openProfile', name)"
  >
    <span class="user-badge__avatar">{{ name.charAt(0).toUpperCase() }}</span>
    <span class="user-badge__content">
      <strong>{{ name }}</strong>
      <span>{{ role }}</span>
    </span>
    <span v-if="notifications > 0" class="user-badge__count">{{ notifications }}</span>
  </button>
</template>

<style scoped>
.user-badge {
  width: min(100%, 360px);
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #d8e0eb;
  border-radius: 8px;
  padding: 12px;
  background: white;
  color: #172033;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 12px 28px rgb(15 23 42 / 0.08);
}

.user-badge--compact {
  width: auto;
  padding: 8px 10px;
}

.user-badge__avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 900;
}

.user-badge__avatar::after {
  content: "";
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 11px;
  height: 11px;
  border: 2px solid white;
  border-radius: 50%;
  background: #94a3b8;
}

.user-badge--online .user-badge__avatar::after {
  background: #16a34a;
}

.user-badge--busy .user-badge__avatar::after {
  background: #f59e0b;
}

.user-badge__content {
  min-width: 0;
  display: grid;
  gap: 2px;
  flex: 1;
}

.user-badge__content strong,
.user-badge__content span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-badge__content strong {
  font-size: 15px;
}

.user-badge__content span {
  color: #64748b;
  font-size: 13px;
}

.user-badge__count {
  display: grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  padding: 0 7px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 900;
}
</style>
