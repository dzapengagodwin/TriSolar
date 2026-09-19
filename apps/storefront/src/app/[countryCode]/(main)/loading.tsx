import Spinner from "@modules/common/icons/spinner"

export default function Loading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 py-24 bg-[#F9FAFB]">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing circle */}
        <div className="absolute w-16 h-16 rounded-full border-4 border-primary/10 animate-ping" />
        {/* Brand colored animated spinner */}
        <Spinner size="44" className="text-primary" />
      </div>
      <div className="text-center space-y-1 mt-2">
        <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase animate-pulse">
          Loading Laptopzone
        </p>
        <p className="text-[10px] text-gray-400 font-normal">
          Preparing your high-performance tech deal...
        </p>
      </div>
    </div>
  )
}
