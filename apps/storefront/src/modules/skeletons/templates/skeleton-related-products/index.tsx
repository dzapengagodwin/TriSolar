import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="product-page-constraint py-12">
      <div className="flex flex-col gap-4 items-center text-center mb-8">
        <div className="w-24 h-4 animate-pulse bg-gray-100 rounded"></div>
        <div className="w-80 h-7 animate-pulse bg-gray-100 rounded"></div>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {repeat(4).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
