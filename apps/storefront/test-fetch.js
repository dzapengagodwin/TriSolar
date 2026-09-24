async function test() {
  const r1 = await fetch('http://localhost:8000/za/store')
  const html1 = await r1.text()
  console.log('GET /za/store -> Status:', r1.status, 'Length:', html1.length)
  console.log('/za/store has product-wrapper:', html1.includes('product-wrapper'))
  console.log('/za/store has "No products":', html1.includes('No products') || html1.includes('no products'))

  const r2 = await fetch('http://localhost:8000/za')
  const html2 = await r2.text()
  console.log('GET /za (homepage) -> Status:', r2.status, 'Length:', html2.length)
  console.log('/za has "Logitech":', html2.includes('Logitech'))

  // Check what products are actually on /zw/store
  const match = html1.match(/data-testid="product-title"[^>]*>([^<]+)</g)
  console.log('Product titles on /za/store:', match ? match.slice(0, 5) : 'None')

  const matchZw = (await (await fetch('http://localhost:8000/zw/store')).text()).match(/data-testid="product-title"[^>]*>([^<]+)</g)
  console.log('Product titles on /zw/store:', matchZw ? matchZw.slice(0, 5) : 'None')
}

test().catch(console.error)

