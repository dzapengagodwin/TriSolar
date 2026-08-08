import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function IPhoneBanner() {
  return (
    <div className="bg-[#141414] text-white py-12 md:py-16 my-8 w-full overflow-hidden">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & CTA */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              iPhone 17 Available
            </h2>

            <p className="text-gray-300 text-xs sm:text-sm max-w-md font-normal leading-relaxed">
              The wait is over – the latest iPhone 17 is here! Experience cutting-edge innovation, limited stock, fast delivery. Secure yours today!
            </p>

            <div className="pt-2">
              <LocalizedClientLink
                href="/store"
                className="bg-white text-black font-bold text-xs px-6 py-2.5 rounded hover:bg-gray-200 transition-colors inline-block uppercase tracking-wider"
              >
                Shop Now
              </LocalizedClientLink>
            </div>
          </div>

          {/* Right Graphics: 3 Vertical iPhones */}
          <div className="lg:col-span-6 flex justify-center items-center gap-3">
            {/* Phone 1: Black */}
            <div className="w-24 sm:w-28 h-48 sm:h-56 bg-slate-900 rounded-[2rem] p-2 border-2 border-slate-700 shadow-2xl flex flex-col justify-between items-center relative transform -rotate-3 hover:rotate-0 transition-transform">
              <div className="w-8 h-2 bg-black rounded-full mt-1"></div>
              <div className="w-full flex-1 my-2 bg-gradient-to-b from-slate-800 to-black rounded-[1.5rem] flex items-center justify-center">
                <span className="text-[10px] font-mono text-gray-400">17 Pro</span>
              </div>
              <div className="w-6 h-6 border-2 border-slate-700 rounded-full mb-1"></div>
            </div>

            {/* Phone 2: Gold/Bronze */}
            <div className="w-24 sm:w-28 h-52 sm:h-60 bg-amber-950/80 rounded-[2rem] p-2 border-2 border-amber-600/50 shadow-2xl flex flex-col justify-between items-center relative z-10 transform hover:scale-105 transition-transform">
              <div className="w-8 h-2 bg-black rounded-full mt-1"></div>
              <div className="w-full flex-1 my-2 bg-gradient-to-b from-amber-900/60 to-amber-950 rounded-[1.5rem] flex items-center justify-center">
                <span className="text-[10px] font-mono text-amber-200 font-bold">iPhone 17</span>
              </div>
              <div className="w-6 h-6 border-2 border-amber-600/50 rounded-full mb-1"></div>
            </div>

            {/* Phone 3: Titanium/Blue */}
            <div className="w-24 sm:w-28 h-48 sm:h-56 bg-slate-800 rounded-[2rem] p-2 border-2 border-blue-400/40 shadow-2xl flex flex-col justify-between items-center relative transform rotate-3 hover:rotate-0 transition-transform">
              <div className="w-8 h-2 bg-black rounded-full mt-1"></div>
              <div className="w-full flex-1 my-2 bg-gradient-to-b from-slate-700 to-slate-900 rounded-[1.5rem] flex items-center justify-center">
                <span className="text-[10px] font-mono text-blue-200">17 Max</span>
              </div>
              <div className="w-6 h-6 border-2 border-blue-400/40 rounded-full mb-1"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
