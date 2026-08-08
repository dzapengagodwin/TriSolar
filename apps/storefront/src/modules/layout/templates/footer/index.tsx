import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default async function Footer() {
  return (
    <footer className="bg-[#063A34] text-gray-300 w-full pt-14 pb-8 border-t border-emerald-900 text-xs">
      <div className="content-container flex flex-col w-full space-y-12">
        
        {/* Top Section: Brand Info & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-emerald-800/80 pb-10">
          
          {/* Brand & Slogan */}
          <div className="lg:col-span-6 space-y-4">
            <LocalizedClientLink href="/" className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black tracking-tight text-white font-sans">
                Nex
              </span>
              <span className="text-3xl font-black tracking-tight text-[#FF9F0D] font-sans">
                Cart
              </span>
              <span className="w-2 h-2 bg-[#FF9F0D] rounded-full ml-0.5"></span>
            </LocalizedClientLink>

            <p className="text-xs text-gray-300 max-w-md font-normal leading-relaxed">
              TV, Audio, Home & Tech. A building a scalable high performance e-commerce experience.
            </p>

            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                We Are Ready To Help
              </h5>

              <div className="flex w-full max-w-sm gap-2">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="bg-white text-gray-900 text-xs px-4 py-2.5 rounded-full focus:outline-none w-full placeholder-gray-400 font-medium"
                />
                <button className="bg-[#FF9F0D] hover:bg-[#E58B00] text-white font-bold text-xs px-6 py-2.5 rounded-full uppercase tracking-wider transition-colors whitespace-nowrap shadow-md">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 bg-emerald-900 hover:bg-[#FF9F0D] rounded-full flex items-center justify-center text-white transition-colors">f</a>
              <a href="#" className="w-8 h-8 bg-emerald-900 hover:bg-[#FF9F0D] rounded-full flex items-center justify-center text-white transition-colors">t</a>
              <a href="#" className="w-8 h-8 bg-emerald-900 hover:bg-[#FF9F0D] rounded-full flex items-center justify-center text-white transition-colors">i</a>
              <a href="#" className="w-8 h-8 bg-emerald-900 hover:bg-[#FF9F0D] rounded-full flex items-center justify-center text-white transition-colors">p</a>
              <a href="#" className="w-8 h-8 bg-emerald-900 hover:bg-[#FF9F0D] rounded-full flex items-center justify-center text-white transition-colors">y</a>
            </div>

          </div>

          {/* 4 Link Columns */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
            
            {/* Column 1: Information */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                Information
              </h4>
              <ul className="space-y-2 font-normal text-gray-300">
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">About Us</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Delivery Information</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Privacy Policy</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Terms & Conditions</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Refund Policy</LocalizedClientLink></li>
              </ul>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                Quick Links
              </h4>
              <ul className="space-y-2 font-normal text-gray-300">
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Your Account</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Return Centre</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">100% Purchase</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">App Download</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Advertisment</LocalizedClientLink></li>
              </ul>
            </div>

            {/* Column 3: My Account */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                My Account
              </h4>
              <ul className="space-y-2 font-normal text-gray-300">
                <li><LocalizedClientLink href="/account" className="hover:text-[#FF9F0D] transition-colors">Track Order</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/cart" className="hover:text-[#FF9F0D] transition-colors">Shopping Cart</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/account" className="hover:text-[#FF9F0D] transition-colors">Wishlist</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Custom Policy</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">International Sales</LocalizedClientLink></li>
              </ul>
            </div>

            {/* Column 4: Categories */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
                Categories
              </h4>
              <ul className="space-y-2 font-normal text-gray-300">
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Furniture</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Electronics</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Fashion</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Smartphones</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/store" className="hover:text-[#FF9F0D] transition-colors">Beauty & Health</LocalizedClientLink></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div>
            © Copyright 2026. All rights reserved. <span className="text-[#FF9F0D] font-bold">NexCart</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-emerald-900 px-2 py-0.5 rounded text-[10px] text-white">VISA</span>
            <span className="bg-emerald-900 px-2 py-0.5 rounded text-[10px] text-white">MC</span>
            <span className="bg-emerald-900 px-2 py-0.5 rounded text-[10px] text-white">AMEX</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
