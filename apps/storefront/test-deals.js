async function checkDeals() {
  const fs = require('fs')
  const env = fs.readFileSync('.env.local', 'utf8')
  const match = env.match(/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(.*)/)
  const key = match ? match[1].trim() : ''

  const res = await fetch('http://localhost:9000/store/products?limit=100&fields=*variants.calculated_price', {
    headers: { 'x-publishable-api-key': key }
  })
  const data = await res.json()
  let onSaleCount = 0
  for (const p of data.products || []) {
    for (const v of p.variants || []) {
      const calc = v.calculated_price
      if (calc) {
        const calculatedAmount = calc.calculated_amount ?? calc.amount ?? 0
        const originalAmount = calc.original_amount ?? calculatedAmount
        if (originalAmount > calculatedAmount || calc.price_list_type === 'sale') {
          onSaleCount++
        }
      }
    }
  }
  console.log('Out of 100 products, variants on sale:', onSaleCount)
}

checkDeals().catch(console.error)
