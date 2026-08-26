"use client"

import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type MegaMenuNavProps = {
  categories?: HttpTypes.StoreProductCategory[]
}

const COMPUTERS_BRANDS = [
  { name: "ASUS", href: "/brands/asus" },
  { name: "MSI", href: "/brands/msi" },
  { name: "Intel", href: "/brands/intel" },
  { name: "AMD", href: "/brands/amd" },
  { name: "Razer", href: "/brands/razer" },
  { name: "Corsair", href: "/brands/corsair" },
  { name: "BenQ", href: "/brands/benq" },
  { name: "HP", href: "/brands/hp" },
  { name: "Lenovo", href: "/brands/lenovo" },
]

const OFFICE_BRANDS = [
  { name: "HP", href: "/brands/hp" },
  { name: "Epson", href: "/brands/epson" },
  { name: "Canon", href: "/brands/canon" },
  { name: "ASUS", href: "/brands/asus" },
  { name: "Honeywell", href: "/brands/honeywell" },
  { name: "TP-Link", href: "/brands/tp-link" },
  { name: "D-Link", href: "/brands/d-link" },
  { name: "Linksys", href: "/brands/linksys" },
  { name: "Samsung", href: "/brands/samsung" },
]

const MOBILES_BRANDS = [
  { name: "Apple", href: "/brands/apple" },
  { name: "Samsung", href: "/brands/samsung" },
  { name: "Xiaomi", href: "/brands/xiaomi" },
  { name: "Huawei", href: "/brands/huawei" },
  { name: "Nokia", href: "/brands/nokia" },
  { name: "Microsoft", href: "/brands/microsoft" },
  { name: "Oppo", href: "/brands/oppo" },
  { name: "JBL", href: "/brands/jbl" },
  { name: "Sony", href: "/brands/sony" },
]

const ELECTRONICS_BRANDS = [
  { name: "ViewSonic", href: "/brands/viewsonic" },
  { name: "BenQ", href: "/brands/benq" },
  { name: "Sony", href: "/brands/sony" },
  { name: "JBL", href: "/brands/jbl" },
  { name: "Nintendo", href: "/brands/nintendo" },
  { name: "Samsung", href: "/brands/samsung" },
  { name: "Oculus", href: "/brands/oculus" },
  { name: "Apple", href: "/brands/apple" },
  { name: "Pioneer", href: "/brands/pioneer" },
]

