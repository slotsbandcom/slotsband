import Image from "next/image"

interface SlotsbandLogoProps {
  /** "dark" = yellow text on dark bg (header/admin), "light" = yellow text shown directly (footer dark strip) */
  variant?: "dark" | "light"
  className?: string
  /** height in px – width is calculated automatically from the 900:134 aspect ratio */
  height?: number
}

/**
 * Official Slotsband vector logo.
 * The SVG paths are yellow (#FCFF00) on transparent, so they need a dark
 * background to be legible on white surfaces.
 *
 * variant="dark"  → wraps the SVG in a #2D1783 pill (for white/light backgrounds)
 * variant="light" → renders the SVG directly (for use on dark backgrounds)
 */
export function SlotsbandLogo({ variant = "dark", className = "", height = 32 }: SlotsbandLogoProps) {
  // Maintain the 900:134 aspect ratio
  const width = Math.round((900 / 134) * height)

  if (variant === "light") {
    return (
      <Image
        src="/slotsband-logo.svg"
        alt="Slotsband"
        width={width}
        height={height}
        className={`w-auto object-contain ${className}`}
        style={{ height }}
        priority
      />
    )
  }

  // Dark pill wrapper so the yellow logo is visible on white backgrounds
  return (
    <span
      className={`inline-flex items-center justify-center bg-[#2D1783] rounded-xl px-3 ${className}`}
      style={{ height: height + 12 }}
    >
      <Image
        src="/slotsband-logo.svg"
        alt="Slotsband"
        width={width}
        height={height}
        className="w-auto object-contain"
        style={{ height }}
        priority
      />
    </span>
  )
}
