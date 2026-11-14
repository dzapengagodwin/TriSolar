import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LogoProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md", className }: LogoProps) {
  const imageSize =
    size === "sm"
      ? "h-[36px] w-[120px]"
      : size === "lg"
        ? "h-[70px] w-[240px]"
        : "h-[36px] w-[115px] sm:h-[50px] sm:w-[175px]"

  return (
    <LocalizedClientLink
      href="/"
      className={`relative block shrink-0 ${imageSize} ${className || ""}`}
      data-testid="store-logo-link"
      aria-label="Tritech home"
    >
      <Image
        src="/logo.png"
        alt="Tritech - Enterprise Networking & Laptops"
        fill
        priority
        sizes={
          size === "lg"
            ? "240px"
            : size === "sm"
              ? "120px"
              : "(min-width: 640px) 175px, 115px"
        }
        className="object-contain object-left"
      />
    </LocalizedClientLink>
  )
}
