export default function CycleDocumentsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 w-full sm:w-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Skeleton */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-slate-800 p-4 shadow-sm h-[400px]">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="md:col-span-9 space-y-4">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-slate-800 p-4 shadow-sm flex flex-col h-[280px]">
                {/* Thumbnail area */}
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-lg mb-3"></div>
                
                {/* Title area */}
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded mt-2"></div>
                </div>

                {/* Footer area */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
                  <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                  <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
