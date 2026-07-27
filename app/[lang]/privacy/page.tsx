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
    title: "Tietosuojakäytäntö",
    updated: "Päivitetty: heinäkuu 2026",
    sections: [
      {
        h2: "1. Johdanto",
        paragraphs: [
          "SlotsBand (slotsband.com) on sitoutunut suojaamaan käyttäjiensä henkilötietoja. Tämä tietosuojakäytäntö kuvaa, miten keräämme, käytämme ja suojaamme tietojasi, kun käytät sivustoamme.",
          "Käsittelemme henkilötietoja EU:n yleisen tietosuoja-asetuksen (GDPR, 2016/679) mukaisesti. Käyttämällä sivustoamme hyväksyt tässä kuvatut käytännöt.",
        ],
      },
      {
        h2: "2. Kerättävät tiedot",
        paragraphs: ["Keräämme seuraavia tietoja sivustokäyntiesi yhteydessä:"],
        list: [
          "Lokitiedot: IP-osoite, selaintyyppi, käyttöjärjestelmä, vieraillut sivut ja vierailuaika",
          "Yhteydenottolomakkeen tiedot: nimi, sähköpostiosoite ja viesti",
          "Evästetiedot: tekniset evästeet ja analytiikkaevästeet",
          "Lähdetieto: mistä saavuit sivustolle (hakukone, suora linkki, sosiaalinen media)",
        ],
        note: "Emme kerää arkaluonteisia henkilötietoja, kuten maksu- tai terveystietoja.",
      },
      {
        h2: "3. Tietojen käyttötarkoitukset",
        paragraphs: ["Käytämme keräämäämme tietoa seuraaviin tarkoituksiin:"],
        list: [
          "Sivuston toiminnan ja käyttökokemuksen parantaminen",
          "Yhteydenottopyyntöihin vastaaminen",
          "Kävijätilastojen analysointi anonymisoituna",
          "Teknisten ongelmien tunnistaminen ja korjaaminen",
          "Väärinkäytösten ja tietoturvauhkien torjuminen",
        ],
      },
      {
        h2: "4. Evästeet",
        paragraphs: [
          "Käytämme evästeitä sivuston toiminnan parantamiseen. Evästeet ovat pieniä tekstitiedostoja, jotka tallentuvat laitteeseesi sivustoa selattaessa.",
          "Käytämme seuraavia evästetyyppejä:",
        ],
        list: [
          "Välttämättömät evästeet: sivuston perustoiminnan mahdollistavat tekniset evästeet",
          "Analytiikkaevästeet: anonymisoitua kävijätilastotietoa (Google Analytics tai vastaava)",
          "Kolmannen osapuolen evästeet: affiliate-kumppaneidemme seurantaevästeet klikkauksesi tunnistamiseksi",
        ],
        note: "Voit hallita ja poistaa evästeitä selaimesi asetuksista. Välttämättömien evästeiden poistaminen saattaa vaikuttaa sivuston toimintaan.",
      },
      {
        h2: "5. Kolmannet osapuolet ja affiliate-linkit",
        paragraphs: [
          "Sivustollamme on affiliate-linkkejä kasinokumppaneidemme sivustoille. Kun napsautat näitä linkkejä ja rekisteröidyt kumppanikasinolle, saatamme saada komission. Tämä ei vaikuta arviointeihimme tai sisältömme riippumattomuuteen.",
          "Kolmansilla osapuolilla (kasinot, analytiikkapalvelut) on omat tietosuojakäytäntönsä, joista ne ovat itse vastuussa. Emme hallita heidän tietojenkäsittelyään.",
          "Emme myy, vuokraa tai muutoin luovuta henkilötietojasi ulkopuolisille, paitsi:",
        ],
        list: [
          "Lakisääteisten velvoitteiden täyttämiseksi viranomaispyynnöstä",
          "Suostumuksellasi tapauskohtaisesti",
        ],
      },
      {
        h2: "6. Tietoturva",
        paragraphs: [
          "Suojaamme tietosi asianmukaisin teknisin ja organisatorisin toimenpitein. Sivustomme käyttää SSL/TLS-salausta kaiken tietoliikenteen suojaamiseen. Rajoitamme henkilötietoihin pääsyä vain niille henkilöille, joiden tehtävät sitä edellyttävät.",
          "Mikäli tietoturvaloukkauksesta aiheutuu riski oikeuksillesi tai vapauksiisi, ilmoitamme siitä toimivaltaiselle viranomaiselle 72 tunnin kuluessa GDPR:n vaatimusten mukaisesti.",
        ],
      },
      {
        h2: "7. Tietojen säilytysaika",
        paragraphs: [
          "Säilytämme yhteydenottolomakkeen kautta lähettämäsi tiedot enintään 24 kuukautta siitä, kun olemme vastanneet pyyntöösi. Lokitiedot poistetaan 12 kuukauden kuluttua. Analytiikkatiedot säilytetään anonymisoituina ilman määräaikaa.",
        ],
      },
      {
        h2: "8. Oikeutesi (GDPR)",
        paragraphs: ["EU:n tietosuoja-asetuksen mukaan sinulla on seuraavat oikeudet henkilötietojesi osalta:"],
        list: [
          "Oikeus saada tietoa käsittelystä ja pääsy omiin tietoihisi",
          "Oikeus tietojen oikaisemiseen, jos ne ovat virheellisiä",
          "Oikeus tietojen poistamiseen (\"oikeus tulla unohdetuksi\")",
          "Oikeus käsittelyn rajoittamiseen tietyissä tilanteissa",
          "Oikeus tietojen siirtämiseen toiselle rekisterinpitäjälle",
          "Oikeus vastustaa tietojen käsittelyä oikeutetun edun perusteella",
          "Oikeus tehdä valitus Tietosuojavaltuutetulle (tietosuoja.fi)",
        ],
        note: "Käytä oikeuksiasi ottamalla yhteyttä meihin alla olevien tietojen mukaisesti. Vastaamme pyyntöihin kuukauden kuluessa.",
      },
      {
        h2: "9. Alaikäisten tietosuoja",
        paragraphs: [
          "Sivustomme on suunnattu ainoastaan täysi-ikäisille (18+). Emme tietoisesti kerää alaikäisten henkilötietoja. Jos havaitsemme alaikäisen tiedot, poistamme ne välittömästi.",
        ],
      },
      {
        h2: "10. Muutokset tietosuojakäytäntöön",
        paragraphs: [
          "Voimme päivittää tätä tietosuojakäytäntöä tarpeen mukaan. Merkittävistä muutoksista ilmoitamme sivustollamme. Jatkamalla sivuston käyttöä päivityksen jälkeen hyväksyt uuden käytännön.",
        ],
      },
      {
        h2: "11. Yhteystiedot",
        paragraphs: [
          "Tietosuojaan liittyvissä kysymyksissä ota yhteyttä sähköpostitse: info@slotsband.com tai käytä sivustomme yhteydenottolomaketta.",
        ],
      },
    ],
  },

  en: {
    home: "Home",
    title: "Privacy Policy",
    updated: "Last updated: July 2026",
    sections: [
      {
        h2: "1. Introduction",
        paragraphs: [
          "SlotsBand (slotsband.com) is committed to protecting the personal data of our users. This Privacy Policy explains how we collect, use, and protect your information when you use our website.",
          "We process personal data in accordance with the EU General Data Protection Regulation (GDPR, 2016/679). By using our site, you consent to the practices described here.",
        ],
      },
      {
        h2: "2. Data we collect",
        paragraphs: ["We collect the following data when you visit our site:"],
        list: [
          "Log data: IP address, browser type, operating system, pages visited, and visit time",
          "Contact form data: name, email address, and message content",
          "Cookie data: technical cookies and analytics cookies",
          "Referral data: how you arrived at the site (search engine, direct link, social media)",
        ],
        note: "We do not collect sensitive personal data such as payment details or health information.",
      },
      {
        h2: "3. How we use your data",
        paragraphs: ["We use the data we collect for the following purposes:"],
        list: [
          "Improving site performance and user experience",
          "Responding to contact enquiries",
          "Analysing visitor statistics anonymously",
          "Identifying and resolving technical issues",
          "Detecting and preventing abuse or security threats",
        ],
      },
      {
        h2: "4. Cookies",
        paragraphs: [
          "We use cookies to improve your browsing experience. Cookies are small text files stored on your device when you visit our site.",
          "We use the following types of cookies:",
        ],
        list: [
          "Essential cookies: technical cookies required for basic site functionality",
          "Analytics cookies: anonymised visitor statistics (Google Analytics or similar)",
          "Third-party cookies: affiliate partner tracking cookies to attribute your clicks",
        ],
        note: "You can manage and delete cookies through your browser settings. Disabling essential cookies may affect site functionality.",
      },
      {
        h2: "5. Third parties and affiliate links",
        paragraphs: [
          "Our site contains affiliate links to casino partners. When you click these links and register at a partner casino, we may earn a commission. This does not affect our reviews or editorial independence.",
          "Third parties (casinos, analytics services) have their own privacy policies for which they are solely responsible. We do not control their data processing.",
          "We do not sell, rent, or otherwise share your personal data with third parties, except:",
        ],
        list: [
          "To comply with legal obligations upon request from authorities",
          "With your explicit consent on a case-by-case basis",
        ],
      },
      {
        h2: "6. Data security",
        paragraphs: [
          "We protect your data using appropriate technical and organisational measures. Our site uses SSL/TLS encryption for all data transmissions. Access to personal data is restricted to personnel whose duties require it.",
          "If a data breach poses a risk to your rights or freedoms, we will notify the competent supervisory authority within 72 hours as required by GDPR.",
        ],
      },
      {
        h2: "7. Data retention",
        paragraphs: [
          "Contact form submissions are retained for a maximum of 24 months after we have responded to your enquiry. Log data is deleted after 12 months. Analytics data is stored anonymously with no time limit.",
        ],
      },
      {
        h2: "8. Your rights (GDPR)",
        paragraphs: ["Under EU data protection law, you have the following rights regarding your personal data:"],
        list: [
          "Right to be informed about and to access your data",
          "Right to rectification if your data is inaccurate",
          "Right to erasure (\"right to be forgotten\")",
          "Right to restriction of processing in certain circumstances",
          "Right to data portability to another controller",
          "Right to object to processing based on legitimate interests",
          "Right to lodge a complaint with a supervisory authority",
        ],
        note: "To exercise your rights, contact us using the details below. We will respond within one month.",
      },
      {
        h2: "9. Children's privacy",
        paragraphs: [
          "Our site is intended for adults aged 18 and over only. We do not knowingly collect personal data from minors. If we become aware of such data, we will delete it immediately.",
        ],
      },
      {
        h2: "10. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. We will announce significant changes on our website. Continuing to use the site after an update constitutes acceptance of the revised policy.",
        ],
      },
      {
        h2: "11. Contact",
        paragraphs: [
          "For privacy-related enquiries, contact us at: info@slotsband.com or use the contact form on our website.",
        ],
      },
    ],
  },

  uk: {
    home: "Home",
    title: "Privacy Policy",
    updated: "Last updated: July 2026",
    sections: [
      {
        h2: "1. Introduction",
        paragraphs: [
          "SlotsBand (slotsband.com) is committed to protecting the personal data of our users. This Privacy Policy explains how we collect, use, and protect your information when you use our website.",
          "We process personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. By using our site, you consent to the practices described here.",
        ],
      },
      {
        h2: "2. Data we collect",
        paragraphs: ["We collect the following data when you visit our site:"],
        list: [
          "Log data: IP address, browser type, operating system, pages visited, and visit time",
          "Contact form data: name, email address, and message content",
          "Cookie data: technical cookies and analytics cookies",
          "Referral data: how you arrived at the site (search engine, direct link, social media)",
        ],
        note: "We do not collect sensitive personal data such as payment details or health information.",
      },
      {
        h2: "3. How we use your data",
        paragraphs: ["We use the data we collect for the following purposes:"],
        list: [
          "Improving site performance and user experience",
          "Responding to contact enquiries",
          "Analysing visitor statistics anonymously",
          "Identifying and resolving technical issues",
          "Detecting and preventing abuse or security threats",
        ],
      },
      {
        h2: "4. Cookies",
        paragraphs: [
          "We use cookies to improve your browsing experience. Cookies are small text files stored on your device when you visit our site.",
          "We use the following types of cookies:",
        ],
        list: [
          "Essential cookies: technical cookies required for basic site functionality",
          "Analytics cookies: anonymised visitor statistics (Google Analytics or similar)",
          "Third-party cookies: affiliate partner tracking cookies to attribute your clicks",
        ],
        note: "You can manage and delete cookies through your browser settings. Disabling essential cookies may affect site functionality.",
      },
      {
        h2: "5. Third parties and affiliate links",
        paragraphs: [
          "Our site contains affiliate links to casino partners. When you click these links and register at a partner casino, we may earn a commission. This does not affect our reviews or editorial independence.",
          "Third parties (casinos, analytics services) have their own privacy policies for which they are solely responsible. We do not control their data processing.",
          "We do not sell, rent, or otherwise share your personal data with third parties, except:",
        ],
        list: [
          "To comply with legal obligations upon request from authorities",
          "With your explicit consent on a case-by-case basis",
        ],
      },
      {
        h2: "6. Data security",
        paragraphs: [
          "We protect your data using appropriate technical and organisational measures. Our site uses SSL/TLS encryption for all data transmissions. Access to personal data is restricted to personnel whose duties require it.",
          "In the event of a data breach that poses a risk to your rights or freedoms, we will notify the Information Commissioner's Office (ICO) within 72 hours as required by UK GDPR.",
        ],
      },
      {
        h2: "7. Data retention",
        paragraphs: [
          "Contact form submissions are retained for a maximum of 24 months after we have responded to your enquiry. Log data is deleted after 12 months. Analytics data is stored anonymously with no time limit.",
        ],
      },
      {
        h2: "8. Your rights (UK GDPR)",
        paragraphs: ["Under UK data protection law, you have the following rights regarding your personal data:"],
        list: [
          "Right to be informed about and to access your data",
          "Right to rectification if your data is inaccurate",
          "Right to erasure (\"right to be forgotten\")",
          "Right to restriction of processing in certain circumstances",
          "Right to data portability to another controller",
          "Right to object to processing based on legitimate interests",
          "Right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk",
        ],
        note: "To exercise your rights, contact us using the details below. We will respond within one month.",
      },
      {
        h2: "9. Children's privacy",
        paragraphs: [
          "Our site is intended for adults aged 18 and over only. We do not knowingly collect personal data from minors. If we become aware of such data, we will delete it immediately.",
        ],
      },
      {
        h2: "10. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. We will announce significant changes on our website. Continuing to use the site after an update constitutes acceptance of the revised policy.",
        ],
      },
      {
        h2: "11. Contact",
        paragraphs: [
          "For privacy-related enquiries, contact us at: info@slotsband.com or use the contact form on our website.",
        ],
      },
    ],
  },
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang = (rawLang as Lang) || "fi"
  const c = CONTENT[lang] ?? CONTENT.fi

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <div className="bg-white border-b border-[#E5E8F0]">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 pt-6 pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#787585] mb-5">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">{c.home}</Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">{c.title}</span>
          </nav>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-[#1b1b1c] mb-2">{c.title}</h1>
          <p className="text-xs text-[#787585]">{c.updated}</p>
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
                <p className="text-xs text-[#787585] bg-[#F8F9FD] rounded-xl px-4 py-3 border border-[#E5E8F0]">{section.note}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
