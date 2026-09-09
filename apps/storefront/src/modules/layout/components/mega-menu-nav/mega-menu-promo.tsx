import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { MegaMenuPromo as MegaMenuPromoType } from "./mega-menu-config"

type MegaMenuPromoProps = {
  promo: MegaMenuPromoType
  onClose: () => void
}

export default function MegaMenuPromo({ promo, onClose }: MegaMenuPromoProps) {
  const isDarkText = promo.darkText

  return (
    <div
      className={`col-span-12 lg:col-span-4 bg-gradient-to-br ${promo.gradient} rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-md`}
    >
      {/* Decorative ambient pattern */}
      <div
        className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-1.5">
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block ${
            isDarkText ? "bg-black/10 text-black" : "bg-white/20 text-white"
          }`}
        >
          {promo.eyebrow}
        </span>

        <h3
          className={`text-xl sm:text-2xl font-black tracking-tight leading-tight pt-1 ${
            isDarkText ? "text-gray-950" : "text-white"
          }`}
        >
          {promo.title.map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < promo.title.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h3>

        <p
          className={`text-xs font-medium pt-1 line-clamp-2 ${
            isDarkText ? "text-gray-800" : "text-white/90"
          }`}
        >
          {promo.description}
        </p>
      </div>

      <div className="relative z-10 pt-5">
        <LocalizedClientLink
          href={promo.href}
          onClick={onClose}
          className={`inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-full transition-all shadow-sm ${
            isDarkText
              ? "bg-black hover:bg-gray-900 text-white"
              : "bg-white hover:bg-gray-100 text-black"
          }`}
        >
          <span>{promo.cta}</span>
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
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
  )
}
