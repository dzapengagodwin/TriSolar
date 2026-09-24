async function checkHome() {
  const r = await fetch('http://localhost:8000/zw')
  const html = await r.text()
  console.log('Homepage contains "Featured Products":', html.includes('Featured Products') || html.includes('featured-products'))
  console.log('Homepage contains "Best Deals":', html.includes('Best Deals'))
  console.log('Homepage contains ProductRail:', html.includes('View all'))
  
  // Count how many product cards are actually rendered on the homepage
  const productCards = html.match(/data-testid="product-wrapper"/g) || []
  console.log('Total product cards on homepage:', productCards.length)

  // Check product preview titles
  const titles = html.match(/data-testid="product-title"[^>]*>([^<]+)</g) || []
  console.log('Product titles on homepage:', titles)
}

checkHome().catch(console.error)

