# Laptopzone legacy URL migration audit

Source: `LaptopZone_SEO_Migration_Register.xlsx`, using its `Migration Register` sheet as the URL inventory and the live Medusa product, category, and brand catalogs for destination matching. The normalized register is [url-migration-register-normalized.csv](url-migration-register-normalized.csv); verified category dispatch data is [legacy-url-map.json](legacy-url-map.json).

This is a code/catalog comparison, not a deployed HTTP crawl. No migration redirects were added. Verified legacy paths are served using application rewrites so the existing URL stays in the address bar. Unmatched destinations remain unresolved rather than being guessed.

## Normalization and matching

- Workbook input: 1,000 Search Console rows and 751 sitemap rows.
- Normalized inventory: 1,730 distinct source/URL records. Twenty-one same-source duplicates were merged after normalizing host/path and removing query strings; Search Console metrics were aggregated for merged rows.
- Search Console product URLs: 523 unique `/product/{slug}` paths. 481 match current Medusa handles; 42 do not match and receive no redirect.
- Production category/subcategory URLs: 50. 47 match a Medusa handle and 3 match an exact category name. Two additional category-shaped URLs use the development host and remain review-only.
- Legacy `/brand/{handle}` pages: all 7 inventoried pages match a current Medusa brand. The nested `/brand/hp/omnibook/` URL is not treated as a brand-handle match.
- Eight static URLs include 5 current equivalent pages and 3 previously missing routes, now implemented at `/faq`, `/track-order`, and `/customer-help`.
- Search Console includes 240 spam/garbage URLs and 86 taxonomy URLs. Spam paths are not recreated. Taxonomy URLs have not been mass-generated or redirected.

## Routing and SEO implementation

| URL type | Public path | Application handling |
| --- | --- | --- |
| Products | `/product/{handle}` | Internal rewrite to existing Medusa product route; canonical, JSON-LD, internal links, sitemap, and Merchant link use `/product/`. Existing `/products/{handle}` remains available as a compatibility route. |
| Categories | `/products/{legacy-path}` | Exact verified-path map rewrites to the existing Medusa category route. The canonical path uses the verified legacy path. Category pagination is internally mapped to the category page query. |
| Brands | `/brand/{handle}` | Rewrites only handles present in the live brand map to the existing brand route. Brand canonical URLs and internal links use singular `/brand/`. |
| Static pages | Legacy paths such as `/contact-us/` and `/delivery-terms/` | Direct App Router routes reuse the existing page implementations and canonical metadata. FAQ, tracking help, and customer help have dedicated pages. |
| Variants | `?v_id=...` | Product route still reads the query for initial selection; canonical and feed links omit query parameters. |

The country middleware continues resolving the internal `zw` region and `_medusa_country_code` cookie. The existing `/zw/...` prefix normalization remains separate from these legacy URL rewrites. No new permanent redirect rules were introduced.

## Remaining migration decisions

1. Review the 42 unmatched product slugs against inventory and current catalog naming before selecting any alternate product destination.
2. Review taxonomy/brand subpaths individually. Keep irrelevant spam at 404/410; do not create substitute content.
3. Test representative URLs and response headers in staging/production, including canonical tags, sitemap URLs, feed links, cookie/region behavior, and the pre-existing `/zw` normalization.
4. Confirm trailing-slash handling at the production edge. The storefront emits slash-free canonical URLs and does not set a global `trailingSlash` option.

