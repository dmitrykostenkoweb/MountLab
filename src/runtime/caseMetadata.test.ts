import { describe, expect, it } from 'vitest'
import type { ComponentCase } from '../core/types.js'
import {
  deriveFallbackGroup,
  filterSidebarCaseEntries,
  groupSidebarCaseEntries,
  normalizeCaseEntries,
  toSidebarCaseEntries,
} from './caseMetadata.js'

const ComponentStub = {}

function componentCase(id: string, title?: string, group?: string): ComponentCase {
  return {
    id,
    title,
    group,
    component: ComponentStub,
    variants: [{ id: 'default', props: {} }],
  }
}

describe('case metadata helpers', () => {
  it('uses explicit case groups before path fallback groups', () => {
    const entries = toSidebarCaseEntries([
      { case: componentCase('product-card', 'Product Card', 'Inventory'), path: 'src/components/product-card/ProductCard.case.ts' },
    ])

    expect(entries[0].group).toBe('Inventory')
  })

  it('derives fallback groups from source paths', () => {
    expect(deriveFallbackGroup('src/components/product-card/ProductCard.case.ts')).toBe('components/product-card')
    expect(deriveFallbackGroup('packages/ui/Button.case.ts')).toBe('ui')
    expect(deriveFallbackGroup(null)).toBe('Components')
  })

  it('normalizes flat case arrays when metadata entries are unavailable', () => {
    const cases = [componentCase('button')]

    expect(normalizeCaseEntries(cases)).toEqual([{ case: cases[0] }])
  })

  it('filters by title, id, group, and source path', () => {
    const entries = toSidebarCaseEntries([
      { case: componentCase('product-card', 'Product Card', 'Inventory'), path: 'src/inventory/ProductCard.case.ts' },
      { case: componentCase('checkout-summary', 'Checkout Summary'), path: 'src/checkout/Summary.case.ts' },
    ])

    expect(filterSidebarCaseEntries(entries, 'product')).toHaveLength(1)
    expect(filterSidebarCaseEntries(entries, 'checkout-summary')).toHaveLength(1)
    expect(filterSidebarCaseEntries(entries, 'inventory')).toHaveLength(1)
    expect(filterSidebarCaseEntries(entries, 'Summary.case')).toHaveLength(1)
    expect(filterSidebarCaseEntries(entries, 'missing')).toHaveLength(0)
  })

  it('groups filtered sidebar entries deterministically by group label', () => {
    const entries = toSidebarCaseEntries([
      { case: componentCase('a', 'A', 'Inventory') },
      { case: componentCase('b', 'B', 'Inventory') },
      { case: componentCase('c', 'C'), path: 'src/forms/C.case.ts' },
    ])

    const groups = groupSidebarCaseEntries(entries)

    expect(groups.Inventory.map(entry => entry.case.id)).toEqual(['a', 'b'])
    expect(groups.forms.map(entry => entry.case.id)).toEqual(['c'])
  })
})
