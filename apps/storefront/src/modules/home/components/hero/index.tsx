"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Slide = {
  id: string
  badge: string
  badgeBg: string
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
  imageSrc: string
  imageAlt: string
  bgClass: string
}

const SLIDES: Slide[] = [
  {
    id: "gaming-laptops",
    badge: "GAMING & PERFORMANCE SALE",
    badgeBg: "bg-primary text-white",
    title: "Serious Gaming Power. Smart Prices.",
    subtitle:
      "Handle massive 3D models, complex engineering simulations, and ultra-high-FPS gaming on one machine.",
    ctaText: "Shop Gaming Laptops",
    ctaHref: "/shop?q=laptop",
    imageSrc: "/hero-laptops.webp",
    imageAlt: "Gaming Laptops Showcase - ASUS ROG, HP OMEN, Lenovo Legion",
    bgClass: "from-black via-zinc-950 to-neutral-900",
  },
  {
    id: "workstations",
    badge: "SUPER SALE UP TO 30% OFF",
    badgeBg: "bg-[#fed700] text-black",
    title: "High Performance Laptops For Work & Play",
    subtitle:
      "Equipped with Intel Core & NVIDIA RTX GPUs. 100% authentic devices with manufacturer warranty.",
    ctaText: "Explore Workstations",
    ctaHref: "/shop?q=workstation",
    imageSrc: "/omen-laptop.webp",
    imageAlt: "HP OMEN 16 High Performance Laptop",
    bgClass: "from-[#0f172a] via-[#1e1b4b] to-[#020617]",
  },
  {
    id: "curved-monitors",
    badge: "DISPLAYS & WORKSPACES",
    badgeBg: "bg-white/20 text-white backdrop-blur-xs",
    title: "Ultra-Wide Curved Displays & 4K Monitors",
    subtitle:
      "Stunning color accuracy, ultra-fast refresh rates, and immersive workspace ergonomics.",
    ctaText: "Shop Monitors",
    ctaHref: "/shop?q=monitors",
    imageSrc: "/hero-monitor.webp",
    imageAlt: "Curved 4K Gaming & Office Monitor",
    bgClass: "from-zinc-950 via-neutral-900 to-stone-950",
  },
  {
    id: "flagship-smartphones",
    badge: "NEW FLAGSHIP ARRIVALS",
    badgeBg: "bg-primary text-white",
    title: "Brand New Mobile Phones & Tablets",
    subtitle:
      "Experience next-gen titanium builds, pro cameras, and all-day battery life.",
    ctaText: "Shop Mobile Devices",
    ctaHref: "/shop?q=phone",
    imageSrc: "/hero-phone.webp",
    imageAlt: "Flagship Smartphones and Tablets",
    bgClass: "from-[#1c1917] via-[#0c0a09] to-black",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  // Auto advance every 5.5 seconds unless paused
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5500)
    return () => clearInterval(timer)
  }, [isPaused, nextSlide])

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) nextSlide()
    if (diff < -50) prevSlide()
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div
      className="pb-6 bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="">
        <div
          className="relative overflow-hidden bg-black text-white shadow-xl min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides Carousel */}
          {SLIDES.map((slide, index) => {
            const isActive = index === currentSlide
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out bg-gradient-to-r ${
                  slide.bgClass
                } ${
                  isActive
                    ? "opacity-100 z-10 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div className="content-container h-full flex flex-col justify-center py-10 sm:py-14 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
                    {/* Left: Text & CTA */}
                    <div className="lg:col-span-7 space-y-4 max-w-xl pr-0 lg:pr-6">
                      <span
                        className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1 inline-block shadow-xs ${slide.badgeBg}`}
                      >
                        {slide.badge}
                      </span>

                      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                        {slide.title}
                      </h1>

                      <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed max-w-lg">
                        {slide.subtitle}
                      </p>

                      <div className="pt-2 sm:pt-4">
                        <LocalizedClientLink
                          href={slide.ctaHref}
                          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 transition-colors uppercase tracking-wider shadow-lg"
                        >
                          <span>{slide.ctaText}</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </LocalizedClientLink>
                      </div>
                    </div>

                    {/* Right: High-Res Image Display */}
                    <div className="lg:col-span-5 relative flex items-center justify-center h-52 sm:h-72 lg:h-96">
                      <div className="relative w-full h-full max-h-[360px]">
                        <Image
                          src={slide.imageSrc}
                          alt={slide.imageAlt}
                          fill
                          className="object-contain drop-shadow-2xl"
                          sizes="(max-width: 768px) 100vw, 550px"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Left / Right Arrow Navigation */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-xs"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-xs"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Pagination Indicators (Dots / Bars) */}
          <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex justify-center items-center gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 h-2 bg-primary"
                    : "w-2.5 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
