//  FINAL FIXED: Tooltip bottom aligns to top of the hovered element
import { useEffect, useRef, useState } from 'react'

export function useGlobalTooltip() {
  const [tooltip, setTooltip] = useState(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    if (!tooltip) return

    const { rect, content } = tooltip
    let el = tooltipRef.current

    // Create tooltip element if not exists
    if (!el) {
      el = document.createElement('div')
      el.className =
        'fixed z-[9999] bg-gray-900 text-white text-xs rounded-md shadow-lg px-3 py-2 pointer-events-none transition-all duration-150 opacity-0 transform -translate-x-1/2'
      tooltipRef.current = el
      document.body.appendChild(el)
    }

    el.innerHTML = content

    // ✅ Align bottom of tooltip to top of text
    const tooltipHeight = el.offsetHeight || 0
    const offset = 6 // small gap between tooltip and text

    el.style.left = `${rect.left + rect.width / 2}px`
    el.style.top = `${rect.top - tooltipHeight - offset}px`

    requestAnimationFrame(() => (el.style.opacity = '1'))

    return () => {
      el.style.opacity = '0'
      setTimeout(() => {
        el.remove()
        tooltipRef.current = null
      }, 150)
    }
  }, [tooltip])

  return setTooltip
}
