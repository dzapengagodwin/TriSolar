export type ProductImageItem = {
  id: string
  url: string
  productId: string
  productTitle: string
  variantSku?: string | null
}

export type CurrentProductImage = {
  id?: string
  url: string
}

export type ProductMediaPickerProps = {
  productId: string
  productTitle?: string
  currentImages: CurrentProductImage[]
  currentThumbnail?: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

