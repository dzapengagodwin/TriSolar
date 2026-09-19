import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@modules/common/components/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const totalQuantity = items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <div>
      <div className="pb-4 flex items-center justify-between border-b border-gray-100 mb-4">
        <div className="flex items-center gap-x-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
          <span className="bg-gray-100 text-black text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
            {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
          </span>
        </div>
      </div>
      <Table>
        <Table.Header className="border-t-0 bg-gray-50 rounded-xl">
          <Table.Row className="text-gray-500 font-bold text-xs">
            <Table.HeaderCell className="!pl-4">Item</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">
              Price
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-4 text-right">
              Total
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code || "usd"}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
