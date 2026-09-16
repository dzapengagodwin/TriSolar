import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { trackRemoveFromCart, transformLineItemToGA4Item } from "@lib/analytics/ecommerce"

const DeleteButton = ({
  id,
  children,
  className,
  item,
  currencyCode = "USD",
}: {
  id: string
  children?: React.ReactNode
  className?: string
  item?: HttpTypes.StoreCartLineItem | Record<string, unknown>
  currencyCode?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteLineItem(id)
      if (item) {
        trackRemoveFromCart({
          item: transformLineItemToGA4Item(item),
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
          currency: currencyCode.toUpperCase(),
        })
      }
    } catch (_err) {
      // ignore
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
