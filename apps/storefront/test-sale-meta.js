async function checkMetadata() {
  const fs = require('fs')
  const env = fs.readFileSync('.env.local', 'utf8')
  const match = env.match(/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(.*)/)
  const key = match ? match[1].trim() : ''

  const res = await fetch('http://localhost:9000/store/products?limit=50&fields=+metadata,*variants.calculated_price', {
    headers: { 'x-publishable-api-key': key }
  })
  const data = await res.json()
  let hasSaleMeta = 0
  for (const p of data.products || []) {
    if (p.metadata?.woo_sale_price) {
      hasSaleMeta++
    }
    for (const v of p.variants || []) {
      if (v.metadata?.woo_sale_price) {
        hasSaleMeta++
      }
    }
  }
  console.log('Out of 50 products, with woo_sale_price in metadata:', hasSaleMeta)
}

checkMetadata().catch(console.error)

