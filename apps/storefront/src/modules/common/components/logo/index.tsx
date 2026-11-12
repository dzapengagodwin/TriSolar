import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LogoProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md", className }: LogoProps) {
  const markSize = size === "sm" ? "h-7 w-7 text-sm" : size === "lg" ? "h-12 w-12 text-xl" : "h-9 w-9 text-base"

  return (
    <LocalizedClientLink href="/" className={`flex items-center gap-2.5 shrink-0 ${className || ""}`} data-testid="store-logo-link" aria-label="TRITECH home">
      <span className={`flex items-center justify-center rounded-md bg-blue-600 font-bold tracking-tight text-white ${markSize}`}>T.</span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-[.12em] text-[#0B1B36]">TRITECH</span>
        <span className="mt-1 text-[8px] font-semibold uppercase tracking-[.16em] text-slate-500">Laptops. Networking. Technology.</span>
      </span>
    </LocalizedClientLink>
  )
}
