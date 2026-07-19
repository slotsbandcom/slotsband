import Link from "next/link"
import type { Lang } from "@/lib/types"

const TEAM = [
  { name: "Mikko Leinonen", role: "Päätoimittaja & kasinoasiantuntija", years: 8, avatar: "M", bg: "bg-[#2D1783]" },
  { name: "Laura Virtanen", role: "Bonus-asiantuntija", years: 6, avatar: "L", bg: "bg-[#27AE60]" },
  { name: "Jari Mäkinen", role: "Tekninen analyytikko", years: 5, avatar: "J", bg: "bg-[#1b1b1c]" },
  { name: "Anna Korhonen", role: "Vastuullisen pelaamisen toimittaja", years: 4, avatar: "A", bg: "bg-[#c2410c]" },
]

const METHODOLOGY = [
  { icon: "casino", title: "Lisenssin tarkistus", desc: "Tarkistamme jokaisen kasinon lisenssin luotettavuuden — suosimme MGA- ja UKGC-lisenssejä verovapaan pelaamisen vuoksi." },
  { icon: "payments", title: "Kotiutukset testattu", desc: "Teimme oikeita kotiutuksia jokaisesta kasinosta. Mittaamme todelliset kotiutusajat, ei markkinoituja aikoja." },
  { icon: "redeem", title: "Bonusehtojen läpikäynti", desc: "Luemme bonusehdot sanasta sanaan ja pisteytämme kierrätysvaatimukset, aikarajoitukset ja muut ehdot." },
  { icon: "smartphone", title: "Mobiilikokemus", desc: "Testaamme jokaisen kasinon sekä Android- että iOS-laitteilla saadaksemme realistisen mobiilikokemuksen." },
  { icon: "support_agent", title: "Asiakastuki", desc: "Otamme yhteyttä asiakastukeen useilla kysymyksillä arvioidaksemme vasteajan ja asiantuntemuksen." },
  { icon: "security", title: "Tietoturva", desc: "Tarkistamme SSL-salauksen, tietosuojakäytännöt ja vastuullisen pelaamisen työkalut jokaisen arvostelun yhteydessä." },
]

const TRUST_SIGNALS = [
  { value: "400+", label: "Arvosteltua kasinoa" },
  { value: "8+", label: "Vuotta kokemusta" },
  { value: "150k+", label: "Kuukausittaista kävijää" },
  { value: "100%", label: "Puolueeton" },
]

export default function AboutPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang as Lang) || "fi"

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Header */}
      <header className="bg-[#2D1783] text-white pt-10 pb-14 md:pt-14 md:pb-18">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2">Tietoa meistä</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance max-w-xl leading-snug">
            Suomen luotetuin nettikasinoiden vertailusivusto
          </h1>
          <p className="text-white/70 text-sm mt-3 max-w-2xl leading-relaxed">
            SlotsBand on perustettu 2018 auttamaan suomalaisia pelaajia löytämään turvallisimmat, luotettavimmat ja parhaiten bonuksia tarjoavat nettikasinot.
          </p>
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {TRUST_SIGNALS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-2xl text-[#FFD700]">{s.value}</p>
                <p className="text-white/60 text-[10px] uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10 space-y-12">
        {/* Team */}
        <section>
          <h2 className="font-display font-bold text-2xl text-[#1b1b1c] mb-6">Tiimimme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl border border-[#E5E8F0] p-5 text-center hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-white font-display font-bold text-2xl">{m.avatar}</span>
                </div>
                <p className="font-display font-bold text-sm text-[#1b1b1c]">{m.name}</p>
                <p className="text-xs text-[#787585] mt-0.5 leading-snug">{m.role}</p>
                <p className="text-[10px] text-[#2D1783] font-bold mt-2 uppercase tracking-wide">{m.years} vuoden kokemus</p>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-[#1b1b1c]">Arviointimetodologia</h2>
              <p className="text-sm text-[#787585] mt-1">Näin arvioimme kasinot — läpinäkyvästi ja rehellisesti.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {METHODOLOGY.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-[#2D1783]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#2D1783] text-[20px]" aria-hidden="true">{item.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#1b1b1c]">{item.title}</h3>
                </div>
                <p className="text-sm text-[#787585] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust signals / editorial standards */}
        <section className="bg-white rounded-2xl border border-[#E5E8F0] p-6 md:p-8">
          <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-4">Toimitukselliset standardimme</h2>
          <div className="space-y-3">
            {[
              "Emme koskaan ota maksua arvostelujärjestyksestä — sijoitukset perustuvat ainoastaan pisteytykseen.",
              "Kaikki arvostelut perustuvat todellisiin, tiimimme suorittamiin testeihin.",
              "Päivitämme arvostelut säännöllisesti varmistaaksemme ajantasaisuuden.",
              "Raportoimme kaikki bonusehtojen muutokset välittömästi.",
              "Affiliate-linkit rahoittavat sivuston, mutta eivät vaikuta arviointeihin.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#27AE60]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[#27AE60] text-[13px]" aria-hidden="true">check</span>
                </div>
                <p className="text-sm text-[#474554] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA to contact */}
        <div className="text-center bg-[#2D1783] rounded-2xl p-8 md:p-10">
          <h3 className="font-display font-bold text-xl text-white mb-2">Onko sinulla kysyttävää?</h3>
          <p className="text-white/70 text-sm mb-5">Tiimimme vastaa mielellään kasinoihin, bonuksiin tai sivustoomme liittyviin kysymyksiin.</p>
          <Link
            href={`/${lang}/contact`}
            className="inline-flex items-center gap-2 bg-[#FFD700] text-[#2D1783] font-bold text-sm px-6 py-3 rounded-full hover:bg-[#FFE866] active:scale-95 transition-all"
          >
            Ota yhteyttä
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </div>
      <div className="pb-12" />
    </div>
  )
}
