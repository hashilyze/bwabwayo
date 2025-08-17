'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function OverlayPortal({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return

    const html = document.documentElement
    const body = document.body
    const scroller = document.getElementById('app-scroll') as HTMLElement | null

    // 기존 스타일 저장
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevScrollerOverflow = scroller?.style.overflow

    // 스크롤 잠금
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scroller) scroller.style.overflow = 'hidden'

    // 휠/터치 스크롤 차단(모바일 포함)
    const prevent = (e: Event) => e.preventDefault()
    window.addEventListener('wheel', prevent, { passive: false })
    window.addEventListener('touchmove', prevent, { passive: false })

    return () => {
      window.removeEventListener('wheel', prevent as any)
      window.removeEventListener('touchmove', prevent as any)
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      if (scroller) scroller.style.overflow = prevScrollerOverflow ?? ''
    }
  }, [open])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}
