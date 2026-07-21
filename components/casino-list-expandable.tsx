"use client"

import { useState } from "react"
import { CasinoCard } from "@/components/casino-card"
import type { Casino, Lang } from "@/lib/types"

const PAGE_SIZE = 10

interface Props {
  casinos: Casino[]
  lang: Lang
}

export function CasinoListExpandable({ casinos, lang }: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const shown = casinos.slice(0, visible)
  const remaining = casinos.length - visible

  return (
    <div>
      <div className="flex flex-col gap-5">
        {shown.map((casino, idx) => (
          <CasinoCard key={casino.id} casino={casino} lang={lang} rank={idx + 1} />
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="flex items-center gap-2 bg-white border-2 border-[#2D1783] text-[#2D1783] font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-[#2D1783] hover:text-white transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">expand_more</span>
            Näytä lisää kasinoita ({remaining} jäljellä)
          </button>
          <p className="text-xs text-[#787585]">
            Näytetään {shown.length}/{casinos.length} kasinoita
          </p>
        </div>
      )}
    </div>
  )
}
