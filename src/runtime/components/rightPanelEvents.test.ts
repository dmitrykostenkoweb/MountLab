import { describe, expect, it } from 'vitest'
import type { ComponentCase } from '../../core/types.js'
import { getEventsEmptyState } from './rightPanelEvents.js'

const caseWithEvents: ComponentCase = {
  id: 'button',
  component: {},
  variants: [{ id: 'default', props: {} }],
  events: ['select'],
}

const caseWithoutEvents: ComponentCase = {
  id: 'button',
  component: {},
  variants: [{ id: 'default', props: {} }],
}

describe('right panel events helpers', () => {
  it('explains when a selected case has no configured or inferred events', () => {
    expect(getEventsEmptyState(caseWithoutEvents)).toBe(
      'No events configured or inferred for this case.',
    )
  })

  it('keeps the configured-but-empty event log state distinct', () => {
    expect(getEventsEmptyState(caseWithEvents)).toBe('No events recorded yet.')
  })
})
