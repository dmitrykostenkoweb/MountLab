<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  modelValue: string
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
}>(), {
  placeholder: '',
  helperText: '',
  error: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()
</script>

<template>
  <form class="feedback-field" @submit.prevent="emit('submit', props.modelValue)">
    <label>
      <span>{{ label }}</span>
      <textarea
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </label>
    <p v-if="error" class="feedback-field__error">{{ error }}</p>
    <p v-else-if="helperText" class="feedback-field__helper">{{ helperText }}</p>
    <button type="submit" :disabled="disabled">Send feedback</button>
  </form>
</template>

<style scoped>
.feedback-field {
  width: min(100%, 520px);
  border: 1px solid #d8e0eb;
  border-radius: 8px;
  padding: 18px;
  background: white;
  box-shadow: 0 12px 28px rgb(15 23 42 / 0.08);
}

.feedback-field label {
  display: grid;
  gap: 8px;
}

.feedback-field label span {
  color: #1f2937;
  font-size: 14px;
  font-weight: 800;
}

.feedback-field textarea {
  min-height: 120px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px 12px;
  color: #172033;
  line-height: 1.5;
}

.feedback-field textarea:focus {
  outline: 3px solid rgb(37 99 235 / 0.16);
  border-color: #2563eb;
}

.feedback-field textarea:disabled {
  background: #f1f5f9;
  color: #64748b;
}

.feedback-field__error,
.feedback-field__helper {
  margin: 8px 0 14px;
  font-size: 13px;
  line-height: 1.45;
}

.feedback-field__error {
  color: #dc2626;
}

.feedback-field__helper {
  color: #64748b;
}

.feedback-field button {
  min-height: 40px;
  border: 1px solid #0f766e;
  border-radius: 6px;
  padding: 0 14px;
  background: #0f766e;
  color: white;
  cursor: pointer;
  font-weight: 800;
}

.feedback-field button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
