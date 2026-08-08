export default function AppBanner() {
  return (
    <div className="bg-[#063A34] text-white py-12 my-8 rounded-3xl overflow-hidden shadow-xl">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & Badges */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              NexCart User Friendly <br /> App Available
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 font-normal max-w-md mx-auto lg:mx-0 leading-relaxed">
              Enjoy light speed shopping, exclusive app-only coupons, and instant order tracking directly from your phone.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button className="bg-black hover:bg-gray-900 text-white border border-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors">
                <span className="text-xl">▶</span>
                <div className="text-left">
                  <div className="text-[9px] uppercase text-gray-400">GET IT ON</div>
                  <div className="text-xs font-extrabold">Google Play</div>
                </div>
              </button>

              <button className="bg-black hover:bg-gray-900 text-white border border-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors">
                <span className="text-xl"></span>
                <div className="text-left">
                  <div className="text-[9px] uppercase text-gray-400">DOWNLOAD ON THE</div>
                  <div className="text-xs font-extrabold">App Store</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Phone Mockup Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-56 sm:w-64 h-72 sm:h-80 bg-slate-900 rounded-[2.5rem] p-3 border-4 border-slate-700 shadow-2xl flex flex-col justify-between items-center relative transform -rotate-3 hover:rotate-0 transition-transform">
              <div className="w-12 h-3 bg-black rounded-full mt-1"></div>
              <div className="w-full flex-1 my-2 bg-gradient-to-b from-emerald-950 to-slate-950 rounded-[1.8rem] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-10 h-10 bg-[#FF9F0D] rounded-xl flex items-center justify-center text-white font-black text-xl mb-2">N</div>
                <span className="text-sm font-extrabold text-white">NexCart App</span>
                <span className="text-[10px] text-gray-400 mt-1">Fast & Secure Mobile Shopping</span>
              </div>
              <div className="w-8 h-8 border-2 border-slate-700 rounded-full mb-1"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
