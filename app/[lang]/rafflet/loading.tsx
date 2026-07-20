export default function RaffletLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-[#2D1783] to-[#1e0f5c] pt-10 pb-12 md:pt-14 md:pb-16 animate-pulse">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <div className="h-5 bg-white/20 rounded-full w-36" />
            <div className="h-10 bg-white/20 rounded w-96 max-w-full" />
            <div className="h-6 bg-[#FFD700]/30 rounded w-48" />
            <div className="h-4 bg-white/10 rounded w-64" />
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-white/20 rounded w-28" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[52px] h-[58px] bg-white/10 rounded-xl" />
              ))}
            </div>
            <div className="h-11 bg-[#FFD700]/40 rounded-full w-36" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8 space-y-10">
        {/* Steps skeleton */}
        <div>
          <div className="h-6 bg-[#E5E8F0] rounded w-48 mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E8F0] p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
        {/* Winners skeleton */}
        <div>
          <div className="h-6 bg-[#E5E8F0] rounded w-56 mb-4 animate-pulse" />
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-4 py-3 border-b border-[#F8F9FD] last:border-0">
                <div className="w-7 h-7 bg-[#E5E8F0] rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#E5E8F0] rounded w-24" />
                  <div className="h-2 bg-[#E5E8F0] rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
