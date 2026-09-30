export default function ProductLoading() {
  return (
    <div className="content-container py-8 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
        {/* Left Side: Gallery Skeleton */}
        <div className="lg:col-span-7 w-full aspect-square bg-gray-100 rounded-2xl" />

        {/* Right Side: Product Info & Actions Skeleton */}
        <div className="lg:col-span-5 flex flex-col gap-y-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/3" />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="h-10 bg-gray-100 rounded w-full" />
            <div className="h-12 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
