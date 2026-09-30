import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LogoProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md", className }: LogoProps) {
  const height = size === "sm" ? 28 : size === "lg" ? 48 : 36
  const width = Math.round(height * (414 / 169))

  return (
    <LocalizedClientLink
      href="/"
      className={`flex items-center gap-x-2 group shrink-0 ${className || ""}`}
      data-testid="store-logo-link"
    >
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src="/logo.webp"
          alt="Laptopzone Logo"
          width={width}
          height={height}
          className="object-contain w-full h-full"
          priority
        />
      </div>
    </LocalizedClientLink>
  )
}
