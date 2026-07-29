function SkeletonCasinoCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden animate-pulse">
      <div className="md:hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="w-16 h-16 bg-[#E5E8F0] rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[#E5E8F0] rounded w-3/4" />
            <div className="h-3 bg-[#E5E8F0] rounded w-1/2" />
          </div>
        </div>
        <div className="mx-4 mb-3 h-10 bg-[#F0EDFF] rounded-xl" />
        <div className="flex gap-2 px-4 py-3">
          <div className="flex-1 h-12 bg-[#E5E8F0] rounded-xl" />
          <div className="h-12 w-28 bg-[#E5E8F0] rounded-xl" />
        </div>
      </div>
      <div className="hidden md:flex items-stretch">
        <div className="w-1.5 bg-[#FFD700] flex-shrink-0 rounded-l-2xl" />
        <div className="flex items-center gap-6 p-6 lg:p-8 flex-1">
          <div className="w-20 h-20 bg-[#E5E8F0] rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-3 bg-[#E5E8F0] rounded w-1/4" />
            <div className="h-5 bg-[#E5E8F0] rounded w-3/4" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-2 bg-[#E5E8F0] rounded w-2/3" />
                  <div className="h-3 bg-[#E5E8F0] rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-44 flex-shrink-0 space-y-2.5">
            <div className="h-12 bg-[#E5E8F0] rounded-xl" />
            <div className="h-12 bg-[#E5E8F0] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomepageLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Hero */}
      <div className="bg-[#2D1783] pt-8 pb-10 md:pt-14 md:pb-16 animate-pulse">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 space-y-4">
          <div className="h-5 bg-white/20 rounded-full w-40" />
          <div className="h-10 bg-white/20 rounded w-80 max-w-full" />
          <div className="h-4 bg-white/10 rounded w-64 max-w-full" />
          <div className="h-12 bg-[#FFD700]/30 rounded-full w-36 mt-4" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="hidden md:block border-b border-[#E5E8F0] bg-[#F8F9FD] py-1.5">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-32 bg-white border border-[#E5E8F0] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Casino list */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 md:py-10">
        <div className="h-5 bg-[#E5E8F0] rounded w-48 mb-5 animate-pulse" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCasinoCard key={i} />)}
        </div>
      </div>
    </div>
  )
}
