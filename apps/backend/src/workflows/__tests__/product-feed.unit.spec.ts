import { getProductBrand } from "../steps/get-product-brand"
import { validateFeedItem } from "../steps/validate-feed-item"
import { mapProductToFeedItem } from "../steps/map-product-to-feed-item"
import { generateGoogleProductFeedXml } from "../steps/build-product-feed-xml"
import { ProductFeedConfig, ProductFeedItem } from "../steps/types"

describe("Google Merchant Center Product Feed Unit Tests", () => {
  const sampleConfig: ProductFeedConfig = {
    country_code: "ZW",
    currency_code: "USD",
    storefront_url: "https://laptopzone.co.zw",
    feed_title: "Laptopzone Feed",
    feed_description: "Laptopzone Product Feed",
  }

  describe("getProductBrand", () => {
    it("should resolve brand from linked brand entity", () => {
      const brand = getProductBrand({
        title: "Some Generic Laptop",
        brand: { name: "Lenovo" },
      })
      expect(brand).toBe("Lenovo")
    })

    it("should resolve brand from product metadata", () => {
      const brand = getProductBrand({
        title: "Gaming Laptop",
        metadata: { brand: "ASUS" },
      })
      expect(brand).toBe("Asus")
    })

    it("should extract canonical brand from product title", () => {
      const brand = getProductBrand({
        title: "Dell Latitude 5420 Core i5 16GB RAM 512GB SSD",
      })
      expect(brand).toBe("Dell")
    })

    it("should extract Apple from MacBook title", () => {
      const brand = getProductBrand({
        title: "MacBook Pro 16-inch M3 Max 36GB RAM",
      })
      expect(brand).toBe("Apple")
    })
  })

  describe("mapProductToFeedItem", () => {
    it("should map product and variant to valid Google feed item structure", () => {
      const mockProduct = {
        id: "prod_thinkpad",
        title: "Lenovo ThinkPad E14",
        subtitle: "Enterprise ready laptop",
        description: "<p>Powerful <strong>AMD Ryzen</strong> laptop with <em>FHD</em> display.</p>",
        handle: "lenovo-thinkpad-e14",
        thumbnail: "https://laptopzone.co.zw/images/thinkpad.jpg",
        images: [{ url: "https://laptopzone.co.zw/images/thinkpad.jpg" }, { url: "https://laptopzone.co.zw/images/thinkpad-side.jpg" }],
        categories: [{ name: "Laptops", handle: "laptops" }],
        collection: { title: "Business Laptops" },
      }

      const mockVariant = {
        id: "variant_16_512",
        title: "16GB RAM / 512GB SSD",
        sku: "E14-16-512",
        barcode: "195477889900",
        manage_inventory: true,
        allow_backorder: false,
        inventory_items: [
          {
            inventory: {
              location_levels: [{ stocked_quantity: 10, reserved_quantity: 2 }],
            },
          },
        ],
        calculated_price: {
          calculated_amount: 850,
          original_amount: 950,
        },
      }

      const item = mapProductToFeedItem(mockProduct, mockVariant, sampleConfig)

      expect(item.id).toBe("variant_16_512")
      expect(item.item_group_id).toBe("prod_thinkpad")
      expect(item.title).toBe("Lenovo ThinkPad E14 - 16GB RAM / 512GB SSD")
      expect(item.description).toBe("Powerful AMD Ryzen laptop with FHD display.")
      expect(item.link).toBe("https://laptopzone.co.zw/products/lenovo-thinkpad-e14")
      expect(item.image_link).toBe("https://laptopzone.co.zw/images/thinkpad.jpg")
      expect(item.additional_image_link).toEqual(["https://laptopzone.co.zw/images/thinkpad-side.jpg"])
      expect(item.availability).toBe("in_stock")
      expect(item.price).toBe("950.00 USD")
      expect(item.sale_price).toBe("850.00 USD")
      expect(item.brand).toBe("Lenovo")
      expect(item.gtin).toBe("195477889900")
      expect(item.mpn).toBeUndefined()
      expect(item.identifier_exists).toBe("yes")
      expect(item.product_type).toBe("Laptops")
      expect(item.google_product_category).toBeUndefined()
      expect(item.custom_label_0).toBe("Business Laptops")
    })

    it("uses explicit Merchant overrides and never exports an unverified SKU as MPN", () => {
      const product = {
        id: "prod_ps5",
        title: "Sony PlayStation 5 1TB Console",
        handle: "sony-playstation-5-1tb-console",
        description: "Long generic copy",
        metadata: {
          google_merchant: {
            google_product_category: "1294",
            product_type: "Gaming Consoles > PlayStation 5",
            title: "Sony PlayStation 5 1TB Console",
            description: "Sony PlayStation 5 1TB console with 4K gaming.",
          },
        },
        categories: [{ name: "Gaming Consoles" }],
      }
      const variant = {
        id: "variant_ps5",
        title: "Default Value",
        sku: "PS5-1000",
        manage_inventory: false,
        prices: [{ amount: 995, currency_code: "USD" }],
      }

      const item = mapProductToFeedItem(product, variant, sampleConfig)

      expect(item.title).toBe("Sony PlayStation 5 1TB Console")
      expect(item.description).toBe("Sony PlayStation 5 1TB console with 4K gaming.")
      expect(item.google_product_category).toBe("1294")
      expect(item.product_type).toBe("Gaming Consoles > PlayStation 5")
      expect(item.mpn).toBeUndefined()
    })
  })

  describe("validateFeedItem", () => {
    it("should validate a complete item successfully", () => {
      const validItem: ProductFeedItem = {
        id: "var_123",
        title: "HP ProBook 450 G10",
        description: "Intel Core i7 13th Gen laptop",
        link: "https://laptopzone.co.zw/zw/products/hp-probook-450-g10",
        image_link: "https://laptopzone.co.zw/hp.jpg",
        availability: "in_stock",
        price: "799.00 USD",
        condition: "new",
        brand: "HP",
        gtin: "123456789012",
        identifier_exists: "yes",
      }

      const result = validateFeedItem(validItem)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should reject items missing required fields", () => {
      const invalidItem: any = {
        id: "",
        title: "",
        link: "invalid-url",
        image_link: "",
        availability: "unknown_status",
        price: "invalid_price",
      }

      const result = validateFeedItem(invalidItem)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it("should set identifier_exists to 'no' when missing GTIN and MPN", () => {
      const itemWithoutIdentifiers: ProductFeedItem = {
        id: "var_custom",
        title: "Unbranded Custom Cable",
        description: "USB-C to USB-C cable",
        link: "https://laptopzone.co.zw/zw/products/custom-cable",
        image_link: "https://laptopzone.co.zw/cable.jpg",
        availability: "in_stock",
        price: "15.00 USD",
        condition: "new",
        identifier_exists: "yes",
      }

      const result = validateFeedItem(itemWithoutIdentifiers)
      expect(result.valid).toBe(true)
      expect(result.sanitizedItem.identifier_exists).toBe("no")
    })
  })

  describe("generateGoogleProductFeedXml", () => {
    it("should build valid XML containing RSS headers and item elements", () => {
      const items: ProductFeedItem[] = [
        {
          id: "v_1",
          title: "Lenovo Legion 5 Pro",
          description: "AMD Ryzen 7 RTX 4070 Gaming Laptop",
          link: "https://laptopzone.co.zw/zw/products/legion-5-pro",
          image_link: "https://laptopzone.co.zw/legion.jpg",
          availability: "in_stock",
          price: "1450.00 USD",
          sale_price: "1350.00 USD",
          item_group_id: "prod_legion",
          condition: "new",
          brand: "Lenovo",
          mpn: "LEGION-5-PRO",
          identifier_exists: "yes",
          google_product_category: "Electronics > Computers > Laptops",
          product_type: "Gaming Laptops",
        },
      ]

      const xml = generateGoogleProductFeedXml(items, sampleConfig)

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">')
      expect(xml).toContain("<g:id>v_1</g:id>")
      expect(xml).toContain("<g:title><![CDATA[Lenovo Legion 5 Pro]]></g:title>")
      expect(xml).toContain("<g:price>1450.00 USD</g:price>")
      expect(xml).toContain("<g:sale_price>1350.00 USD</g:sale_price>")
      expect(xml).toContain("<g:item_group_id>prod_legion</g:item_group_id>")
      expect(xml).toContain("<g:brand><![CDATA[Lenovo]]></g:brand>")
      expect(xml).toContain("<g:mpn>LEGION-5-PRO</g:mpn>")
      expect(xml).toContain("<g:identifier_exists>yes</g:identifier_exists>")
      expect(xml).toContain("</rss>")
    })
  })
})
