import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import CartViewTracker from "../components/cart-view-tracker"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
  isPickupOnly,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  isPickupOnly?: boolean
}) => {
  return (
    <div className="py-8 sm:py-12 bg-[#F8FAF9] min-h-screen">
      <CartViewTracker cart={cart} />
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_340px] medium:grid-cols-[1fr_380px] gap-6 sm:gap-8 items-start">
            {/* Left Main Card: Cart Items & Sign-In Prompt */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 shadow-sm flex flex-col gap-y-6">
              {!customer && (
                <SignInPrompt />
              )}
              <ItemsTemplate cart={cart} />
            </div>

            {/* Right Card: Sticky Order Summary */}
            <div className="sticky top-28">
              {cart && cart.region && (
                <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 shadow-sm">
                  <Summary cart={cart} isPickup={isPickupOnly} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
