import Link from "next/link"
import type { Lang } from "@/lib/types"

const HELP_ORGS = [
  {
    name: "Peluuri",
    desc: "Suomalainen peliongelmien auttamislinja. Maksuton ja luottamuksellinen.",
    href: "https://www.peluuri.fi",
    phone: "0800 100 101",
    tag: "Suomi",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    name: "A-klinikka",
    desc: "Päihde- ja riippuvuushoitoon erikoistunut palvelu.",
    href: "https://www.a-klinikka.fi",
    phone: null,
    tag: "Suomi",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    name: "BeGambleAware",
    desc: "Puolueetonta tietoa ja tukea peliongelmiin.",
    href: "https://www.begambleaware.org",
    phone: "0808 8020 133",
    tag: "UK",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    name: "GamStop",
    desc: "Itsepoissuljentapalvelu kaikille UKGC-lisensoiduille kasinoille.",
    href: "https://www.gamstop.co.uk",
    phone: null,
    tag: "UK",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
]

const PROBLEM_SIGNS = [
  "Pelaat enemmän rahaa kuin olet suunnitellut",
  "Yrität voittaa takaisin häviämäsi rahat",
  "Pelaaminen häiritsee työtäsi tai perhettäsi",
  "Tunnet ahdistusta tai ärtyneisyyttä, kun et pysty pelaamaan",
  "Lainaat rahaa pelataksesi tai maksat pelivelkoja",
  "Piilotat pelaamistasi läheisiltäsi",
  "Pelaamisesi on lisääntynyt ajan myötä",
  "Unohdat syödä tai nukkua pelaamisen vuoksi",
]

const TOOLS = [
  { icon: "payments", title: "Talletusraja", desc: "Aseta päivittäinen, viikottainen tai kuukausittainen talletusraja kasinon asetuksissa rajoittaaksesi menojasi." },
  { icon: "timer", title: "Aikaraja", desc: "Monet kasinot tarjoavat mahdollisuuden asettaa aikarajan peliistunnoille. Käytä tätä pitääksesi pelaamisen hallinnassa." },
  { icon: "block", title: "Itsepoissuljenta", desc: "Voit sulkea tilisi tilapäisesti tai pysyvästi — välittömästi voimaan tuleva, yleensä 24 tuntia tai pidempään." },
  { icon: "visibility_off", title: "Todellisuustarkistus", desc: "Automaattiset muistutukset kertovat kuinka kauan olet pelannut ja kuinka paljon olet käyttänyt." },
]

export default function ResponsibleGamblingPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang as Lang) || "fi"

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Alert banner */}
      <div className="bg-[#27AE60] text-white py-2.5 text-center">
        <p className="text-sm font-semibold">
          Tarvitsetko apua nyt?{" "}
          <a href="tel:0800100101" className="underline font-bold hover:text-white/80">
            Soita Peluuriin: 0800 100 101
          </a>
          {" "}— maksuton ja luottamuksellinen
        </p>
      </div>

      {/* Header */}
      <header className="bg-[#1b1b1c] text-white pt-10 pb-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <p className="text-[#27AE60] text-xs font-bold uppercase tracking-widest mb-2">Vastuullinen pelaaminen</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance max-w-xl leading-snug">
            Pelaa turvallisesti — tunne rajasi
          </h1>
          <p className="text-white/70 text-sm mt-3 max-w-2xl leading-relaxed">
            Rahapelaaminen on viihde, ei ansiokeino. Kaikki alla olevat tiedot on tarkoitettu auttamaan sinua pelaamaan vastuullisesti ja tunnistamaan mahdolliset ongelmat ajoissa.
          </p>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10 space-y-10">
        {/* Self-exclusion tools */}
        <section>
          <h2 className="font-display font-bold text-2xl text-[#1b1b1c] mb-2">Itsesäätelytyökalut</h2>
          <p className="text-sm text-[#787585] mb-5">Kaikki luotettavat nettikasinot tarjoavat nämä työkalut. Löydät ne yleensä kasino-tilisi asetuksista.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool) => (
              <div key={tool.title} className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
                <div className="w-10 h-10 bg-[#27AE60]/10 rounded-xl flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[#27AE60] text-2xl" aria-hidden="true">{tool.icon}</span>
                </div>
                <h3 className="font-display font-bold text-sm text-[#1b1b1c] mb-1">{tool.title}</h3>
                <p className="text-xs text-[#787585] leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Problem signs */}
        <section className="bg-white rounded-2xl border border-[#E5E8F0] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-orange-500 text-2xl" aria-hidden="true">warning</span>
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-1">Ongelmapelaamisen merkit</h2>
              <p className="text-sm text-[#787585] mb-4">Jos tunnistat itsessäsi useita alla olevista merkeistä, harkitse yhteydenottoa Peluuriin.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROBLEM_SIGNS.map((sign, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-orange-500 text-[12px]" aria-hidden="true">priority_high</span>
                    </div>
                    <p className="text-sm text-[#474554] leading-relaxed">{sign}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://www.peluuri.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#27AE60] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#219a52] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">support_agent</span>
              Ota yhteyttä Peluuriin
            </a>
            <a
              href="tel:0800100101"
              className="inline-flex items-center gap-2 bg-white border border-[#E5E8F0] text-[#1b1b1c] font-bold text-sm px-5 py-2.5 rounded-full hover:border-[#27AE60] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-[#27AE60]" aria-hidden="true">call</span>
              0800 100 101
            </a>
          </div>
        </section>

        {/* Deposit limits info */}
        <section>
          <h2 className="font-display font-bold text-2xl text-[#1b1b1c] mb-5">Talletusrajojen asettaminen</h2>
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E5E8F0]">
              <p className="text-sm text-[#474554] leading-relaxed">
                Talletusrajojen asettaminen on yksi tehokkaimmista tavoista pitää pelaaminen hallinnassa. Kaikki MGA- ja UKGC-lisensoidut kasinot ovat velvoitettuja tarjoamaan tämän ominaisuuden.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E8F0]">
              {[
                { period: "Päiväraja", desc: "Rajoittaa päivittäisen talletuksen määrää. Tulee voimaan välittömästi." },
                { period: "Viikoraja", desc: "Rajoittaa viikottaista talletuksen määrää. Tulee voimaan heti." },
                { period: "Kuukausiraja", desc: "Rajoittaa kuukausittaista talletusta. Voimaan 24 tunnin kuluttua." },
              ].map((r) => (
                <div key={r.period} className="p-5">
                  <div className="w-8 h-8 bg-[#2D1783]/10 rounded-lg flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[#2D1783] text-[18px]" aria-hidden="true">calendar_month</span>
                  </div>
                  <p className="font-bold text-sm text-[#1b1b1c]">{r.period}</p>
                  <p className="text-xs text-[#787585] mt-1 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Help organizations */}
        <section>
          <h2 className="font-display font-bold text-2xl text-[#1b1b1c] mb-5">Auttavat organisaatiot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HELP_ORGS.map((org) => (
              <a
                key={org.name}
                href={org.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-[#E5E8F0] p-5 hover:border-[#27AE60]/40 hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-[#27AE60]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#27AE60] text-2xl" aria-hidden="true">health_and_safety</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-bold text-sm text-[#1b1b1c]">{org.name}</p>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${org.tagColor}`}>{org.tag}</span>
                  </div>
                  <p className="text-xs text-[#787585] leading-relaxed">{org.desc}</p>
                  {org.phone && (
                    <p className="text-xs font-bold text-[#27AE60] mt-1.5">
                      <span className="material-symbols-outlined text-[12px] align-middle mr-0.5" aria-hidden="true">call</span>
                      {org.phone}
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined text-[#787585] text-[18px] flex-shrink-0 mt-0.5" aria-hidden="true">open_in_new</span>
              </a>
            ))}
          </div>
        </section>

        {/* 18+ disclaimer */}
        <section className="bg-[#1b1b1c] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-white text-lg">18+</span>
            </div>
            <h2 className="font-display font-bold text-xl text-white">Vain täysi-ikäisille</h2>
          </div>
          <p className="text-white/70 text-sm leading-relaxed max-w-2xl">
            Rahapelaaminen on tarkoitettu vain 18 vuotta täyttäneille. Kaikki SlotsBandin suosittelemat kasinot vaativat iän todentamista rekisteröinnin yhteydessä. Emme koskaan suosittele kasinoita, jotka eivät valvo ikärajoja tiukasti.
          </p>
        </section>
      </div>
      <div className="pb-12" />
    </div>
  )
}
