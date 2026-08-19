import { getWishlist } from "@lib/data/wishlist"
import WishlistTemplate from "@modules/wishlist/templates"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View your saved items",
}

export default async function WishlistPage() {
  const wishlist = await getWishlist().catch(() => null)

  return <WishlistTemplate wishlist={wishlist} />
}
