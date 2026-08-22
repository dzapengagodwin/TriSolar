const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse bg-white p-4 border border-gray-100 flex flex-col justify-between h-full">
      <div className="w-[209.75px] h-[209.75px] max-w-full mx-auto bg-gray-100 bg-ui-bg-subtle mb-3" />
      <div className="space-y-2 mt-2">
        <div className="w-2/5 h-3 bg-gray-100"></div>
        <div className="w-4/5 h-4 bg-gray-100"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="w-1/3 h-5 bg-gray-100"></div>
          <div className="w-1/4 h-7 bg-gray-100"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
