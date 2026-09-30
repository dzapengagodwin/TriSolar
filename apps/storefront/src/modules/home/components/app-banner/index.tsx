import Image from "next/image"

export default function AppBanner() {
  return (
    <div className="bg-black text-white py-12 my-8 rounded-3xl overflow-hidden shadow-xl border border-gray-900">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & Badges */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Laptopzone Mobile <br /> App Available
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 font-normal max-w-md mx-auto lg:mx-0 leading-relaxed">
              Enjoy light speed shopping, exclusive app-only tech coupons, and instant order tracking directly from your phone.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M3 20.5v-17c0-.55.45-1 1-1h.22l9.9 9.87L4.2 21.43C3.65 21.72 3 21.31 3 20.5zm12.5-7.13L18.7 15l-3.2 1.87-3.1-3.5 3.1-3.5zM4.68 2.57l10.27 10.3-2.85 2.85L3.8 3.92a.99.99 0 0 1 .88-1.35zm1.52 18.66l8.3-8.3 2.85 2.85-9.87 5.75c-.44.25-.97.11-1.28-.3z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[9px] uppercase text-gray-400">GET IT ON</div>
                  <div className="text-xs font-extrabold">Google Play</div>
                </div>
              </button>

              <button className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.62-.76 1.04-1.81.93-2.85-.9.04-2 .6-2.64 1.35-.57.66-1.07 1.73-.93 2.76 1.01.08 2.03-.5 2.64-1.26z"/>
                </svg>
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
              <div className="w-full flex-1 my-2 bg-gradient-to-b from-gray-900 to-black rounded-[1.8rem] flex flex-col items-center justify-center p-4 text-center">
                <Image
                  src="/logo.webp"
                  alt="Laptopzone App"
                  width={140}
                  height={50}
                  className="object-contain mb-2"
                />
                <span className="text-sm font-extrabold text-white">Laptopzone App</span>
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
