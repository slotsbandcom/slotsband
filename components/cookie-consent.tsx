"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

// Google Consent Mode v2. Defaults (all denied) are set by CONSENT_DEFAULTS_SCRIPT
// in the root layout <head>, before gtag.js loads. This banner records the
// visitor's choice and sends the consent update so GA starts measuring.

export const CONSENT_STORAGE_KEY = "slotsband-consent"
const OPEN_EVENT = "slotsband:open-cookie-settings"

export const CONSENT_DEFAULTS_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
try {
  if (localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
  }
} catch (e) {}
`

type Choice = "granted" | "denied"
type Lang = "fi" | "en" | "uk"

const TEXT: Record<Lang, { body: string; privacy: string; accept: string; decline: string }> = {
  fi: {
    body: "Käytämme analytiikkaevästeitä (Google Analytics) sivuston kehittämiseen. Voit hyväksyä tai kieltäytyä.",
    privacy: "Tietosuojaseloste",
    accept: "Hyväksy",
    decline: "Kieltäydy",
  },
  en: {
    body: "We use analytics cookies (Google Analytics) to understand how the site is used and improve it. You can accept or decline.",
    privacy: "Privacy policy",
    accept: "Accept",
    decline: "Decline",
  },
  uk: {
    body: "We use analytics cookies (Google Analytics) to understand how the site is used and improve it. You can accept or decline.",
    privacy: "Privacy policy",
    accept: "Accept",
    decline: "Decline",
  },
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function sendConsent(choice: Choice) {
  window.dataLayer = window.dataLayer || []
  // Must push an `arguments` object, same as the gtag snippet does.
  // eslint-disable-next-line prefer-rest-params
  const gtag = window.gtag ?? function () { window.dataLayer!.push(arguments) }
  gtag("consent", "update", { analytics_storage: choice })
}

export function CookieConsent() {
  const pathname = usePathname() || "/"
  const [open, setOpen] = useState(false)

  const seg = pathname.split("/")[1]
  const lang: Lang = seg === "en" || seg === "uk" ? seg : "fi"
  const isAdmin = seg === "admin"

  useEffect(() => {
    let stored: string | null = null
    try { stored = localStorage.getItem(CONSENT_STORAGE_KEY) } catch {}
    if (stored !== "granted" && stored !== "denied") setOpen(true)

    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  if (!open || isAdmin) return null

  const choose = (choice: Choice) => {
    try { localStorage.setItem(CONSENT_STORAGE_KEY, choice) } catch {}
    sendConsent(choice)
    setOpen(false)
  }

  const t = TEXT[lang]

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 md:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-[960px] mx-auto bg-white border border-[#E5E8F0] rounded-2xl shadow-[0_8px_32px_rgba(45,23,131,0.18)] p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="material-symbols-outlined text-[#2D1783] text-[22px] shrink-0" aria-hidden="true">cookie</span>
          <p className="text-sm text-[#1b1b1c] leading-relaxed">
            {t.body}{" "}
            <Link prefetch={false} href={`/${lang}/privacy`} className="text-[#2D1783] font-semibold underline underline-offset-2">
              {t.privacy}
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-[#E5E8F0] text-sm font-bold text-[#1b1b1c] hover:bg-[#F8F9FD] transition-colors"
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#2D1783] text-sm font-bold text-white hover:bg-[#3d22a8] transition-colors"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={className}
    >
      {label}
    </button>
  )
}
