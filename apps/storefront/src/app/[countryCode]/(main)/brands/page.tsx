import { Metadata } from "next"
import { listBrands } from "@lib/data/brands"
import BrandDirectoryTemplate from "@modules/brands/templates/brand-directory-template"

export const metadata: Metadata = {
  title: "Brand Directory | Laptop Zone",
  description:
    "Explore our complete directory of official hardware, laptop, desktop, and accessory brands.",
}

export default async function BrandsDirectoryPage() {
  const brands = await listBrands({ limit: 100 }).catch(() => [])

  return <BrandDirectoryTemplate brands={brands} />
}
