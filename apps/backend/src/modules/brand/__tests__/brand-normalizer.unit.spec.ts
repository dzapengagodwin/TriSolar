import {
  normalizeBrand,
  extractBrandFromProduct,
  sanitizeBrandString,
} from "../utils/brand-normalizer"

describe("Brand Normalizer Unit Tests", () => {
  describe("normalizeBrand", () => {
    it("should normalize 'Lenovo' to canonical Lenovo brand", () => {
      expect(normalizeBrand("Lenovo")).toEqual({
        name: "Lenovo",
        handle: "lenovo",
      })
    })

    it("should normalize 'HP' to canonical HP brand", () => {
      expect(normalizeBrand("HP")).toEqual({
        name: "HP",
        handle: "hp",
      })
    })

    it("should resolve alias 'hewlett packard' to canonical HP brand", () => {
      expect(normalizeBrand("hewlett packard")).toEqual({
        name: "HP",
        handle: "hp",
      })
    })

    it("should return title-cased fallback for 'Unknown Brand XYZ'", () => {
      expect(normalizeBrand("Unknown Brand XYZ")).toEqual({
        name: "Unknown Brand Xyz",
        handle: "unknown-brand-xyz",
      })
    })

    it("should return null for null input", () => {
      expect(normalizeBrand(null)).toBeNull()
    })

    it("should return null for empty string input", () => {
      expect(normalizeBrand("")).toBeNull()
    })

    it("should NOT match weak product lines in direct or substring matching", () => {
      expect(normalizeBrand("ThinkPad")).toEqual({ name: "Thinkpad", handle: "thinkpad" })
      expect(normalizeBrand("Galaxy")).toEqual({ name: "Galaxy", handle: "galaxy" })
      expect(normalizeBrand("Predator")).toEqual({ name: "Predator", handle: "predator" })
      expect(normalizeBrand("Legion")).toEqual({ name: "Legion", handle: "legion" })
      expect(normalizeBrand("Surface")).toEqual({ name: "Surface", handle: "surface" })
      expect(normalizeBrand("Modern")).toEqual({ name: "Modern", handle: "modern" })
      expect(normalizeBrand("Stealth")).toEqual({ name: "Stealth", handle: "stealth" })
      expect(normalizeBrand("Katana")).toEqual({ name: "Katana", handle: "katana" })
      expect(normalizeBrand("Swift")).toEqual({ name: "Swift", handle: "swift" })
      expect(normalizeBrand("Fury")).toEqual({ name: "Fury", handle: "fury" })
    })
  })

  describe("extractBrandFromProduct", () => {
    describe("Step 1: WooCommerce attributes", () => {
      it("should extract Lenovo brand from product with Brand attribute 'Lenovo'", () => {
        const brand = extractBrandFromProduct({
          title: "ThinkBook 15 Gen 4",
          attributes: [
            {
              name: "Brand",
              options: ["Lenovo"],
            },
          ],
        })

        expect(brand).toEqual({
          name: "Lenovo",
          handle: "lenovo",
          logo: null,
        })
      })

      it("should match both aliases and productLines since attributes are authoritative", () => {
        expect(
          extractBrandFromProduct({
            title: "Some Laptop",
            attributes: [{ name: "Brand", options: ["ThinkPad"] }],
          })?.name
        ).toBe("Lenovo")

        expect(
          extractBrandFromProduct({
            title: "Some Phone",
            attributes: [{ name: "Brand", options: ["Galaxy"] }],
          })?.name
        ).toBe("Samsung")

        expect(
          extractBrandFromProduct({
            title: "Some Monitor",
            attributes: [{ name: "Manufacturer", options: ["Predator"] }],
          })?.name
        ).toBe("Acer")

        expect(
          extractBrandFromProduct({
            title: "Generic Laptop",
            attributes: [{ name: "Brand", options: ["Hewlett Packard"] }],
          })?.name
        ).toBe("HP")
      })

      it("should fall back to normalizeBrand for authoritative non-dictionary brands", () => {
        expect(
          extractBrandFromProduct({
            title: "USB Hub",
            attributes: [{ name: "Brand", options: ["Anker"] }],
          })?.name
        ).toBe("Anker")
      })
    })

    describe("Step 2: Title matching", () => {
      it("should extract Lenovo brand from product titled 'Lenovo ThinkPad E14'", () => {
        const brand = extractBrandFromProduct({
          title: "Lenovo ThinkPad E14",
        })

        expect(brand).toEqual({
          name: "Lenovo",
          handle: "lenovo",
          logo: null,
        })
      })

      it("should extract HP brand from product titled 'HP EliteBook 840 G10'", () => {
        const brand = extractBrandFromProduct({
          title: "HP EliteBook 840 G10",
        })

        expect(brand).toEqual({
          name: "HP",
          handle: "hp",
          logo: null,
        })
      })

      it("should match product line when it is the FIRST token in title", () => {
        expect(
          extractBrandFromProduct({
            title: "ThinkPad T14 Gen 3 Laptop",
          })?.name
        ).toBe("Lenovo")

        expect(
          extractBrandFromProduct({
            title: "Galaxy S24 Ultra 256GB",
          })?.name
        ).toBe("Samsung")

        expect(
          extractBrandFromProduct({
            title: "Predator Helios 16 Gaming Laptop",
          })?.name
        ).toBe("Acer")

        expect(
          extractBrandFromProduct({
            title: "Surface Laptop Studio 2",
          })?.name
        ).toBe("Microsoft")

        expect(
          extractBrandFromProduct({
            title: "Fury Beast 16GB DDR5",
          })?.name
        ).toBe("Kingston")
      })

      it("should match aliases anywhere among title tokens with precedence", () => {
        expect(
          extractBrandFromProduct({
            title: "Lenovo Legion 5 Pro 16",
          })?.name
        ).toBe("Lenovo")

        expect(
          extractBrandFromProduct({
            title: "Samsung Galaxy Book4",
          })?.name
        ).toBe("Samsung")

        expect(
          extractBrandFromProduct({
            title: "Acer Predator Triton 17",
          })?.name
        ).toBe("Acer")
      })

      it("should NOT match product line when it is NOT the first token in title", () => {
        expect(
          extractBrandFromProduct({
            title: "Spigen Galaxy S24 Case",
          })
        ).toBeNull()

        expect(
          extractBrandFromProduct({
            title: "Redragon Predator Gaming Mouse",
          })
        ).toBeNull()

        expect(
          extractBrandFromProduct({
            title: "Nordic Modern Dining Chair",
          })
        ).toBeNull()

        expect(
          extractBrandFromProduct({
            title: "Japanese Katana Steel Knife",
          })
        ).toBeNull()

        expect(
          extractBrandFromProduct({
            title: "Gaming Fury RGB Mousepad",
          })
        ).toBeNull()
      })
    })

    describe("Step 3: Full title scan", () => {
      it("should match strong brand aliases appearing later in title", () => {
        expect(
          extractBrandFromProduct({
            title: "Leather Protective Case for Samsung S24",
          })?.name
        ).toBe("Samsung")

        expect(
          extractBrandFromProduct({
            title: "Replacement Power Adapter for Apple Devices",
          })?.name
        ).toBe("Apple")

        expect(
          extractBrandFromProduct({
            title: "External Hard Drive by Western Digital",
          })?.name
        ).toBe("Western Digital")
      })

      it("should NOT match weak product lines in full title scan", () => {
        expect(
          extractBrandFromProduct({
            title: "Leather Protective Case for Galaxy S24",
          })
        ).toBeNull()

        expect(
          extractBrandFromProduct({
            title: "Replacement Screen for Surface Pro",
          })
        ).toBeNull()

        expect(
          extractBrandFromProduct({
            title: "Keyboard Sleeve for MacBook Pro",
          })
        ).toBeNull()
      })
    })

    describe("Steps 4-5: Categories and tags", () => {
      it("should match both aliases and productLines in categories", () => {
        expect(
          extractBrandFromProduct({
            title: "Phone Case",
            categories: [{ name: "Galaxy Phones", slug: "galaxy-phones" }],
          })?.name
        ).toBe("Samsung")

        expect(
          extractBrandFromProduct({
            title: "Gaming Laptop",
            categories: [{ name: "Predator Series", slug: "predator-series" }],
          })?.name
        ).toBe("Acer")
      })

      it("should match both aliases and productLines in tags", () => {
        expect(
          extractBrandFromProduct({
            title: "Laptop Backpack",
            tags: [{ name: "ThinkPad", slug: "thinkpad" }],
          })?.name
        ).toBe("Lenovo")

        expect(
          extractBrandFromProduct({
            title: "Memory Module",
            tags: [{ name: "Fury", slug: "fury" }],
          })?.name
        ).toBe("Kingston")
      })

      it("should return null when product has no brand signals", () => {
        const brand = extractBrandFromProduct({
          title: "Generic Wireless Mouse",
          attributes: [],
          categories: [],
          tags: [],
        })

        expect(brand).toBeNull()
      })
    })
  })

  describe("sanitizeBrandString", () => {
    it("should strip corporate suffix from 'Lenovo Inc.'", () => {
      expect(sanitizeBrandString("Lenovo Inc.")).toBe("Lenovo")
    })

    it("should strip trademark symbols from 'HP(R)'", () => {
      expect(sanitizeBrandString("HP(R)")).toBe("HP")
    })
  })
})
