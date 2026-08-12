import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LogoProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md" }: LogoProps) {
  const height = size === "sm" ? 32 : size === "lg" ? 48 : 40

  return (
    <LocalizedClientLink
      href="/"
      className="flex items-center gap-x-2.5 group shrink-0"
      data-testid="store-logo-link"
    >
      <div className="relative flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Laptop Zone Logo"
          width={height * 3}
          height={height}
          className="object-contain h-auto w-auto max-h-12"
          priority
        />
      </div>
    </LocalizedClientLink>
  )
}
