import { defineComponentCase } from '@mountlab/vue'
import FeedbackField from './FeedbackField.vue'

export default defineComponentCase({
  id: 'feedback-field',
  title: 'Feedback Field',
  group: 'Forms',
  component: FeedbackField,
  wrapper: 'default',
  variants: [
    {
      id: 'empty',
      title: 'Empty',
      props: {
        label: 'Release notes feedback',
        modelValue: '',
        placeholder: 'What should change before this ships?',
        helperText: 'Write a short note for the product team.',
      },
    },
    {
      id: 'error',
      title: 'With Error',
      props: {
        label: 'Release notes feedback',
        modelValue: 'Looks fine',
        error: 'Please add at least one concrete detail.',
      },
    },
    {
      id: 'disabled',
      title: 'Disabled',
      props: {
        label: 'Release notes feedback',
        modelValue: 'Feedback already submitted.',
        disabled: true,
      },
    },
  ],
  events: ['update:modelValue', 'submit'],
})
