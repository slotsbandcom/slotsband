"use client"

import { useState } from "react"
import type { Lang } from "@/lib/types"

const SUBJECTS = [
  "Kasinoarvostelu",
  "Bonusongelma",
  "Affiliate-yhteistyö",
  "Tekninen ongelma",
  "Muu kysymys",
]

const SOCIALS = [
  { label: "Telegram", icon: "send", href: "#" },
  { label: "Instagram", icon: "photo_camera", href: "#" },
  { label: "YouTube", icon: "smart_display", href: "#" },
]

export default function ContactPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang as Lang) || "fi"
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Header */}
      <header className="bg-[#2D1783] text-white pt-10 pb-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2">Ota yhteyttä</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance">Meillä on vastauksia kysymyksiisi</h1>
          <p className="text-white/70 text-sm mt-2 max-w-lg leading-relaxed">
            Otamme yhteyttä yleensä 24 tunnin sisällä arkisin. Kiireellisissä asioissa Telegram on nopein kanava.
          </p>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6 md:p-8">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#27AE60]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[#27AE60] text-4xl" aria-hidden="true">check_circle</span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-2">Viesti lähetetty!</h2>
                  <p className="text-sm text-[#787585]">Otamme sinuun yhteyttä mahdollisimman pian, viimeistään 24 tunnin kuluessa.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }) }}
                    className="mt-5 text-[#2D1783] text-sm font-bold hover:underline"
                  >
                    Lähetä uusi viesti
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-2">Lähetä viesti</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-[11px] font-bold text-[#787585] uppercase tracking-wide block mb-1.5">Nimi *</label>
                      <input
                        id="name" type="text" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Etunimi Sukunimi"
                        className="w-full border border-[#E5E8F0] focus:border-[#2D1783] rounded-xl px-3 py-2.5 text-sm text-[#1b1b1c] outline-none placeholder:text-[#b0b0b8] transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-[11px] font-bold text-[#787585] uppercase tracking-wide block mb-1.5">Sähköposti *</label>
                      <input
                        id="email" type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="sinä@example.com"
                        className="w-full border border-[#E5E8F0] focus:border-[#2D1783] rounded-xl px-3 py-2.5 text-sm text-[#1b1b1c] outline-none placeholder:text-[#b0b0b8] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="text-[11px] font-bold text-[#787585] uppercase tracking-wide block mb-1.5">Aihe *</label>
                    <select
                      id="subject" required value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-[#E5E8F0] focus:border-[#2D1783] rounded-xl px-3 py-2.5 text-sm text-[#1b1b1c] outline-none bg-white transition-colors"
                    >
                      <option value="">Valitse aihe...</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="text-[11px] font-bold text-[#787585] uppercase tracking-wide block mb-1.5">Viesti *</label>
                    <textarea
                      id="message" required rows={5} value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Kerro meille, kuinka voimme auttaa..."
                      className="w-full border border-[#E5E8F0] focus:border-[#2D1783] rounded-xl px-3 py-2.5 text-sm text-[#1b1b1c] outline-none resize-none placeholder:text-[#b0b0b8] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#2D1783] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#3e2db2] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">send</span>
                    Lähetä viesti
                  </button>
                  <p className="text-[10px] text-[#787585] text-center">Vastaamiseen menee yleensä 1–24 tuntia arkisin.</p>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            {/* Response time */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
              <h3 className="font-display font-bold text-sm text-[#1b1b1c] mb-3">Vasteaika</h3>
              <div className="space-y-2">
                {[
                  { channel: "Sähköposti", time: "1–24 h", icon: "mail" },
                  { channel: "Telegram", time: "1–4 h", icon: "send" },
                  { channel: "Lomake", time: "1–24 h", icon: "contact_page" },
                ].map((c) => (
                  <div key={c.channel} className="flex items-center justify-between bg-[#F8F9FD] rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#2D1783] text-[16px]" aria-hidden="true">{c.icon}</span>
                      <span className="text-xs font-semibold text-[#1b1b1c]">{c.channel}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#27AE60]">{c.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social media */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
              <h3 className="font-display font-bold text-sm text-[#1b1b1c] mb-3">Seuraa meitä</h3>
              <div className="space-y-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F9FD] transition-colors group"
                  >
                    <div className="w-8 h-8 bg-[#2D1783]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#2D1783]/20 transition-colors">
                      <span className="material-symbols-outlined text-[#2D1783] text-[16px]" aria-hidden="true">{s.icon}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1b1b1c]">{s.label}</span>
                    <span className="material-symbols-outlined text-[#787585] text-[14px] ml-auto" aria-hidden="true">arrow_forward</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="bg-[#2D1783] rounded-2xl p-5">
              <span className="material-symbols-outlined text-[#FFD700] text-2xl block mb-2" aria-hidden="true">mail</span>
              <p className="font-bold text-white text-sm">Sähköposti</p>
              <a href="mailto:info@slotsband.com" className="text-white/70 text-xs hover:text-white transition-colors mt-0.5 block">
                info@slotsband.com
              </a>
            </div>
          </aside>
        </div>
      </div>
      <div className="pb-12" />
    </div>
  )
}
