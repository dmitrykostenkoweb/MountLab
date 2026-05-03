import { describe, expect, it } from 'vitest'
import { calculateResizedViewport } from './viewportResize.js'

describe('calculateResizedViewport', () => {
  it('resizes width from right edge movement', () => {
    expect(calculateResizedViewport({
      axis: 'width',
      startX: 100,
      startY: 200,
      startWidth: 390,
      startHeight: 844,
    }, 140, 260)).toEqual({ width: 430, height: 844 })
  })

  it('resizes height from bottom edge movement', () => {
    expect(calculateResizedViewport({
      axis: 'height',
      startX: 100,
      startY: 200,
      startWidth: 390,
      startHeight: 844,
    }, 140, 260)).toEqual({ width: 390, height: 904 })
  })

  it('resizes width and height from corner movement', () => {
    expect(calculateResizedViewport({
      axis: 'both',
      startX: 100,
      startY: 200,
      startWidth: 390,
      startHeight: 844,
    }, 140, 260)).toEqual({ width: 430, height: 904 })
  })
})
