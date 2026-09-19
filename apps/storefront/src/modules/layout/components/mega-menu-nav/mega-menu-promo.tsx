import React from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { MegaMenuPromo as MegaMenuPromoType } from "./mega-menu-config"

type MegaMenuPromoProps = {
  promo: MegaMenuPromoType
  onClose: () => void
}

export default function MegaMenuPromo({ promo, onClose }: MegaMenuPromoProps) {
  return (
    <LocalizedClientLink
      href={promo.href}
      onClick={onClose}
      className="group relative col-span-12 lg:col-span-4 bg-[#0B0D12] border border-gray-800/80 rounded-xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-sm hover:border-gray-700 transition-colors min-h-[220px] lg:min-h-full"
    >
      <div className="relative z-10 max-w-[58%] space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary inline-block">
          {promo.eyebrow}
        </span>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight text-white pt-0.5">
          {promo.title.map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < promo.title.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h3>

        <p className="text-xs font-medium text-gray-400 pt-1 line-clamp-2">
          {promo.description}
        </p>
      </div>

      <div className="relative z-10 pt-5">
        <span className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-lg bg-white text-gray-900 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
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
        </span>
      </div>

      {promo.image && (
        <div className="absolute right-0 bottom-0 w-[46%] h-[86%] -z-0 flex items-end justify-end p-2 sm:p-3 pointer-events-none">
          <Image
            src={promo.image}
            alt={promo.title.join(" ")}
            fill
            sizes="(max-width: 1024px) 100vw, 25vw"
            className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-105 drop-shadow-xl"
          />
        </div>
      )}
    </LocalizedClientLink>
  )
}

