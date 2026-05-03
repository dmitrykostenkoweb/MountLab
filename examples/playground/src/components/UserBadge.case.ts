import { defineComponentCase } from '@mountlab/vue'
import UserBadge from './UserBadge.vue'

export default defineComponentCase({
  id: 'user-badge',
  title: 'User Badge',
  group: 'People',
  component: UserBadge,
  wrapper: 'compact',
  variants: [
    {
      id: 'online',
      title: 'Online',
      props: {
        name: 'Dima Kowalski',
        role: 'Frontend Engineer',
        status: 'online',
        notifications: 3,
      },
    },
    {
      id: 'busy',
      title: 'Busy Compact',
      props: {
        name: 'Marta Nowak',
        role: 'Product Designer',
        status: 'busy',
        notifications: 0,
        compact: true,
      },
    },
    {
      id: 'offline',
      title: 'Offline',
      props: {
        name: 'Alex Morgan',
        role: 'QA Lead',
        status: 'offline',
        notifications: 12,
      },
    },
  ],
  events: ['openProfile'],
  notes: 'Click the badge to verify that configured emitted events appear in the event log.',
})
