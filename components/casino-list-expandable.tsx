import { CasinoCard } from "@/components/casino-card"
import type { Casino, Lang } from "@/lib/types"

interface Props {
  casinos: Casino[]
  lang: Lang
}

export function CasinoListExpandable({ casinos, lang }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {casinos.map((casino, idx) => (
        <CasinoCard key={casino.id} casino={casino} lang={lang} rank={idx + 1} />
      ))}
    </div>
  )
}
