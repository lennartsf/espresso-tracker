import { useEffect, useState } from 'react'

/** True below the Tailwind `md` breakpoint (<768px). SSR/test-safe (matchMedia guarded). */
export function useIsMobile(): boolean {
  const query = '(max-width: 767px)'
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches
  )

  useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
