async function checkCategories() {
  const fs = require('fs')
  const env = fs.readFileSync('.env.local', 'utf8')
  const match = env.match(/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(.*)/)
  const key = match ? match[1].trim() : ''

  const res = await fetch('http://localhost:9000/store/product-categories?limit=10', {
    headers: { 'x-publishable-api-key': key }
  })
  const data = await res.json()
  console.log('Categories count:', data.count)
  for (const cat of data.product_categories || []) {
    const pRes = await fetch('http://localhost:9000/store/products?category_id[]=' + cat.id + '&limit=5', {
      headers: { 'x-publishable-api-key': key }
    })
    const pData = await pRes.json()
    console.log(`Category: ${cat.name} (${cat.handle}) -> Products count: ${pData.count}`)
  }
}

checkCategories().catch(console.error)

