"use client"
import { useEffect } from "react"

const HREF =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"

export function MaterialSymbolsLoader() {
  useEffect(() => {
    if (document.querySelector(`link[href="${HREF}"]`)) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = HREF
    document.head.appendChild(link)
  }, [])
  return null
}
