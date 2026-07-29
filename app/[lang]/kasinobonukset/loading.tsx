export default function KasinobonuksetLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Hero */}
      <header className="bg-[#2D1783] pt-8 pb-10 md:pt-12 md:pb-14 animate-pulse">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 space-y-3">
          <div className="h-3 bg-white/20 rounded w-20" />
          <div className="h-8 bg-white/20 rounded w-64 max-w-full" />
          <div className="h-4 bg-white/10 rounded w-80 max-w-full" />
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-36 flex-shrink-0 bg-white border border-[#E5E8F0] rounded-full animate-pulse" />
          ))}
        </div>

        {/* Bonus cards */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden animate-pulse flex">
              <div className="w-24 md:w-32 bg-[#F8F9FD] border-r border-[#E5E8F0] flex-shrink-0 p-4">
                <div className="w-16 h-16 bg-[#E5E8F0] rounded-xl mx-auto" />
              </div>
              <div className="flex-1 p-4 space-y-2">
                <div className="h-4 bg-[#E5E8F0] rounded w-3/4" />
                <div className="h-3 bg-[#E5E8F0] rounded w-1/2" />
                <div className="h-3 bg-[#E5E8F0] rounded w-2/3" />
                <div className="flex gap-2 mt-2">
                  <div className="h-5 w-20 bg-[#E5E8F0] rounded-full" />
                  <div className="h-5 w-16 bg-[#E5E8F0] rounded-full" />
                </div>
              </div>
              <div className="w-32 md:w-40 flex-shrink-0 p-4 flex flex-col gap-2 border-l border-[#E5E8F0]">
                <div className="h-10 bg-[#E5E8F0] rounded-xl" />
                <div className="h-8 bg-[#E5E8F0] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
