async function testCat() {
  const r = await fetch('http://localhost:8000/zw/categories/gaming-laptops')
  console.log('Status:', r.status)
  const html = await r.text()
  console.log('HTML Length:', html.length)
  const titles = html.match(/data-testid="product-title"[^>]*>([^<]+)</g) || []
  console.log('Rendered titles count on category page:', titles.length)
  console.log('Sample titles:', titles.slice(0, 3))
  const noProd = html.includes('No products') || html.includes('no products') || html.includes('No products found')
  console.log('Has "No products":', noProd)
}

testCat().catch(console.error)

