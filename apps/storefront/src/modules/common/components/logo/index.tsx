import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LogoProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md", className }: LogoProps) {
  const height = size === "sm" ? 28 : size === "lg" ? 48 : 36

  return (
    <LocalizedClientLink
      href="/"
      className={`flex items-center gap-x-2 group shrink-0 ${className || ""}`}
      data-testid="store-logo-link"
    >
      <div className="relative flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Laptopzone Logo"
          width={height * 3.5}
          height={height}
          className="object-contain h-auto w-auto max-h-7 sm:max-h-9 md:max-h-11"
          priority
        />
      </div>
    </LocalizedClientLink>
  )
}
