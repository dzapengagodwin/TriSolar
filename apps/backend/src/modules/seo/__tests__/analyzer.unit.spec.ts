import { analyzeProductSeo } from "../utils/analyzer"
import { ProductSeoAnalysisInput } from "../types"

describe("SEO Analyzer Unit Tests", () => {
  const sampleProduct: ProductSeoAnalysisInput["product"] = {
    id: "prod_thinkpad_e14",
    title: "Lenovo ThinkPad E14 Gen 6",
    subtitle: "Enterprise AMD Ryzen 7 Laptop",
    description:
      "The Lenovo ThinkPad E14 Gen 6 is engineered for business professionals, featuring high-speed DDR5 RAM, NVMe SSD storage, and genuine manufacturer warranty with rapid Zimbabwe delivery.",
    handle: "lenovo-thinkpad-e14-gen-6",
    thumbnail: "https://laptopzone.co.zw/images/thinkpad.jpg",
    images: [
      { url: "https://laptopzone.co.zw/images/thinkpad.jpg" },
      { url: "https://laptopzone.co.zw/images/thinkpad-side.jpg" },
    ],
    brand: { name: "Lenovo" },
    variants: [
      {
        id: "variant_1",
        sku: "TP-E14-G6-16-512",
        barcode: "195477889900",
        prices: [{ amount: 850, currency_code: "usd" }],
        inventory_quantity: 10,
        manage_inventory: true,
        allow_backorder: false,
      },
    ],
  }

  it("should score high (good) for a well-optimized product with focus keyphrase alignment", () => {
    const analysis = analyzeProductSeo({
      product: sampleProduct,
      seo: {
        meta_title: "Lenovo ThinkPad E14 Gen 6 Laptop | Laptopzone",
        meta_description:
          "Buy the Lenovo ThinkPad E14 Gen 6 with AMD Ryzen 7 and 16GB RAM online at Laptopzone. Fast shipping & official warranty in Zimbabwe.",
        focus_keyphrase: "Lenovo ThinkPad E14 Gen 6",
        canonical_url:
          "https://laptopzone.co.zw/product/lenovo-thinkpad-e14-gen-6",
        robots_index: true,
        robots_follow: true,
      },
    })

    expect(analysis.score).toBeGreaterThanOrEqual(80)
    expect(analysis.status).toBe("good")
    expect(analysis.criticalCount).toBe(0)

    // Check specific checks
    const keyphraseCheck = analysis.checks.find(
      (c) => c.id === "keyphrase_in_title"
    )
    expect(keyphraseCheck?.status).toBe("pass")

    const descCheck = analysis.checks.find(
      (c) => c.id === "meta_description_length"
    )
    expect(descCheck?.status).toBe("pass")
  })

  it("should identify missing critical fields when product has no description, image, or handle", () => {
    const incompleteProduct: ProductSeoAnalysisInput["product"] = {
      id: "prod_empty",
      title: "",
      handle: "",
      thumbnail: null,
      images: [],
    }

    const analysis = analyzeProductSeo({
      product: incompleteProduct,
      seo: null,
    })

    expect(analysis.score).toBeLessThan(50)
    expect(analysis.status).toBe("poor")
    expect(analysis.criticalCount).toBeGreaterThan(0)

    const handleCheck = analysis.checks.find((c) => c.id === "handle_valid")
    expect(handleCheck?.status).toBe("fail")

    const imageCheck = analysis.checks.find((c) => c.id === "image_present")
    expect(imageCheck?.status).toBe("fail")
  })

  it("should warn when SEO title or description are too short or long", () => {
    const analysis = analyzeProductSeo({
      product: sampleProduct,
      seo: {
        meta_title: "Short",
        meta_description: "Too short desc",
        focus_keyphrase: "Lenovo ThinkPad E14 Gen 6",
      },
    })

    const titleCheck = analysis.checks.find(
      (c) => c.id === "seo_title_length"
    )
    expect(titleCheck?.status).toBe("warn")

    const descCheck = analysis.checks.find(
      (c) => c.id === "meta_description_length"
    )
    expect(descCheck?.status).toBe("warn")
  })

  it("should correctly detect when product is set to noindex", () => {
    const analysis = analyzeProductSeo({
      product: sampleProduct,
      seo: {
        meta_title: "Lenovo ThinkPad E14 Gen 6 | Laptopzone",
        meta_description:
          "Buy the Lenovo ThinkPad E14 Gen 6 with AMD Ryzen 7 online at Laptopzone Zimbabwe.",
        robots_index: false,
      },
    })

    const robotsCheck = analysis.checks.find(
      (c) => c.id === "robots_configuration"
    )
    expect(robotsCheck?.status).toBe("warn")
    expect(robotsCheck?.message).toContain("noindex")
  })
})
