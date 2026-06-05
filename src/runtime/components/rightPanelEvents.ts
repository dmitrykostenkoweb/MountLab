import type { ComponentCase } from '../../core/types.js'

export function getEventsEmptyState(selectedCase: ComponentCase | null): string {
  return selectedCase?.events?.length
    ? 'No events recorded yet.'
    : 'No events configured or inferred for this case.'
}
