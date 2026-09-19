import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <div className="sticky top-28 flex flex-col gap-y-6">
      <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col gap-y-5">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          In Your Cart
        </h2>

        <CartTotals totals={cart} />

        <Divider />

        <ItemsPreviewTemplate cart={cart} />

        <Divider />

        <DiscountCode cart={cart} />
      </div>
    </div>
  )
}

export default CheckoutSummary
