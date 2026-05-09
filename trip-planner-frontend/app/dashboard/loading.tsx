export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><div className="skeleton h-8 w-32 mb-2" /><div className="skeleton h-4 w-20" /></div>
        <div className="skeleton h-10 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40" />)}
      </div>
    </div>
  );
}
