import type { Viewport } from '../core/types.js'

export type ViewportResizeAxis = 'width' | 'height' | 'both'

export interface ViewportResizeStart {
  axis: ViewportResizeAxis
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

export function calculateResizedViewport(
  drag: ViewportResizeStart,
  clientX: number,
  clientY: number,
): Viewport {
  return {
    width: drag.axis === 'height'
      ? drag.startWidth
      : drag.startWidth + clientX - drag.startX,
    height: drag.axis === 'width'
      ? drag.startHeight
      : drag.startHeight + clientY - drag.startY,
  }
}
