import type { ComponentCase } from '../core/types.js'

export interface RuntimeCaseEntry {
  case: ComponentCase
  path?: string
}

export interface SidebarCaseEntry {
  case: ComponentCase
  path: string | null
  group: string
  searchText: string
}

export function normalizeCaseEntries(
  cases: ComponentCase[],
  entries: RuntimeCaseEntry[] = [],
): RuntimeCaseEntry[] {
  if (entries.length > 0) {
    return entries
  }

  return cases.map(componentCase => ({ case: componentCase }))
}

export function deriveFallbackGroup(sourcePath: string | null | undefined): string {
  if (!sourcePath) return 'Components'

  const normalized = sourcePath.replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)
  const fileName = parts.at(-1)
  const folderParts = fileName ? parts.slice(0, -1) : parts

  if (folderParts.length === 0) return 'Components'

  if (folderParts[0] === 'src' && folderParts.length > 1) {
    return folderParts.slice(1).join('/')
  }

  return folderParts.at(-1) ?? 'Components'
}

export function toSidebarCaseEntries(entries: RuntimeCaseEntry[]): SidebarCaseEntry[] {
  return entries.map((entry) => {
    const sourcePath = entry.path ?? null
    const group = entry.case.group ?? deriveFallbackGroup(sourcePath)
    const title = entry.case.title ?? ''
    const searchText = [
      title,
      entry.case.id,
      entry.case.group ?? '',
      group,
      sourcePath ?? '',
    ]
      .join(' ')
      .toLowerCase()

    return {
      case: entry.case,
      path: sourcePath,
      group,
      searchText,
    }
  })
}

export function filterSidebarCaseEntries(
  entries: SidebarCaseEntry[],
  query: string,
): SidebarCaseEntry[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return entries

  return entries.filter(entry => entry.searchText.includes(normalizedQuery))
}

export function groupSidebarCaseEntries(
  entries: SidebarCaseEntry[],
): Record<string, SidebarCaseEntry[]> {
  const groups: Record<string, SidebarCaseEntry[]> = {}

  for (const entry of entries) {
    ;(groups[entry.group] ??= []).push(entry)
  }

  return groups
}
