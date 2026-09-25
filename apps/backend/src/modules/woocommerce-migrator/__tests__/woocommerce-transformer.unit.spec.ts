import { WooCommerceTransformer } from "../services/woocommerce-transformer"
import { WooProduct, WooVariation } from "../services/woocommerce-client"
import { ProductStatus } from "@medusajs/framework/utils"

function createMockProduct(overrides: Partial<WooProduct> = {}): WooProduct {
  return {
    id: 101,
    name: "Test Product",
    slug: "test-product",
    type: "simple",
    status: "publish",
    description: "<p>Sample description</p>",
    short_description: "<p>Sample short description</p>",
    sku: "TEST-SKU",
    price: "29.99",
    regular_price: "29.99",
    sale_price: "",
    categories: [],
    tags: [],
    images: [],
    attributes: [],
    weight: "1.5",
    dimensions: { length: "10", width: "20", height: "5" },
    stock_quantity: 10,
    stock_status: "instock",
    manage_stock: true,
    variations: [],
    ...overrides,
  }
}

function createMockVariation(overrides: Partial<WooVariation> = {}): WooVariation {
  return {
    id: 201,
    sku: "TEST-VAR-1",
    price: "29.99",
    regular_price: "29.99",
    sale_price: "",
    attributes: [],
    stock_quantity: 5,
    stock_status: "instock",
    manage_stock: true,
    weight: "1.5",
    dimensions: { length: "10", width: "20", height: "5" },
    ...overrides,
  }
}

