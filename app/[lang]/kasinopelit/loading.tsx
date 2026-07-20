function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden animate-pulse">
      <div className="h-32 bg-[#E5E8F0]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#E5E8F0] rounded w-4/5" />
        <div className="h-2 bg-[#E5E8F0] rounded w-2/5" />
        <div className="flex justify-between mt-3">
          <div className="h-2 bg-[#E5E8F0] rounded w-1/4" />
          <div className="h-2 bg-[#E5E8F0] rounded w-1/4" />
        </div>
        <div className="h-7 bg-[#E5E8F0] rounded-xl mt-1" />
      </div>
    </div>
  )
}

export default function KasinopelitLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Header skeleton */}
      <div className="bg-[#2D1783] pt-8 pb-10 md:pt-12 md:pb-14 animate-pulse">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 space-y-3">
          <div className="h-2 bg-white/20 rounded w-24" />
          <div className="h-8 bg-white/20 rounded w-96 max-w-full" />
          <div className="h-3 bg-white/10 rounded w-80 max-w-full" />
          <div className="h-10 bg-white/10 rounded-xl w-64 mt-5" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 mt-6">
        {/* Type tabs skeleton */}
        <div className="flex gap-2 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-white border border-[#E5E8F0] rounded-full animate-pulse" />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar skeleton */}
          <div className="lg:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 space-y-4 animate-pulse">
              <div className="h-3 bg-[#E5E8F0] rounded w-2/3" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 bg-[#E5E8F0] rounded" />
              ))}
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="h-3 bg-[#E5E8F0] rounded w-24 mb-4 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
