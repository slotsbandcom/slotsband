import Image from "next/image"

interface SlotsbandLogoProps {
  variant?: "dark" | "light"
  className?: string
  /** height in px – width is calculated automatically from the 900:134 aspect ratio */
  height?: number
  /** Set true only for above-the-fold logos (header); footer/admin should leave false */
  priority?: boolean
}

export function SlotsbandLogo({ variant = "dark", className = "", height = 32, priority = false }: SlotsbandLogoProps) {
  const width = Math.round((900 / 134) * height)

  const img = (
    <Image
      src="/slotsband-logo.svg"
      alt="Slotsband"
      width={width}
      height={height}
      unoptimized
      priority={priority}
      className="object-contain"
      style={{ width, height }}
    />
  )

  if (variant === "light") {
    return <span className={className} style={{ display: "inline-block", width, height }}>{img}</span>
  }

  // Dark pill wrapper so the yellow logo is visible on white backgrounds
  // px-3 = 12px per side → total horizontal padding 24px
  return (
    <span
      className={`inline-flex items-center justify-center bg-[#2D1783] rounded-xl px-3 ${className}`}
      style={{ width: width + 24, height: height + 12 }}
    >
      {img}
    </span>
  )
}
