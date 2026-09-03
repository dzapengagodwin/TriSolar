import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { ArrowRight } from "@medusajs/icons"

const PROMOTIONAL_CARDS = [
  {
    title: "LAPTOP DEALS",
    action: "EXPLORE",
    image: "/gaming/gaming-laptops.png",
    href: "/categories/gaming-laptops",
    tone: "bg-[#092438] border-[#159bb5]",
    position: "left-top",
  },
  {
    title: "PRE-BUILT PC'S",
    action: "BROWSE",
    image: "/gaming/gaming-pcs.png",
    href: "/categories/gaming-pcs",
    tone: "bg-[#280507] border-[#d51d2a]",
    position: "feature",
  },
  {
    title: "GRAPHICS CARDS",
    action: "SHOP NOW",
    image: "/gaming/gaming-accessories.png",
    href: "/categories/graphics-cards",
    tone: "bg-[#270619] border-[#a52c78]",
    position: "right-top",
  },
  {
    title: "UPGRADE KITS",
    action: "BUILD",
    image: "/gaming/computer-components.png",
    href: "/categories/computer-components",
    tone: "bg-[#170725] border-[#7934c5]",
    position: "left-bottom",
  },
  {
    title: "MONITOR DEALS",
    action: "VIEW",
    image: "/gaming/gaming-monitors.png",
    href: "/categories/gaming-monitors",
    tone: "bg-[#062c1b] border-[#73b91a]",
    position: "right-bottom",
  },
] as const

export default function GamingSection() {
  return (
    <section className="py-6 sm:py-10" aria-label="Gaming categories">
      <div className="content-container">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 lg:grid-rows-2 lg:h-[600px]">
          {PROMOTIONAL_CARDS.map((card) => (
            <LocalizedClientLink
              key={card.title}
              href={card.href}
              className={`group relative isolate min-h-[220px] overflow-hidden rounded-2xl border-t-2 ${card.tone} p-7 sm:p-8 transition-transform duration-300 hover:-translate-y-1 lg:min-h-0 ${
                card.position === "feature"
                  ? "lg:col-start-2 lg:row-span-2"
                  : card.position === "left-top"
                    ? "lg:col-start-1 lg:row-start-1"
                    : card.position === "left-bottom"
                      ? "lg:col-start-1 lg:row-start-2"
                      : card.position === "right-top"
                        ? "lg:col-start-3 lg:row-start-1"
                        : "lg:col-start-3 lg:row-start-2"
              }`}
            >
              <div className="absolute inset-0 -z-10 bg-black/10" />
              <div className="relative z-10 flex h-full max-w-[58%] flex-col items-start justify-between">
                <h2 className="max-w-[9ch] text-3xl font-black uppercase leading-[1.08] tracking-tight text-white sm:text-4xl">
                  {card.title}
                </h2>
                <span className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs font-black text-white transition-colors group-hover:bg-white/15">
                  {card.action}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="-z-0 object-contain object-right-bottom transition-transform duration-500 group-hover:scale-105"
              />
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
