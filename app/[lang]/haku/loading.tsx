export default function HakuLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8 md:py-12">
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-[#E5E8F0] rounded-xl w-72 mb-2" />
          <div className="h-4 bg-[#E5E8F0] rounded w-40" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E8F0] p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-[#E5E8F0] rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-[#E5E8F0] rounded w-1/3" />
                  <div className="h-3 bg-[#E5E8F0] rounded w-2/3" />
                  <div className="h-3 bg-[#E5E8F0] rounded w-1/2" />
                </div>
                <div className="w-24 h-10 bg-[#E5E8F0] rounded-xl flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
