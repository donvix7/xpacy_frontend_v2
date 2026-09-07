export default function Loading() {
  return (
    <div className="space-y-8 p-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
      
      <div className="flex flex-col gap-8">
        {[1, 2, 3, 4].map((i) => (
          <section key={i} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
