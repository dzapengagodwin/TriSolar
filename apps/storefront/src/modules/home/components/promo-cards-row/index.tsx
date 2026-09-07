"use client"

import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

export default function PromoCardsRow() {
  const cards = [
    {
      id: "catalogue",
      title: "View",
      subtitle: "catalogue.",
      buttonText: "Browse Deals",
      textColor: "text-[#0F4C81]",
      bgGradient: "from-[#0F4C81] via-[#0A2E50] to-[#041527]",
      borderColor: "border-blue-900/50",
      graphic: (
        <div className="relative w-full h-44 flex items-center justify-center pt-4">
          <div className="relative w-36 h-36 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Image
              src="/hero-laptops.png"
              alt="Catalogue Feature"
              fill
              className="object-contain drop-shadow-xl"
              sizes="200px"
            />
          </div>
        </div>
      ),
    },
    {
      id: "clearance",
      title: "Last chance",
      subtitle: "Clearance sale.",
      buttonText: "Browse Deals",
      textColor: "text-[#D31010]",
      bgGradient: "from-[#D31010] via-[#8B0000] to-[#3B0000]",
      borderColor: "border-red-800/50",
      graphic: (
        <div className="relative w-full h-44 flex flex-col items-center justify-center pt-2">
          <div className="text-xl font-black text-white tracking-widest flex items-center gap-1 uppercase mb-1 drop-shadow-md">
            <span>RedStar</span>
            <svg className="w-4 h-4 text-amber-400 fill-amber-400 inline-block" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <div className="relative w-28 h-28 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/hero-phone.png"
              alt="Clearance RedStar Deals"
              fill
              className="object-contain drop-shadow-2xl"
              sizes="160px"
            />
          </div>
        </div>
      ),
    },
    {
      id: "flash-sale",
      title: "Flash Sale",
      subtitle: "Now on.",
      buttonText: "Browse Deals",
      textColor: "text-[#003B95]",
      bgGradient: "from-[#003B95] via-[#001D4A] to-[#000B1A]",
      borderColor: "border-blue-800/50",
      graphic: (
        <div className="relative w-full h-44 flex flex-col items-center justify-center pt-2">
          <div className="bg-blue-600/40 border border-blue-400/60 backdrop-blur-md text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-lg mb-2 animate-pulse">
            FLASH SALE
          </div>
          <div className="relative w-32 h-28 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/omen-laptop.png"
              alt="Flash Sale Laptops & Tech"
              fill
              className="object-contain drop-shadow-2xl"
              sizes="180px"
            />
          </div>
        </div>
      ),
    },
    {
      id: "samsung",
      title: "Galaxy Z8",
      subtitle: "series.",
      buttonText: "Pre-order Now",
      textColor: "text-[#0066C0]",
      bgGradient: "from-[#0066C0] via-[#003870] to-[#001430]",
      borderColor: "border-sky-800/50",
      graphic: (
        <div className="relative w-full h-44 flex flex-col items-center justify-center pt-2">
          <span className="text-[11px] font-black tracking-widest text-white/90 uppercase mb-1">
            SAMSUNG
          </span>
          <div className="relative w-28 h-28 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/hero-phone.png"
              alt="Samsung Galaxy Z8 Series"
              fill
              className="object-contain drop-shadow-2xl"
              sizes="160px"
            />
          </div>
        </div>
      ),
    },
    {
      id: "smart-air",
      title: "Smart",
      subtitle: "heating. Save big.",
      buttonText: "Browse Deals",
      textColor: "text-[#0052A5]",
      bgGradient: "from-[#0052A5] via-[#002D62] to-[#00102B]",
      borderColor: "border-blue-900/50",
      graphic: (
        <div className="relative w-full h-44 flex items-center justify-center pt-4">
          <div className="relative w-36 h-28 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/hero-monitor.png"
              alt="Smart Air Care & Displays"
              fill
              className="object-contain drop-shadow-2xl"
              sizes="200px"
            />
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="py-6 my-2 relative">
      <div className="content-container relative">
        {/* 5 Vertical Banner Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4.5">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-gradient-to-b ${card.bgGradient} rounded-3xl p-6 border ${card.borderColor} shadow-xl flex flex-col justify-between min-h-[380px] sm:min-h-[400px] relative overflow-hidden group hover:shadow-2xl transition-all duration-300`}
            >
              {/* Top Graphic Showcase */}
              {card.graphic}

              {/* Bottom Content: Titles & White Pill Button */}
              <div className="z-10 space-y-4 pt-4">
                <div className="space-y-0.5">
                  <h3 className="text-2xl sm:text-2xl font-extrabold text-white tracking-tight leading-none">
                    {card.title}
                  </h3>
                  <p className="text-sm font-bold text-white/90 leading-tight">
                    {card.subtitle}
                  </p>
                </div>

                <LocalizedClientLink href="/store" className="block">
                  <button
                    className={`w-full bg-white hover:bg-gray-100 ${card.textColor} font-black text-xs py-3 px-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg text-center truncate`}
                  >
                    {card.buttonText}
                  </button>
                </LocalizedClientLink>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Next Arrow Navigation */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 hidden lg:flex items-center justify-center z-20">
          <LocalizedClientLink href="/store">
            <button
              className="w-11 h-11 bg-white hover:bg-gray-100 text-gray-800 rounded-full shadow-2xl flex items-center justify-center border border-gray-200 transition-transform hover:scale-110"
              aria-label="Next deals"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
