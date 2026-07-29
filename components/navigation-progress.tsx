"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function startNavigationProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nprogress:start"))
  }
}

export function NavigationProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"idle" | "loading" | "finishing">("idle")
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const startedAt = useRef<string | null>(null)

  function clearAll() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  useEffect(() => {
    const onStart = () => {
      clearAll()
      startedAt.current = pathname
      setPhase("loading")
      setProgress(0)
      schedule(() => setProgress(20), 16)
      schedule(() => setProgress(50), 200)
      schedule(() => setProgress(70), 700)
      schedule(() => setProgress(82), 1800)
    }
    window.addEventListener("nprogress:start", onStart)
    return () => window.removeEventListener("nprogress:start", onStart)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Detect navigation completion via pathname change
  useEffect(() => {
    if (phase !== "loading") return
    if (pathname === startedAt.current) return
    clearAll()
    setProgress(100)
    setPhase("finishing")
    schedule(() => { setPhase("idle"); setProgress(0) }, 500)
  }, [pathname, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearAll(), [])

  if (phase === "idle") return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        zIndex: 99999,
        pointerEvents: "none",
        width: `${progress}%`,
        backgroundColor: "#2D1783",
        boxShadow: "0 0 8px rgba(45,23,131,0.6)",
        transition:
          phase === "finishing"
            ? "width 200ms ease, opacity 300ms ease 200ms"
            : progress === 0
            ? "none"
            : "width 600ms ease",
        opacity: phase === "finishing" ? 0 : 1,
      }}
    />
  )
}