export default function MegaMenuNav({}: MegaMenuNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      ref={navRef}
      onMouseLeave={() => setActiveMenu(null)}
      className="flex items-center gap-0.5 font-bold text-xs"
    >
      {/* 1. COMPUTERS & LAPTOPS Tab */}
      <button
        type="button"
        onMouseEnter={() => setActiveMenu("computers")}
        onClick={() =>
          setActiveMenu(activeMenu === "computers" ? null : "computers")
        }
        className={`px-3.5 py-2 rounded-t-md transition-colors uppercase tracking-wider text-[11px] flex items-center gap-1 font-black ${
          activeMenu === "computers"
            ? "bg-white text-black border-t-2 border-primary shadow-sm"
            : "text-white hover:text-black hover:bg-black/5"
        }`}
      >
        <span>Computers & Laptops</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            activeMenu === "computers" ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* 2. OFFICE & NETWORKING Tab */}
      <button
        type="button"
        onMouseEnter={() => setActiveMenu("office")}
        onClick={() =>
          setActiveMenu(activeMenu === "office" ? null : "office")
        }
        className={`px-3.5 py-2 rounded-t-md transition-colors uppercase tracking-wider text-[11px] flex items-center gap-1 font-black ${
          activeMenu === "office"
            ? "bg-white text-black border-t-2 border-primary shadow-sm"
            : "text-white hover:text-black hover:bg-black/5"
        }`}
      >
        <span>Office & Networking</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            activeMenu === "office" ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* 3. MOBILES & TABLETS Tab */}
      <button
        type="button"
        onMouseEnter={() => setActiveMenu("mobiles")}
        onClick={() =>
          setActiveMenu(activeMenu === "mobiles" ? null : "mobiles")
        }
        className={`px-3.5 py-2 rounded-t-md transition-colors uppercase tracking-wider text-[11px] flex items-center gap-1 font-black ${
          activeMenu === "mobiles"
            ? "bg-white text-black border-t-2 border-primary shadow-sm"
            : "text-white hover:text-black hover:bg-black/5"
        }`}
      >
        <span>Mobiles & Tablets</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            activeMenu === "mobiles" ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* 4. ELECTRONICS Tab */}
      <button
        type="button"
        onMouseEnter={() => setActiveMenu("electronics")}
        onClick={() =>
          setActiveMenu(activeMenu === "electronics" ? null : "electronics")
        }
        className={`px-3.5 py-2 rounded-t-md transition-colors uppercase tracking-wider text-[11px] flex items-center gap-1 font-black ${
          activeMenu === "electronics"
            ? "bg-white text-black border-t-2 border-primary shadow-sm"
            : "text-white hover:text-black hover:bg-black/5"
        }`}
      >
        <span>Electronics</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            activeMenu === "electronics" ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

  
      {/* 6. NEW RELEASES */}
      <LocalizedClientLink
        href="/store"
        className="bg-[#e62e04] hover:bg-[#c92500] text-white px-3.5 py-1.5 rounded-md transition-colors uppercase tracking-wider text-[11px] font-black shadow-xs ml-1"
      >
        New Releases
      </LocalizedClientLink>

      {/* FULL-WIDTH MEGA DROPDOWN (Starts below ALL CATEGORIES and spans full container width) */}
      {activeMenu && (
        <div
          className="absolute top-full left-0 right-0 w-full bg-white border border-gray-200 rounded-b-2xl shadow-2xl z-50 p-6 overflow-hidden animate-fade-in text-gray-900"
          style={{ transformOrigin: "top left" }}
        >
          {/* A. COMPUTERS & LAPTOPS Content */}
          {activeMenu === "computers" && (
            <div>
              <div className="grid grid-cols-12 gap-6 pb-6 border-b border-gray-100">
                {/* Col 1 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Computer Components
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=graphic" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Video / Graphic Cards
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=case" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Computer Cases
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=processor" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        CPUs / Processors
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=motherboard" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Motherboards
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=power" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Power Supplies
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=components" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 2 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Computer Accessories
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=keyboard" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Keyboards & Mice
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=webcam" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Webcams
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=speaker" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Speakers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=controller" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Game Controllers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=headphones" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Headphones
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=accessories" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 3 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Desktops & Monitors
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=desktop" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Home & Office PCs
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=gaming+pc" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Gaming PCs
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=workstation" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Workstations
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=all+in+one" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        All In One Desktops
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=monitors" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Monitors
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=monitors" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 4 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Laptops & Accessories
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=laptop" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Home & Office Laptops
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=gaming+laptop" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Gaming Laptops
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=workstation" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Workstations
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=battery" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Laptop Batteries
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=charger" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Laptop Chargers
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=laptop" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 5: Promo Card */}
                <div className="col-span-4 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-md">
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block">
                      Special Offer
                    </span>
                    <h3 className="text-xl font-black tracking-tight leading-tight">
                      Computing
                      <br />
                      Essentials
                    </h3>
                    <p className="text-xs text-white/90 font-medium pt-1">
                      Upgrade your setup with top tier performance.
                    </p>
                  </div>
                  <div className="relative z-10 pt-4">
                    <LocalizedClientLink href="/store?q=laptop" onClick={() => setActiveMenu(null)} className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-900 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shadow-sm">
                      <span>Shop Catalog</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>

              {/* Bottom Brands */}
              <div className="pt-4 flex items-center justify-between gap-4 text-xs font-black text-gray-500">
                {COMPUTERS_BRANDS.map((brand) => (
                  <LocalizedClientLink key={brand.name} href={brand.href} onClick={() => setActiveMenu(null)} className="hover:text-black transition-colors tracking-wider font-extrabold uppercase px-2 py-1 hover:bg-gray-50 rounded">
                    {brand.name}
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          )}

          {/* B. OFFICE & NETWORKING Content */}
          {activeMenu === "office" && (
            <div>
              <div className="grid grid-cols-12 gap-6 pb-6 border-b border-gray-100">
                {/* Col 1 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Printers & Scanners
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=laser+printer" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Laser Printers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=inkjet" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Inkjet Printers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=matrix" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Dot Matrix Printers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=card+printer" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        ID Card Printers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=label" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Label Printers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=plotter" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Plotters
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 2 */}
                <div className="col-span-2 space-y-3 pt-6">
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=3d+printer" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        3D Printers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=filament" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        3D Printer Filaments
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=scanner" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Scanners
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=fax" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Fax Machines
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 3 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Office Supplies
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=toner" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Ink & Toners
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=pos" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Point Of Sale
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=furniture" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Office Furniture
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=electronics" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Office Electronics
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=display" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Interactive Displays
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=signage" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Digital Signage
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 4 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Networking
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=router" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Routers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=switch" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Switches
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=adapter" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Wireless Adapters
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=access+point" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Access Points
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=server" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Servers
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=networking" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 5: Promo Card */}
                <div className="col-span-4 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-md">
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block">
                      Office Deals
                    </span>
                    <h3 className="text-xl font-black tracking-tight leading-tight">
                      Printers
                      <br />
                      & Scanners
                    </h3>
                    <p className="text-xs text-gray-300 font-medium pt-1">
                      High speed, wireless and heavy duty printers for business.
                    </p>
                  </div>
                  <div className="relative z-10 pt-4">
                    <LocalizedClientLink href="/store?q=printer" onClick={() => setActiveMenu(null)} className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shadow-sm">
                      <span>Explore Printers</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>

              {/* Bottom Brands */}
              <div className="pt-4 flex items-center justify-between gap-4 text-xs font-black text-gray-500">
                {OFFICE_BRANDS.map((brand) => (
                  <LocalizedClientLink key={brand.name} href={brand.href} onClick={() => setActiveMenu(null)} className="hover:text-black transition-colors tracking-wider font-extrabold uppercase px-2 py-1 hover:bg-gray-50 rounded">
                    {brand.name}
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          )}

          {/* C. MOBILES & TABLETS Content */}
          {activeMenu === "mobiles" && (
            <div>
              <div className="grid grid-cols-12 gap-6 pb-6 border-b border-gray-100">
                {/* Col 1 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Mobile Phones
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=iphone" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        iPhones
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=samsung" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Samsung
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=huawei" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Huawei
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=xiaomi" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Xiaomi
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=nokia" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Nokia
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=phone" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 2 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Tablets
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=ipad" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        iPads
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=surface" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Microsoft
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=galaxy+tab" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Samsung
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=huawei+tablet" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Huawei
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=lenovo+tab" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Lenovo
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=tablet" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 3 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Smartwatches
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=apple+watch" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Apple
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=huawei+watch" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Huawei
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=xiaomi+watch" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Xiaomi
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=amazfit" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Amazfit
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=galaxy+watch" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Samsung
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=smartwatch" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 4 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Accessories
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=headset" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Headsets
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=power+bank" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Power Banks
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=cover" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Covers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=speaker" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Speakers
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=cable" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Chargers & Cables
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=accessories" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 5: Promo Card */}
                <div className="col-span-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-sky-700 rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-md">
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block">
                      Latest Flagships
                    </span>
                    <h3 className="text-xl font-black tracking-tight leading-tight">
                      Brand New
                      <br />
                      Mobile Phones
                      <br />
                      & Tablets
                    </h3>
                    <p className="text-xs text-sky-200 font-medium pt-1">
                      Authentic devices with 100% manufacturer warranty.
                    </p>
                  </div>
                  <div className="relative z-10 pt-4">
                    <LocalizedClientLink href="/store?q=phone" onClick={() => setActiveMenu(null)} className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-black font-bold text-xs px-4 py-2 rounded-full transition-colors shadow-sm">
                      <span>Shop Devices</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>

              {/* Bottom Brands */}
              <div className="pt-4 flex items-center justify-between gap-4 text-xs font-black text-gray-500">
                {MOBILES_BRANDS.map((brand) => (
                  <LocalizedClientLink key={brand.name} href={brand.href} onClick={() => setActiveMenu(null)} className="hover:text-black transition-colors tracking-wider font-extrabold uppercase px-2 py-1 hover:bg-gray-50 rounded">
                    {brand.name}
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          )}

          {/* D. ELECTRONICS Content */}
          {activeMenu === "electronics" && (
            <div>
              <div className="grid grid-cols-12 gap-6 pb-6 border-b border-gray-100">
                {/* Col 1 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Televisions & Video
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=television" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Televisions
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=streaming" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Streaming Players
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=projector" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Projectors
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=projector+screen" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Projector Screens
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=tv+accessories" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        TV Accessories
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 2 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Gaming
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=simulator" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Simulators
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=ps5" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        PlayStation 5
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=ps4" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        PlayStation 4
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=nintendo" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Nintendo Switch
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=vr" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Virtual Reality
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=gaming" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 3 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Cameras & Camcorders
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=drone" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Drones & Accessories
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=camera" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Cameras
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=action+camera" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Action Cameras
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=lens" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Lenses
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=camera+accessories" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors block">
                        Camera Accessories
                      </LocalizedClientLink>
                    </li>
                    <li className="pt-1">
                      <LocalizedClientLink href="/store?q=camera" onClick={() => setActiveMenu(null)} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block">
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 4 */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Audio & Security
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-600">
                    <li>
                      <LocalizedClientLink href="/store?q=audio" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Portable Audio & Video
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=music" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Pro Audio & Instruments
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=smart+home" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Smart Home
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=security" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Surveillance & Security
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink href="/store?q=home+audio" onClick={() => setActiveMenu(null)} className="hover:text-primary transition-colors font-bold text-gray-900 block">
                        Home Audio
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>

                {/* Col 5: Promo Card */}
                <div className="col-span-4 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-2xl p-5 text-gray-900 flex flex-col justify-between relative overflow-hidden shadow-md">
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-2 py-0.5 rounded-full inline-block">
                      Smart Entertainment
                    </span>
                    <h3 className="text-xl font-black tracking-tight leading-tight text-black">
                      Bigger
                      <br />
                      Brighter
                      <br />
                      Smart
                    </h3>
                    <p className="text-xs text-gray-800 font-medium pt-1">
                      Crystal clear 4K displays and home theater audio.
                    </p>
                  </div>
                  <div className="relative z-10 pt-4">
                    <LocalizedClientLink href="/store?q=tv" onClick={() => setActiveMenu(null)} className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-900 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shadow-sm">
                      <span>Shop TVs</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>

              {/* Bottom Brands */}
              <div className="pt-4 flex items-center justify-between gap-4 text-xs font-black text-gray-500">
                {ELECTRONICS_BRANDS.map((brand) => (
                  <LocalizedClientLink key={brand.name} href={brand.href} onClick={() => setActiveMenu(null)} className="hover:text-black transition-colors tracking-wider font-extrabold uppercase px-2 py-1 hover:bg-gray-50 rounded">
                    {brand.name}
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
