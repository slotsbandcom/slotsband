import Link from "next/link"
import type { Lang } from "@/lib/types"

interface Section {
  h2: string
  paragraphs?: string[]
  list?: string[]
  note?: string
}

const CONTENT: Record<Lang, { home: string; title: string; updated: string; sections: Section[] }> = {
  fi: {
    home: "Etusivu",
    title: "Käyttöehdot",
    updated: "Päivitetty: heinäkuu 2026",
    sections: [
      {
        h2: "1. Palvelun kuvaus",
        paragraphs: [
          "SlotsBand (slotsband.com) on riippumaton nettikasinoiden vertailu- ja tietosivusto. Emme ole rahapelioperaattori emmekä tarjoa rahapelipalveluita suoraan. Sivustomme tarjoaa tietoa, arvosteluja ja vertailua auttaaksemme pelaajia tekemään tietoon perustuvia päätöksiä.",
          "SlotsBand ei ole vastuussa pelituloksista eikä kasinoilla tapahtuvista transaktioista.",
        ],
      },
      {
        h2: "2. Ehtojen hyväksyminen",
        paragraphs: [
          "Käyttämällä sivustoamme hyväksyt nämä käyttöehdot kokonaisuudessaan. Mikäli et hyväksy jotakin ehtoa, lopeta sivuston käyttö välittömästi. Pidätämme oikeuden päivittää näitä ehtoja milloin tahansa ilman ennakkoilmoitusta — jatkamalla sivuston käyttöä hyväksyt kulloinkin voimassa olevat ehdot.",
        ],
      },
      {
        h2: "3. Tietojen oikeellisuus ja vastuuvapauslauseke",
        paragraphs: [
          "Pyrimme pitämään sivuston tiedot ajantasaisina ja paikkansapitävinä, mutta emme takaa niiden täydellisyyttä, virheettömyyttä tai soveltuvuutta tiettyyn tarkoitukseen. Kasinotarjoukset, bonusehdot, lisenssitiedot ja muut tiedot voivat muuttua ilman etukäteisilmoitusta.",
          "Tarkista aina tiedot suoraan kasinos sivustolta ennen rekisteröitymistä. SlotsBand ei vastaa tietojen virheellisyydestä aiheutuneista vahingoista.",
        ],
      },
      {
        h2: "4. Affiliate-linkit ja kaupalliset yhteistyöt",
        paragraphs: [
          "Sivustomme sisältää affiliate-linkkejä kumppanikasinoihimme. Saamme komission, kun käyttäjä rekisteröityy ja tekee talletuksen kasinolle linkkimme kautta. Tämä rahoittaa sivuston toiminnan.",
          "Kaupalliset yhteistyöt eivät vaikuta arviointeihimme tai sisältömme riippumattomuuteen. Arvioimme kasinot objektiivisten kriteerien perusteella riippumatta affiliate-sopimuksista. Affiliate-yhteistyöt eivät takaa pääsyä kasinolle, voittoja tai erityiskohtelua.",
        ],
        note: "Kaikki affiliate-linkit on merkitty asianmukaisesti. Kasinot asettavat omat ehtonsa rekisteröitymiselle ja bonuksille.",
      },
      {
        h2: "5. Ikärajoitukset",
        paragraphs: [
          "Sivusto on suunnattu ainoastaan täysi-ikäisille henkilöille (18+). Alaikäisten käyttö on ehdottomasti kielletty. Jos olet alle 18-vuotias, lopeta sivuston käyttö välittömästi.",
          "Emme tietoisesti salli alaikäisille pääsyä sivustollemme emmekä kerää heidän tietojaan. Jos havaitsemme alaikäisen rekisteröitymisen, poistamme tiedot välittömästi.",
        ],
      },
      {
        h2: "6. Vastuullinen pelaaminen",
        paragraphs: [
          "Rahapelaaminen voi aiheuttaa riippuvuutta. Pelaa aina vastuullisesti ja ainoastaan sellaisilla summilla, joiden häviämistä voit varaa. Aseta itsellesi talletusrajat ja pidä taukoja.",
          "Jos koet, että rahapelaamisesta on tullut ongelma, pyydämme sinua hakemaan apua:",
        ],
        list: [
          "Peluuri – maksuton tuki- ja neuvontapalvelu suomalaisille pelaajille: peluuri.fi ja puhelin 0800 100 101",
          "Rahapeliongelmien hoito – terveydenhuolto ja A-klinikkasäätiö",
          "Kaikki suomalaiset rahapelioperaattorit tarjoavat mahdollisuuden asettaa pelirajoja ja estää oma pelaaminen",
        ],
      },
      {
        h2: "7. Immateriaalioikeudet",
        paragraphs: [
          "Kaikki sivuston sisältö — tekstit, kuvat, logot, grafiikka ja muu materiaali — on SlotsBandin omaisuutta tai käytetty asianmukaisella luvalla. Sisällön kopioiminen, jakaminen, muokkaaminen tai käyttäminen kaupallisiin tarkoituksiin ilman kirjallista lupaämme on kielletty.",
          "Linkkien lisääminen sivustollemme on sallittua, kunhan ne eivät johda harhaan tai vahingoita mainettamme.",
        ],
      },
      {
        h2: "8. Vastuunrajoitus",
        paragraphs: ["SlotsBand ei ole vastuussa mistään suorista, välillisistä tai epäsuorista vahingoista, jotka johtuvat:"],
        list: [
          "Sivuston tietojen perusteella tehdyistä päätöksistä tai niiden seurauksista",
          "Rahapelaamisesta aiheutuneista taloudellisista tappioista",
          "Kolmansien osapuolten (kasinoiden) toiminnasta, palveluista tai sisällöstä",
          "Sivuston tilapäisestä käyttökatkoksesta tai teknisistä virheistä",
          "Virheellisistä tai vanhentuneista tiedoista sivustollamme",
        ],
        note: "Sivusto ja sen sisältö tarjotaan \"sellaisenaan\" ilman minkäänlaisia takuita. Käytät sivustoa omalla vastuullasi.",
      },
      {
        h2: "9. Kolmansien osapuolten sivustot",
        paragraphs: [
          "Sivustomme sisältää linkkejä ulkopuolisille verkkosivustoille. Emme ole vastuussa näiden sivustojen sisällöstä, tietosuojakäytännöistä tai toiminnasta. Linkit tarjotaan ainoastaan käyttömukavuuden vuoksi.",
        ],
      },
      {
        h2: "10. Muutokset käyttöehtoihin",
        paragraphs: [
          "Voimme päivittää näitä käyttöehtoja milloin tahansa. Merkittävistä muutoksista ilmoitamme sivustollamme tai sähköpostitse. Jatkamalla sivuston käyttöä muutosten jälkeen hyväksyt päivitetyt ehdot.",
        ],
      },
      {
        h2: "11. Sovellettava laki ja riitojen ratkaisu",
        paragraphs: [
          "Näihin käyttöehtoihin sovelletaan Suomen lakia. Mahdolliset erimielisyydet pyritään ratkaisemaan ensisijaisesti neuvottelemalla. Mikäli sovintoa ei saavuteta, riidat ratkaistaan Helsingin käräjäoikeudessa.",
        ],
      },
      {
        h2: "12. Yhteystiedot",
        paragraphs: [
          "Käyttöehtoihin liittyvissä kysymyksissä ota yhteyttä: info@slotsband.com tai käytä yhteydenottolomakettamme.",
        ],
      },
    ],
  },

  en: {
    home: "Home",
    title: "Terms & Conditions",
    updated: "Last updated: July 2026",
    sections: [
      {
        h2: "1. About SlotsBand",
        paragraphs: [
          "SlotsBand (slotsband.com) is an independent online casino comparison and information website. We are not a gambling operator and do not provide gambling services directly. Our site provides information, reviews, and comparisons to help players make informed decisions.",
          "SlotsBand is not responsible for gambling outcomes or transactions conducted at casinos.",
        ],
      },
      {
        h2: "2. Acceptance of terms",
        paragraphs: [
          "By using our website, you agree to these Terms & Conditions in full. If you disagree with any part of these terms, please stop using the site immediately. We reserve the right to update these terms at any time without prior notice — continued use of the site constitutes acceptance of the current terms.",
        ],
      },
      {
        h2: "3. Accuracy of information and disclaimer",
        paragraphs: [
          "We strive to keep the information on our site accurate and up to date, but we make no guarantees as to its completeness, accuracy, or suitability for any particular purpose. Casino offers, bonus terms, licence details, and other information may change without notice.",
          "Always verify information directly with the casino before registering. SlotsBand is not liable for any damages resulting from inaccurate information on this site.",
        ],
      },
      {
        h2: "4. Affiliate links and commercial relationships",
        paragraphs: [
          "Our site contains affiliate links to partner casinos. We may earn a commission when a user registers and makes a deposit at a casino via our link. This is how we fund the operation of this site.",
          "Commercial relationships do not influence our reviews or editorial independence. We evaluate casinos against objective criteria regardless of affiliate arrangements. Affiliate relationships do not guarantee access to any casino, winnings, or preferential treatment.",
        ],
        note: "All affiliate links are appropriately disclosed. Casinos set their own terms for registration and bonuses.",
      },
      {
        h2: "5. Age restrictions",
        paragraphs: [
          "This site is intended exclusively for adults aged 18 and over. Use by minors is strictly prohibited. If you are under 18, please leave this site immediately.",
          "We do not knowingly permit minors to access our site or collect their data. If we become aware of a minor's registration, we will remove the data immediately.",
        ],
      },
      {
        h2: "6. Responsible gambling",
        paragraphs: [
          "Gambling can be addictive. Always gamble responsibly and only with money you can afford to lose. Set yourself deposit limits and take regular breaks.",
          "If you feel that gambling has become a problem, please seek help:",
        ],
        list: [
          "GamCare – free support and counselling for problem gamblers: gamcare.org.uk",
          "Gamblers Anonymous – peer support groups: gamblersanonymous.org.uk",
          "All licensed casinos offer tools to set deposit limits, cooling-off periods, and self-exclusion",
        ],
      },
      {
        h2: "7. Intellectual property",
        paragraphs: [
          "All content on this site — text, images, logos, graphics, and other material — is owned by SlotsBand or used with appropriate permission. Copying, distributing, modifying, or using any content for commercial purposes without our written consent is prohibited.",
          "Linking to our site is permitted, provided it does not mislead users or damage our reputation.",
        ],
      },
      {
        h2: "8. Limitation of liability",
        paragraphs: ["SlotsBand is not liable for any direct, indirect, or consequential damages arising from:"],
        list: [
          "Decisions made based on information on this site or their consequences",
          "Financial losses arising from gambling",
          "The actions, services, or content of third-party casinos",
          "Temporary unavailability of the site or technical errors",
          "Inaccurate or outdated information on our site",
        ],
        note: "The site and its content are provided \"as is\" without warranties of any kind. You use this site at your own risk.",
      },
      {
        h2: "9. Third-party websites",
        paragraphs: [
          "Our site contains links to external websites. We are not responsible for the content, privacy policies, or conduct of those sites. Links are provided solely for convenience.",
        ],
      },
      {
        h2: "10. Changes to these terms",
        paragraphs: [
          "We may update these Terms & Conditions at any time. Significant changes will be announced on our website or by email. Continued use of the site after changes constitutes acceptance of the updated terms.",
        ],
      },
      {
        h2: "11. Governing law and dispute resolution",
        paragraphs: [
          "These Terms & Conditions are governed by Finnish law. We will seek to resolve any disputes through negotiation in the first instance. If no resolution is reached, disputes shall be settled in the courts of Helsinki, Finland.",
        ],
      },
      {
        h2: "12. Contact",
        paragraphs: [
          "For enquiries regarding these terms, contact us at: info@slotsband.com or use the contact form on our website.",
        ],
      },
    ],
  },

  uk: {
    home: "Home",
    title: "Terms & Conditions",
    updated: "Last updated: July 2026",
    sections: [
      {
        h2: "1. About SlotsBand",
        paragraphs: [
          "SlotsBand (slotsband.com) is an independent online casino comparison and information website. We are not a gambling operator and do not provide gambling services directly. Our site provides information, reviews, and comparisons to help UK players make informed decisions.",
          "SlotsBand is not responsible for gambling outcomes or transactions conducted at casinos.",
        ],
      },
      {
        h2: "2. Acceptance of terms",
        paragraphs: [
          "By using our website, you agree to these Terms & Conditions in full. If you disagree with any part of these terms, please stop using the site immediately. We reserve the right to update these terms at any time without prior notice — continued use of the site constitutes acceptance of the current terms.",
        ],
      },
      {
        h2: "3. Accuracy of information and disclaimer",
        paragraphs: [
          "We strive to keep the information on our site accurate and up to date, but we make no guarantees as to its completeness, accuracy, or suitability for any particular purpose. Casino offers, bonus terms, licence details, and other information may change without notice.",
          "Always verify information directly with the casino before registering. SlotsBand is not liable for any damages resulting from inaccurate information on this site.",
        ],
      },
      {
        h2: "4. Affiliate links and commercial relationships",
        paragraphs: [
          "Our site contains affiliate links to partner casinos. We may earn a commission when a user registers and makes a deposit at a casino via our link. This is how we fund the operation of this site.",
          "Commercial relationships do not influence our reviews or editorial independence. We evaluate casinos against objective criteria regardless of affiliate arrangements. Affiliate relationships do not guarantee access to any casino, winnings, or preferential treatment.",
        ],
        note: "All affiliate links are appropriately disclosed in line with ASA guidelines. Casinos set their own terms for registration and bonuses.",
      },
      {
        h2: "5. Age restrictions",
        paragraphs: [
          "This site is intended exclusively for adults aged 18 and over. Use by minors is strictly prohibited. If you are under 18, please leave this site immediately.",
          "We do not knowingly permit minors to access our site or collect their data. If we become aware of a minor's registration, we will remove the data immediately.",
        ],
      },
      {
        h2: "6. Responsible gambling",
        paragraphs: [
          "Gambling can be addictive. Always gamble responsibly and only with money you can afford to lose. Set yourself deposit limits and take regular breaks. Use GamStop to self-exclude from all UKGC-licensed gambling sites.",
          "If you feel that gambling has become a problem, please seek help:",
        ],
        list: [
          "BeGambleAware – free support and resources: begambleaware.org or 0808 8020 133",
          "GamCare – free counselling and support: gamcare.org.uk or 0808 8020 133",
          "GamStop – free UK-wide self-exclusion scheme: gamstop.co.uk",
          "Gamblers Anonymous – peer support groups: gamblersanonymous.org.uk",
        ],
      },
      {
        h2: "7. Intellectual property",
        paragraphs: [
          "All content on this site — text, images, logos, graphics, and other material — is owned by SlotsBand or used with appropriate permission. Copying, distributing, modifying, or using any content for commercial purposes without our written consent is prohibited.",
          "Linking to our site is permitted, provided it does not mislead users or damage our reputation.",
        ],
      },
      {
        h2: "8. Limitation of liability",
        paragraphs: ["SlotsBand is not liable for any direct, indirect, or consequential damages arising from:"],
        list: [
          "Decisions made based on information on this site or their consequences",
          "Financial losses arising from gambling",
          "The actions, services, or content of third-party casinos",
          "Temporary unavailability of the site or technical errors",
          "Inaccurate or outdated information on our site",
        ],
        note: "The site and its content are provided \"as is\" without warranties of any kind. You use this site at your own risk.",
      },
      {
        h2: "9. Third-party websites",
        paragraphs: [
          "Our site contains links to external websites. We are not responsible for the content, privacy policies, or conduct of those sites. Links are provided solely for convenience.",
        ],
      },
      {
        h2: "10. Changes to these terms",
        paragraphs: [
          "We may update these Terms & Conditions at any time. Significant changes will be announced on our website or by email. Continued use of the site after changes constitutes acceptance of the updated terms.",
        ],
      },
      {
        h2: "11. Governing law and dispute resolution",
        paragraphs: [
          "These Terms & Conditions are governed by the laws of England and Wales. We will seek to resolve any disputes through negotiation in the first instance. If no resolution is reached, disputes shall be settled in the courts of England and Wales.",
        ],
      },
      {
        h2: "12. Contact",
        paragraphs: [
          "For enquiries regarding these terms, contact us at: info@slotsband.com or use the contact form on our website.",
        ],
      },
    ],
  },
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang = (rawLang as Lang) || "fi"
  const c = CONTENT[lang] ?? CONTENT.fi

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <div className="bg-white border-b border-[#E5E8F0]">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 pt-6 pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6879] mb-5">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">{c.home}</Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">{c.title}</span>
          </nav>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-[#1b1b1c] mb-2">{c.title}</h1>
          <p className="text-xs text-[#6B6879]">{c.updated}</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6 md:p-10 space-y-8">
          {c.sections.map((section) => (
            <section key={section.h2}>
              <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-3">{section.h2}</h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="text-sm text-[#474554] leading-relaxed mb-3">{p}</p>
              ))}
              {section.list && (
                <ul className="space-y-1.5 mb-3 ml-4">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#474554] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D1783] flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.note && (
                <p className="text-xs text-[#6B6879] bg-[#F8F9FD] rounded-xl px-4 py-3 border border-[#E5E8F0]">{section.note}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
