import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensure review text is wrapped in <p> tags for proper rendering.
 * - If already has <p> tags → return as-is
 * - If split by blank lines → wrap each block in <p>
 * - If plain continuous text → split every 3 sentences
 */
export function formatReviewText(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ""

  // Already structured HTML — trust it
  if (/<p[\s>]/i.test(trimmed)) return trimmed

  // Has double newlines — split on paragraph breaks
  if (/\n\n/.test(trimmed)) {
    return trimmed
      .split(/\n\n+/)
      .map(block => block.replace(/\n/g, " ").trim())
      .filter(Boolean)
      .map(block => `<p>${block}</p>`)
      .join("")
  }

  // Plain text (single newlines or none) — split into sentences, group by 3
  const sentenceEnder = /([.!?]["»]?)\s+(?=[A-ZÄÖÅÀ-ɏ])/g
  const sentences = trimmed
    .replace(/\n/g, " ")
    .replace(sentenceEnder, "$1\n")
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)

  if (sentences.length <= 1) return `<p>${trimmed.replace(/\n/g, " ")}</p>`

  const paragraphs: string[] = []
  for (let i = 0; i < sentences.length; i += 3) {
    const chunk = sentences.slice(i, i + 3).join(" ").trim()
    if (chunk) paragraphs.push(`<p>${chunk}</p>`)
  }
  return paragraphs.join("")
}
