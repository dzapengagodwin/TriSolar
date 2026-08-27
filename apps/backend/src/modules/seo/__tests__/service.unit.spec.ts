import SeoModuleService from "../service"

describe("SeoModuleService Unit Tests", () => {
  let service: SeoModuleService

  beforeEach(() => {
    service = new SeoModuleService({} as any)
  })

  describe("getDefaults", () => {
    it("should generate sensible fallback metadata for a product", async () => {
      const mockProduct = {
        id: "prod_dell_xps",
        title: "Dell XPS 15 9530",
        subtitle: "13th Gen Core i9 Laptop",
        description: "<p>Dell XPS 15 with 3.5K OLED touchscreen display.</p>",
        handle: "dell-xps-15-9530",
        thumbnail: "https://laptopzone.co.zw/xps.jpg",
      }

      const defaults = await service.getDefaults("product", mockProduct, {
        storefrontUrl: "https://laptopzone.co.zw",
        countryCode: "zw",
      })

      expect(defaults.meta_title).toBe("Dell XPS 15 9530 | LaptopZone")
      expect(defaults.meta_description).toBe("Dell XPS 15 with 3.5K OLED touchscreen display.")
      expect(defaults.focus_keyphrase).toBe("Dell XPS 15 9530")
      expect(defaults.canonical_url).toBe(
        "https://laptopzone.co.zw/zw/products/dell-xps-15-9530"
      )
      expect(defaults.og_image).toBe("https://laptopzone.co.zw/xps.jpg")
      expect(defaults.robots_index).toBe(true)
      expect(defaults.robots_follow).toBe(true)
    })
  })

  describe("retrieveForEntity and upsertForEntity safety", () => {
    it("should return null when entityType or entityId is missing", async () => {
      const res = await service.retrieveForEntity("", "")
      expect(res).toBeNull()
    })
  })
})
