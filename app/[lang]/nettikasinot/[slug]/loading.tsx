export default function CasinoPageLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Hero */}
      <div className="bg-white border-b border-[#E5E8F0] animate-pulse">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 pt-5 pb-6 md:pt-8 md:pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 bg-[#E5E8F0] rounded w-12" />
            <div className="h-3 bg-[#E5E8F0] rounded w-3" />
            <div className="h-3 bg-[#E5E8F0] rounded w-24" />
            <div className="h-3 bg-[#E5E8F0] rounded w-3" />
            <div className="h-3 bg-[#E5E8F0] rounded w-32" />
          </div>

          {/* Mobile hero */}
          <div className="flex flex-col gap-4 md:hidden">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#E5E8F0] rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-[#E5E8F0] rounded w-3/4" />
                <div className="h-3 bg-[#E5E8F0] rounded w-1/2" />
                <div className="h-5 bg-[#E5E8F0] rounded w-24" />
              </div>
            </div>
            <div className="h-12 bg-[#E5E8F0] rounded-xl" />
          </div>

          {/* Desktop hero */}
          <div className="hidden md:flex items-start gap-8">
            <div className="w-28 h-28 bg-[#E5E8F0] rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-[#E5E8F0] rounded w-1/2" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-6 w-20 bg-[#E5E8F0] rounded-full" />
                ))}
              </div>
              <div className="h-4 bg-[#E5E8F0] rounded w-1/3" />
            </div>
            <div className="w-48 space-y-3 flex-shrink-0">
              <div className="h-12 bg-[#E5E8F0] rounded-xl" />
              <div className="h-10 bg-[#E5E8F0] rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-5">
            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E5E8F0] p-4 animate-pulse">
                  <div className="h-2 bg-[#E5E8F0] rounded w-2/3 mb-2" />
                  <div className="h-5 bg-[#E5E8F0] rounded w-1/2" />
                </div>
              ))}
            </div>

            {/* Pros/cons */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5 animate-pulse space-y-3">
              <div className="h-4 bg-[#E5E8F0] rounded w-1/4" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 bg-[#E5E8F0] rounded w-full" />
              ))}
            </div>

            {/* Review text */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-8 animate-pulse space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`h-3 bg-[#E5E8F0] rounded ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[300px] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 animate-pulse space-y-3">
              <div className="h-4 bg-[#E5E8F0] rounded w-1/2" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 bg-[#E5E8F0] rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-[#E5E8F0] rounded w-3/4" />
                    <div className="h-2 bg-[#E5E8F0] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