describe("WooCommerceTransformer Unit Tests", () => {
  const transformer = new WooCommerceTransformer()
  const emptyCategoryMap = new Map<number, string>()

  describe("Price conversion (via transformProduct)", () => {
    it("should convert simple product price '29.99' to 29.99", () => {
      const product = createMockProduct({
        regular_price: "29.99",
        price: "29.99",
      })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.variants).toHaveLength(1)
      expect(result.variants[0].prices[0].amount).toBe(29.99)
      expect(result.variants[0].prices[0].currency_code).toBe("usd")
    })

    it("should convert simple product price with thousands separator '1,299.99' to 1299.99", () => {
      const product = createMockProduct({
        regular_price: "1,299.99",
        price: "1,299.99",
      })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.variants).toHaveLength(1)
      expect(result.variants[0].prices[0].amount).toBe(1299.99)
    })

    it("should convert whole dollar prices like '1,090.00' to 1090 without 100x multiplier", () => {
      const product = createMockProduct({
        regular_price: "1,090.00",
        price: "1,090.00",
      })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.variants).toHaveLength(1)
      expect(result.variants[0].prices[0].amount).toBe(1090)
    })

    it("should use effective sale price for variant when on sale", () => {
      const product = createMockProduct({
        regular_price: "1200.00",
        sale_price: "1090.00",
        price: "1090.00",
      })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.variants).toHaveLength(1)
      expect(result.variants[0].prices[0].amount).toBe(1090)
      expect(result.metadata?.woo_regular_price).toBe("1200.00")
      expect(result.metadata?.woo_sale_price).toBe("1090.00")
    })

    it("should handle empty price by setting amount to 0", () => {
      const product = createMockProduct({
        regular_price: "",
        price: "",
      })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.variants).toHaveLength(1)
      expect(result.variants[0].prices[0].amount).toBe(0)
    })

    it("should handle price of '0' by setting amount to 0", () => {
      const product = createMockProduct({
        regular_price: "0",
        price: "0",
      })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.variants).toHaveLength(1)
      expect(result.variants[0].prices[0].amount).toBe(0)
    })
  })

  describe("Handle sanitization (sanitizeHandle)", () => {
    it("should sanitize standard product title with spaces", () => {
      expect(transformer.sanitizeHandle("HP EliteBook 840")).toBe("hp-elitebook-840")
    })

    it("should preserve already hyphenated lowercase handle", () => {
      expect(transformer.sanitizeHandle("lenovo-thinkpad-e14")).toBe("lenovo-thinkpad-e14")
    })

    it("should return empty string for empty input", () => {
      expect(transformer.sanitizeHandle("")).toBe("")
    })

    it("should collapse multiple consecutive spaces into single hyphens", () => {
      expect(transformer.sanitizeHandle("product with  spaces")).toBe("product-with-spaces")
    })

    it("should strip quote/inch marks and convert special characters to hyphens", () => {
      expect(transformer.sanitizeHandle("15.6\" Laptop")).toBe("15-6-laptop")
    })
  })

  describe("Variable product option filtering", () => {
    it("should filter only variation: true attributes into options and store non-variation attributes in metadata", () => {
      const product = createMockProduct({
        type: "variable",
        attributes: [
          {
            id: 1,
            name: "Color",
            position: 0,
            visible: true,
            variation: true,
            options: ["Midnight Black", "Glacier Silver"],
          },
          {
            id: 2,
            name: "RAM",
            position: 1,
            visible: true,
            variation: true,
            options: ["16GB", "32GB"],
          },
          {
            id: 3,
            name: "Processor",
            position: 2,
            visible: true,
            variation: false,
            options: ["Intel Core i7-1355U"],
          },
          {
            id: 4,
            name: "Operating System",
            position: 3,
            visible: true,
            variation: false,
            options: ["Windows 11 Pro"],
          },
        ],
      })

      const variations: WooVariation[] = [
        createMockVariation({
          id: 501,
          sku: "LAPTOP-BLK-16",
          price: "1199.99",
          regular_price: "1199.99",
          attributes: [
            { id: 1, name: "Color", option: "Midnight Black" },
            { id: 2, name: "RAM", option: "16GB" },
          ],
        }),
        createMockVariation({
          id: 502,
          sku: "LAPTOP-SLV-32",
          price: "1399.99",
          regular_price: "1399.99",
          attributes: [
            { id: 1, name: "Color", option: "Glacier Silver" },
            { id: 2, name: "RAM", option: "32GB" },
          ],
        }),
      ]

      const result = transformer.transformProduct(product, variations, "usd", emptyCategoryMap)

      // Only variation: true attributes should be in options
      expect(result.options).toHaveLength(2)
      expect(result.options[0]).toEqual({
        title: "Color",
        values: ["Midnight Black", "Glacier Silver"],
      })
      expect(result.options[1]).toEqual({
        title: "RAM",
        values: ["16GB", "32GB"],
      })

      // Non-variation attributes should NOT be in options
      const optionTitles = result.options.map((opt) => opt.title)
      expect(optionTitles).not.toContain("Processor")
      expect(optionTitles).not.toContain("Operating System")

      // Non-variation attributes should be stored in metadata.specifications
      expect(result.metadata?.specifications).toEqual({
        Processor: ["Intel Core i7-1355U"],
        "Operating System": ["Windows 11 Pro"],
      })
      expect(result.metadata?.specifications?.Color).toBeUndefined()
      expect(result.metadata?.specifications?.RAM).toBeUndefined()

      // Variants should reflect the variation options
      expect(result.variants).toHaveLength(2)
      expect(result.variants[0].options).toEqual({
        Color: "Midnight Black",
        RAM: "16GB",
      })
      expect(result.variants[0].prices[0].amount).toBe(1199.99)
      expect(result.variants[1].options).toEqual({
        Color: "Glacier Silver",
        RAM: "32GB",
      })
      expect(result.variants[1].prices[0].amount).toBe(1399.99)
    })
  })

  describe("HTML cleaning (via transformProduct)", () => {
    it("should decode common WordPress HTML entities in descriptions", () => {
      const rawHtml = "Lenovo ThinkPad &mdash; reliable &amp; powerful &hellip; &ldquo;Top Tier&rdquo; &#8217;laptop&#8217; &copy; &trade;"
      const product = createMockProduct({
        description: rawHtml,
        short_description: "",
      })

      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.description).toContain("\u2014")
      expect(result.description).toContain("&")
      expect(result.description).toContain("...")
      expect(result.description).toContain('"Top Tier"')
      expect(result.description).toContain("'laptop'")
      expect(result.description).not.toContain("&mdash;")
      expect(result.description).not.toContain("&amp;")
      expect(result.description).not.toContain("&hellip;")
      expect(result.description).not.toContain("&ldquo;")
      expect(result.description).not.toContain("&rdquo;")
      expect(result.description).not.toContain("&#8217;")
    })

    it("should strip HTML tags from product description", () => {
      const rawHtml = "<p>This is a <strong>high performance</strong> laptop with <em>exceptional</em> battery life.</p>"
      const product = createMockProduct({
        description: rawHtml,
        short_description: "",
      })

      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.description).toBe("This is a high performance laptop with exceptional battery life.")
      expect(result.description).not.toMatch(/<[^>]+>/)
    })

    it("should convert list items into clean bullet points", () => {
      const rawHtml = "<ul><li>Intel Core Ultra 7</li><li>32GB LPDDR5x RAM</li><li>1TB NVMe Gen4 SSD</li></ul>"
      const product = createMockProduct({
        description: rawHtml,
        short_description: "",
      })

      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.description).toContain("• Intel Core Ultra 7")
      expect(result.description).toContain("• 32GB LPDDR5x RAM")
      expect(result.description).toContain("• 1TB NVMe Gen4 SSD")
      expect(result.description).toBe("• Intel Core Ultra 7\n• 32GB LPDDR5x RAM\n• 1TB NVMe Gen4 SSD")
    })
  })

  describe("Dimensions & Weight Mapping", () => {
    it("should map dimensions and weight to product top-level fields and metadata", () => {
      const product = createMockProduct({
        weight: "2.35",
        dimensions: {
          length: "35.8",
          width: "24.2",
          height: "1.99",
        },
      })

      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.weight).toBe(2.35)
      expect(result.length).toBe(35.8)
      expect(result.width).toBe(24.2)
      expect(result.height).toBe(1.99)

      expect(result.variants[0].weight).toBe(2.35)
      expect(result.variants[0].length).toBe(35.8)
      expect(result.variants[0].width).toBe(24.2)
      expect(result.variants[0].height).toBe(1.99)

      expect(result.metadata?.dimensions).toEqual({
        length: 35.8,
        width: 24.2,
        height: 1.99,
      })
    })

    it("should handle empty or invalid dimensions gracefully", () => {
      const product = createMockProduct({
        weight: "",
        dimensions: {
          length: "",
          width: "0",
          height: "-5",
        },
      })

      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.weight).toBeUndefined()
      expect(result.length).toBeUndefined()
      expect(result.width).toBeUndefined()
      expect(result.height).toBeUndefined()
      expect(result.metadata?.dimensions).toBeUndefined()
    })

    it("should map variation-specific dimensions when provided or inherit from product", () => {
      const product = createMockProduct({
        type: "variable",
        weight: "1.5",
        dimensions: { length: "30", width: "20", height: "2" },
        attributes: [
          {
            id: 1,
            name: "Size",
            position: 0,
            visible: true,
            variation: true,
            options: ["Small", "Large"],
          },
        ],
      })

      const variations: WooVariation[] = [
        createMockVariation({
          id: 601,
          sku: "VAR-SMALL",
          attributes: [{ id: 1, name: "Size", option: "Small" }],
          weight: "1.2",
          dimensions: { length: "25", width: "18", height: "1.5" },
        }),
        createMockVariation({
          id: 602,
          sku: "VAR-LARGE",
          attributes: [{ id: 1, name: "Size", option: "Large" }],
          weight: "", // empty, should inherit from product
          dimensions: undefined, // undefined, should inherit from product
        }),
      ]

      const result = transformer.transformProduct(product, variations, "usd", emptyCategoryMap)

      expect(result.variants).toHaveLength(2)
      // Variation 1 with its own dimensions
      expect(result.variants[0].weight).toBe(1.2)
      expect(result.variants[0].length).toBe(25)
      expect(result.variants[0].width).toBe(18)
      expect(result.variants[0].height).toBe(1.5)

      // Variation 2 inherits product dimensions
      expect(result.variants[1].weight).toBe(1.5)
      expect(result.variants[1].length).toBe(30)
      expect(result.variants[1].width).toBe(20)
      expect(result.variants[1].height).toBe(2)
    })
  })

  describe("Publish Status Mapping", () => {
    it("should map WooCommerce 'publish' status to ProductStatus.PUBLISHED", () => {
      const product = createMockProduct({ status: "publish" })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.status).toBe(ProductStatus.PUBLISHED)
      expect(result.metadata?.woo_status).toBe("publish")
    })

    it("should map case-insensitive 'Publish' with spaces to ProductStatus.PUBLISHED", () => {
      const product = createMockProduct({ status: "  Publish  " as any })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.status).toBe(ProductStatus.PUBLISHED)
    })

    it("should map WooCommerce 'draft' status to ProductStatus.DRAFT", () => {
      const product = createMockProduct({ status: "draft" })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.status).toBe(ProductStatus.DRAFT)
      expect(result.metadata?.woo_status).toBe("draft")
    })

    it("should map WooCommerce 'private' status to ProductStatus.DRAFT", () => {
      const product = createMockProduct({ status: "private" })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.status).toBe(ProductStatus.DRAFT)
      expect(result.metadata?.woo_status).toBe("private")
    })

    it("should map WooCommerce 'pending' status to ProductStatus.DRAFT", () => {
      const product = createMockProduct({ status: "pending" })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.status).toBe(ProductStatus.DRAFT)
      expect(result.metadata?.woo_status).toBe("pending")
    })

    it("should map WooCommerce 'trash' status to ProductStatus.DRAFT", () => {
      const product = createMockProduct({ status: "trash" as any })
      const result = transformer.transformProduct(product, [], "usd", emptyCategoryMap)

      expect(result.status).toBe(ProductStatus.DRAFT)
      expect(result.metadata?.woo_status).toBe("trash")
    })
  })
})
