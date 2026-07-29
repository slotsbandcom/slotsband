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

export default function NettikasinotLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Page hero */}
      <div className="bg-white border-b border-[#E5E8F0] py-6 md:py-10 animate-pulse">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 space-y-3">
          <div className="h-3 bg-[#E5E8F0] rounded w-36" />
          <div className="h-8 bg-[#E5E8F0] rounded w-72 max-w-full" />
          <div className="h-4 bg-[#E5E8F0] rounded w-80 max-w-full" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-5 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar skeleton */}
          <div className="lg:w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 space-y-3 animate-pulse">
              <div className="h-3 bg-[#E5E8F0] rounded w-1/2" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-[#E5E8F0] rounded-xl" />
              ))}
              <div className="h-3 bg-[#E5E8F0] rounded w-1/2 mt-2" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-[#E5E8F0] rounded-xl" />
              ))}
            </div>
          </div>

          {/* Casino list */}
          <div className="flex-1 flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCasinoCard key={i} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
