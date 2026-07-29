"use client"

import { useState } from "react"
import Image from "next/image"
import { SlotsbandLogo } from "@/components/slotsband-logo"

interface BlogPostImageProps {
  src: string | null
  alt: string
  className?: string
  sizes: string
  priority?: boolean
}

/**
 * Renders a blog post's featured image, falling back to a branded
 * placeholder when the URL is missing or fails to load (e.g. dead legacy
 * WordPress media links) instead of a broken-image icon with raw alt text.
 */
export function BlogPostImage({ src, alt, className = "", sizes, priority = false }: BlogPostImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`relative w-full overflow-hidden bg-gradient-to-br from-[#2D1783] to-[#1B0F52] flex items-center justify-center ${className}`}>
        <SlotsbandLogo variant="light" height={28} />
      </div>
    )
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
