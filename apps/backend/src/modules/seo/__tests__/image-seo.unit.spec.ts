describe("Image SEO Tests", () => {
  // Test Image Alt Text generation logic
  function getProductImageAlt({
    title,
    brand,
    index = 0,
    totalImages = 1,
    explicitAlt,
  }: {
    title?: string | null
    brand?: string | null
    index?: number
    totalImages?: number
    explicitAlt?: string | null
  }): string {
    const cleanExplicit = (explicitAlt || "").trim()
    if (
      cleanExplicit &&
      cleanExplicit.toLowerCase() !== "thumbnail" &&
      cleanExplicit.toLowerCase() !== "image"
    ) {
      return cleanExplicit
    }

    const cleanTitle = (title || "").trim()
    const cleanBrand = (brand || "").trim()

    if (!cleanTitle) {
      return `${cleanBrand ? cleanBrand + " " : ""}Product Image | LaptopZone`
    }

    let displayTitle = cleanTitle
    if (
      cleanBrand &&
      !cleanTitle.toLowerCase().startsWith(cleanBrand.toLowerCase())
    ) {
      displayTitle = `${cleanBrand} ${cleanTitle}`
    }

    if (totalImages <= 1 || index === 0) {
      return `${displayTitle} - Main View`
    }

    return `${displayTitle} - Angle ${index + 1}`
  }

  function escapeXml(str?: string | null): string {
    if (!str) return ""
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }

  it("should generate descriptive main view alt text", () => {
    const alt = getProductImageAlt({
      title: "ThinkPad E14 Gen 6",
      brand: "Lenovo",
      index: 0,
      totalImages: 3,
    })

    expect(alt).toBe("Lenovo ThinkPad E14 Gen 6 - Main View")
  })

  it("should prevent duplicate brand names in alt text", () => {
    const alt = getProductImageAlt({
      title: "Lenovo ThinkPad E14 Gen 6",
      brand: "Lenovo",
      index: 0,
      totalImages: 1,
    })

    expect(alt).toBe("Lenovo ThinkPad E14 Gen 6 - Main View")
  })

  it("should generate angle-specific alt text for secondary gallery images", () => {
    const alt = getProductImageAlt({
      title: "Dell XPS 15 9530",
      brand: "Dell",
      index: 1,
      totalImages: 4,
    })

    expect(alt).toBe("Dell XPS 15 9530 - Angle 2")
  })

  it("should prioritize explicit custom alt text over generated fallback", () => {
    const alt = getProductImageAlt({
      title: "MacBook Pro 16",
      brand: "Apple",
      explicitAlt: "MacBook Pro 16 M3 Max Space Black open lid view",
    })

    expect(alt).toBe("MacBook Pro 16 M3 Max Space Black open lid view")
  })

  it("should properly XML-escape product titles with special characters for sitemaps", () => {
    const title = 'HP EliteBook 840 & 840 G10 "Touchscreen" <Special Edition>'
    const escaped = escapeXml(title)

    expect(escaped).toBe(
      "HP EliteBook 840 &amp; 840 G10 &quot;Touchscreen&quot; &lt;Special Edition&gt;"
    )
  })
})
