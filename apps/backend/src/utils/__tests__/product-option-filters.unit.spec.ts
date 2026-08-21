import {
  extractScopedProductOptions,
  filterProductsByOptionValues,
  isMeaningfulOption,
  ScopedProductOption,
} from "../product-option-filters"

describe("Dynamic Scoped Product Options & Filtering", () => {
  const laptopA = {
    id: "prod_laptop_1",
    title: "ThinkPad X1 Carbon",
    options: [
      {
        id: "opt_ram_1",
        title: "RAM",
        values: [
          { id: "val_ram_16_1", value: "16GB" },
          { id: "val_ram_32_1", value: "32GB" },
        ],
      },
      {
        id: "opt_storage_1",
        title: "Storage",
        values: [
          { id: "val_ssd_512_1", value: "512GB" },
          { id: "val_ssd_1tb_1", value: "1TB" },
        ],
      },
    ],
  } as any

  const laptopB = {
    id: "prod_laptop_2",
    title: "MacBook Pro 16",
    options: [
      {
        id: "opt_ram_2",
        title: "RAM",
        values: [
          { id: "val_ram_32_2", value: "32GB" },
          { id: "val_ram_64_2", value: "64GB" },
        ],
      },
      {
        id: "opt_proc_2",
        title: "Processor",
        values: [
          { id: "val_proc_m3_2", value: "M3 Pro" },
          { id: "val_proc_m3max_2", value: "M3 Max" },
        ],
      },
    ],
  } as any

  const tShirt = {
    id: "prod_shirt_1",
    title: "Organic Cotton T-Shirt",
    options: [
      {
        id: "opt_size_1",
        title: "Size",
        values: [
          { id: "val_s_1", value: "S" },
          { id: "val_m_1", value: "M" },
          { id: "val_l_1", value: "L" },
        ],
      },
      {
        id: "opt_color_1",
        title: "Color",
        values: [
          { id: "val_blk_1", value: "Black" },
          { id: "val_wht_1", value: "White" },
        ],
      },
    ],
  } as any

  const simpleProduct = {
    id: "prod_mouse_1",
    title: "Wireless Mouse",
    options: [
      {
        id: "opt_default",
        title: "Default Option",
        values: [{ id: "val_default", value: "Default Value" }],
      },
    ],
  } as any

  describe("isMeaningfulOption", () => {
    it("should reject default / placeholder options", () => {
      expect(
        isMeaningfulOption("Default Option", [{ value: "Default Value" }])
      ).toBe(false)
      expect(isMeaningfulOption("Default", [{ value: "Default" }])).toBe(false)
      expect(isMeaningfulOption("Title", [{ value: "Default" }])).toBe(false)
    })

    it("should accept real product options", () => {
      expect(isMeaningfulOption("RAM", [{ value: "16GB" }])).toBe(true)
      expect(isMeaningfulOption("Size", [{ value: "M" }])).toBe(true)
      expect(isMeaningfulOption("Color", [{ value: "Black" }])).toBe(true)
    })
  })

  describe("extractScopedProductOptions", () => {
    it("should extract only Laptop options (RAM, Storage, Processor) for a laptop category", () => {
      const scopedOptions = extractScopedProductOptions([laptopA, laptopB])
      const titles = scopedOptions.map((o) => o.title)

      expect(titles).toContain("RAM")
      expect(titles).toContain("Storage")
      expect(titles).toContain("Processor")
      expect(titles).not.toContain("Size")
      expect(titles).not.toContain("Color")

      const ramOption = scopedOptions.find((o) => o.title === "RAM")
      expect(ramOption).toBeDefined()
      const ramLabels = ramOption!.values.map((v) => v.label)
      expect(ramLabels).toEqual(["16GB", "32GB", "64GB"])

      // 32GB should be present across 2 products
      const ram32 = ramOption!.values.find((v) => v.label === "32GB")
      expect(ram32?.count).toBe(2)
      expect(ram32?.valueIds).toContain("val_ram_32_1")
      expect(ram32?.valueIds).toContain("val_ram_32_2")
    })

    it("should extract only Clothing options (Size, Color) for a clothing category", () => {
      const scopedOptions = extractScopedProductOptions([tShirt])
      const titles = scopedOptions.map((o) => o.title)

      expect(titles).toEqual(["Size", "Color"])
      expect(titles).not.toContain("RAM")
      expect(titles).not.toContain("Storage")
      expect(titles).not.toContain("Processor")
    })

    it("should return empty array for simple products with placeholder options", () => {
      const scopedOptions = extractScopedProductOptions([simpleProduct])
      expect(scopedOptions).toEqual([])
    })
  })

  describe("filterProductsByOptionValues", () => {
    let laptopOptions: ScopedProductOption[]

    beforeEach(() => {
      laptopOptions = extractScopedProductOptions([laptopA, laptopB])
    })

    it("should filter products by single option value (e.g. 16GB RAM)", () => {
      const ram16Val = laptopOptions
        .find((o) => o.title === "RAM")!
        .values.find((v) => v.label === "16GB")!

      const filtered = filterProductsByOptionValues(
        [laptopA, laptopB],
        ram16Val.valueIds,
        laptopOptions
      )

      expect(filtered.map((p) => p.id)).toEqual(["prod_laptop_1"])
    })

    it("should filter products across multiple option groups using AND logic (RAM 32GB AND Storage 512GB)", () => {
      const ram32Val = laptopOptions
        .find((o) => o.title === "RAM")!
        .values.find((v) => v.label === "32GB")!
      const ssd512Val = laptopOptions
        .find((o) => o.title === "Storage")!
        .values.find((v) => v.label === "512GB")!

      const selectedIds = [...ram32Val.valueIds, ...ssd512Val.valueIds]

      const filtered = filterProductsByOptionValues(
        [laptopA, laptopB],
        selectedIds,
        laptopOptions
      )

      // Only laptopA has both 32GB RAM and 512GB SSD
      expect(filtered.map((p) => p.id)).toEqual(["prod_laptop_1"])
    })

    it("should filter products within same option group using OR logic (RAM 16GB OR 64GB)", () => {
      const ram16Val = laptopOptions
        .find((o) => o.title === "RAM")!
        .values.find((v) => v.label === "16GB")!
      const ram64Val = laptopOptions
        .find((o) => o.title === "RAM")!
        .values.find((v) => v.label === "64GB")!

      const selectedIds = [...ram16Val.valueIds, ...ram64Val.valueIds]

      const filtered = filterProductsByOptionValues(
        [laptopA, laptopB],
        selectedIds,
        laptopOptions
      )

      // Both laptopA (16GB) and laptopB (64GB) match
      expect(filtered.map((p) => p.id)).toContain("prod_laptop_1")
      expect(filtered.map((p) => p.id)).toContain("prod_laptop_2")
    })
  })
})
