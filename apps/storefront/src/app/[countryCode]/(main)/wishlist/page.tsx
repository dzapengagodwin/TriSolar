import { getWishlist } from "@lib/data/wishlist"
import WishlistTemplate from "@modules/wishlist/templates"
import { Metadata } from "next"
import { ComponentProps } from "react"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View your saved items",
  robots: {
    index: false,
    follow: false,
  },
}

type WishlistData = NonNullable<ComponentProps<typeof WishlistTemplate>["wishlist"]>

export default async function WishlistPage() {
  const rawWishlist = await getWishlist().catch(() => null)

  const wishlist: WishlistData | null = rawWishlist
    ? {
        id: rawWishlist.id,
        items: (rawWishlist.items || []).map((item) => ({
          ...item,
          variant_id: item.variant_id || item.product_variant_id,
          product_variant: item.product_variant
            ? {
                ...item.product_variant,
                product: item.product_variant.product ?? undefined,
              }
            : undefined,
        })),
      }
    : null

  return <WishlistTemplate wishlist={wishlist} />
}
