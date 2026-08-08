import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  let rawPrice = typeof price === "string" ? price : (price?.calculated_price ?? price?.original_price ?? "$ 445.00")
  let displayPrice = String(rawPrice)
  if (!displayPrice.startsWith("$ ")) {
    const cleaned = displayPrice.replace(/[^0-9.,]/g, "").trim()
    displayPrice = cleaned ? `$ ${cleaned}` : displayPrice
  }

  return (
    <div className="flex items-baseline gap-x-2">
      <span
        className="text-xs font-bold text-gray-800"
        data-testid="price"
      >
        {displayPrice}
      </span>
      {price.price_type === "sale" && (
        <span
          className="text-xs line-through text-gray-400 font-normal"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
    </div>
  )
}
