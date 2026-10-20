"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import {
  XMark,
  ChevronLeft,
  ChevronRight,
  ArrowsPointingOut,
} from "@medusajs/icons"
import { getProductImageAlt } from "@lib/seo"
import { useSearchParams } from "next/navigation"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  variants?: HttpTypes.StoreProductVariant[] | null
  productTitle?: string
  brand?: string
}

const ImageGallery = ({
  images,
  variants,
  productTitle,
  brand,
}: ImageGalleryProps) => {
  const searchParams = useSearchParams()
  const selectedVariantId = searchParams.get("v_id")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selectedVariant = variants?.find(
    (variant) => variant.id === selectedVariantId
  )
  const variantImages = selectedVariant?.images
  const galleryImages =
    variantImages && variantImages.length > 0 ? variantImages : images || []
  const totalCount = galleryImages.length

  const activeImage = galleryImages[selectedIndex] || galleryImages[0]

  useEffect(() => {
    setSelectedIndex(0)
  }, [selectedVariantId])

  // Keyboard navigation for modal (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return
      if (e.key === "Escape") setIsModalOpen(false)
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev === 0 ? galleryImages.length - 1 : prev - 1
        )
      }
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev === galleryImages.length - 1 ? 0 : prev + 1
        )
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen, galleryImages.length])

  return (
    <div className="w-full relative">
      {/* 1. Main Gallery Grid: Left Thumbnails + Right Main Image */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 items-start">
        {/* Left Column: Vertical Thumbnails Stack */}
        <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px] w-full sm:w-24 shrink-0 pb-2 sm:pb-0 scrollbar-none">
          {galleryImages.map((img, idx) => {
            const thumbnailAlt = getProductImageAlt({
              title: productTitle,
              brand,
              index: idx,
              totalImages: totalCount,
            })

            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl border-2 overflow-hidden bg-white p-1.5 transition-all flex items-center justify-center shrink-0 ${
                  selectedIndex === idx
                    ? "border-black shadow-md ring-2 ring-black/20"
                    : "border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100"
                }`}
              >
                {img.url ? (
                  <Image
                    src={img.url}
                    alt={thumbnailAlt}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-mono">
                    No Image
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Right Main Image Viewport */}
        <div className="relative flex-1 w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm aspect-square flex items-center justify-center overflow-hidden group">
          {/* Main Image Container */}
          <div
            className="relative w-full h-full cursor-zoom-in flex items-center justify-center"
            onClick={() => setIsModalOpen(true)}
          >
            {activeImage?.url && (
              <Image
                src={activeImage.url}
                alt={getProductImageAlt({
                  title: productTitle,
                  brand,
                  index: selectedIndex,
                  totalImages: totalCount,
                })}
                fill
                priority
                className="object-contain transition-all duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            )}
          </div>

          {/* Circular Expand Button with Real Icon */}
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Expand Image Modal"
            className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-11 h-11 bg-white hover:bg-gray-100 text-gray-800 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 z-10"
          >
            <ArrowsPointingOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* 2. Full-Screen Image Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fade-in select-none">
          {/* Modal Top Header: Counter & Close Button */}
          <div className="flex items-center justify-between text-white w-full max-w-6xl mx-auto">
            <span className="text-xs font-mono font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/20">
              {selectedIndex + 1} / {galleryImages.length}
            </span>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
              aria-label="Close modal"
            >
              <XMark className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body: Left Arrow, Main Display, Right Arrow */}
          <div className="relative flex-1 flex items-center justify-between max-w-6xl w-full mx-auto my-4 overflow-hidden">
            {/* Previous Arrow */}
            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === 0 ? galleryImages.length - 1 : prev - 1
                )
              }
              className="w-12 h-12 bg-white/10 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 z-20 shrink-0"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            {/* Center Expanded High-Res Image */}
            <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center p-4">
              {activeImage?.url && (
                <Image
                  src={activeImage.url}
                  alt={getProductImageAlt({
                    title: productTitle,
                    brand,
                    index: selectedIndex,
                    totalImages: totalCount,
                  })}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              )}
            </div>

            {/* Next Arrow */}
            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === galleryImages.length - 1 ? 0 : prev + 1
                )
              }
              className="w-12 h-12 bg-white/10 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 z-20 shrink-0"
              aria-label="Next Image"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          {/* Modal Bottom Thumbnail Strip */}
          <div className="flex justify-center items-center gap-3 max-w-4xl mx-auto overflow-x-auto py-2">
            {galleryImages.map((img, idx) => {
              const modalThumbAlt = getProductImageAlt({
                title: productTitle,
                brand,
                index: idx,
                totalImages: totalCount,
              })

              return (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden bg-white p-1 transition-all shrink-0 ${
                    selectedIndex === idx
                      ? "border-primary ring-2 ring-primary/50 scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {img.url && (
                    <Image
                      src={img.url}
                      alt={modalThumbAlt}
                      fill
                      className="object-contain p-0.5"
                      sizes="64px"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageGallery
