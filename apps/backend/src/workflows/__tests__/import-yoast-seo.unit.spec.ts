import { transformYoastRecord } from "../../modules/woocommerce-migrator/services/yoast-seo-transformer"
import type { YoastSeoRecord } from "../../modules/woocommerce-migrator/services/yoast-seo-client"

function makeRecord(overrides: Partial<YoastSeoRecord["yoast"]> = {}, slug = "test-product", title = "HP EliteBook 840"): YoastSeoRecord {
  return {
    wpId: 123,
    entitySlug: slug,
    entityTitle: title,
    entityType: "product",
    yoast: {
      title: "%%title%% %%sep%% %%sitename%%",
      description: "A great laptop by HP.",
      og_title: "%%title%% on LaptopZone",
      og_description: "Buy %%title%% at the best price.",
      og_image: [{ url: "https://cdn.laptopzone.co.zw/img/hp-840.jpg", width: 1200, height: 630 }],
      robots: { index: "index", follow: "follow" },
      canonical: "https://old-site.laptopzone.co.zw/product/hp-elitebook-840/",
      ...overrides,
    },
  }
}

describe("Yoast SEO Transformer", () => {
  it("resolves %%title%% %%sep%% %%sitename%% tokens correctly", () => {
    const result = transformYoastRecord(makeRecord())
    expect(result.meta_title).toBe("HP EliteBook 840 | LaptopZone")
  })

  it("strips double separator artifacts from empty tokens", () => {
    const record = makeRecord({ title: "%%title%% %%sep%% %%sep%% %%sitename%%" })
    const result = transformYoastRecord(record)
    expect(result.meta_title).not.toContain("| |")
  })

  it("resolves og_title tokens correctly", () => {
    const result = transformYoastRecord(makeRecord())
    expect(result.og_title).toBe("HP EliteBook 840 on LaptopZone")
  })

  it("extracts og_image url from yoast og_image array", () => {
    const result = transformYoastRecord(makeRecord())
    expect(result.og_image).toBe("https://cdn.laptopzone.co.zw/img/hp-840.jpg")
  })

  it("returns null og_image when no og_image is defined", () => {
    const result = transformYoastRecord(makeRecord({ og_image: undefined }))
    expect(result.og_image).toBeNull()
  })

  it("maps noindex robots to robots_index = false", () => {
    const result = transformYoastRecord(makeRecord({ robots: { index: "noindex", follow: "follow" } }))
    expect(result.robots_index).toBe(false)
    expect(result.robots_follow).toBe(true)
  })

  it("maps nofollow robots to robots_follow = false", () => {
    const result = transformYoastRecord(makeRecord({ robots: { index: "index", follow: "nofollow" } }))
    expect(result.robots_index).toBe(true)
    expect(result.robots_follow).toBe(false)
  })

  it("strips trailing slash from canonical URL", () => {
    const result = transformYoastRecord(makeRecord())
    expect(result.canonical_url).toBe("https://old-site.laptopzone.co.zw/product/hp-elitebook-840")
  })

  it("returns null for canonical_url when canonical is undefined", () => {
    const result = transformYoastRecord(makeRecord({ canonical: undefined }))
    expect(result.canonical_url).toBeNull()
  })

  it("includes yoast_imported metadata flag", () => {
    const result = transformYoastRecord(makeRecord())
    expect((result.metadata as any)?.yoast_imported).toBe(true)
    expect((result.metadata as any)?.yoast_wp_id).toBe(123)
  })

  it("returns null meta_title when no title is defined in yoast", () => {
    const result = transformYoastRecord(makeRecord({ title: undefined, og_title: undefined }))
    expect(result.meta_title).toBeNull()
  })

  it("handles brand/category entity type records", () => {
    const record: YoastSeoRecord = {
      wpId: 99,
      entitySlug: "lenovo",
      entityTitle: "Lenovo",
      entityType: "brand",
      yoast: {
        title: "%%title%% Laptops %%sep%% %%sitename%%",
        description: "Official Lenovo range at LaptopZone.",
        robots: { index: "index", follow: "follow" },
      },
    }
    const result = transformYoastRecord(record)
    expect(result.meta_title).toBe("Lenovo Laptops | LaptopZone")
  })
})
