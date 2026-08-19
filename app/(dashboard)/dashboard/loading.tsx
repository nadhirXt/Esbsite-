export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Welcome header skeleton */}
      <div className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-[#1E293B] dark:to-[#0F172A] border border-blue-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-blue-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 w-48 bg-blue-300 dark:bg-slate-600 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-blue-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>

      {/* Badges section skeleton */}
      <div className="mb-8 p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>

      {/* Quick access cards skeleton */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
        ))}
      </div>

      {/* Recent documents skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#111827] p-4 flex flex-col h-full shadow-sm">
              <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
