# Askari catalog collection

`fetch-catalog.mjs` enumerates every page of 50 explicitly selected public Al-Fatah Pakistan grocery and everyday household collections. It does not crawl the unrelated department-store catalog. Run with Node24 (`node work/catalog/fetch-catalog.mjs`). Per-page caches permit respectful resumptions; delete `pages/`, `raw-products.json` and `image-validation.json` to refresh source data and verification.

Outputs:
- `catalog.json`: variants with successful HTTP200 image HEAD checks, no retailer price/stock/rating data.
- `raw-products.json`: source product identifiers, names, tags, images and variants with price and retailer availability stripped before persistence.
- `report.json`: exact coverage, category counts, exclusions and source access limits.
- `excluded.json`: filtered records and reasons.
- `image-validation.json`: image HTTP status, content type, byte length and timestamp.

Each product starts with `price: null`, `in_stock: false`, `original_price: null`, `rating: null` and `badge: null`. Source collections are provenance, not a guarantee of correct classification; classification conservatively excludes electronics, clothing, toys, furniture, tableware, decorative items, medicines, pet supplies, makeup and perfumes. Names/brand/pack size are normalized from source labels. Source names can still contain retailer typos and imported-product spellings.

`source_id`, `source_variant_id`, `source_url`, `source_site` and source `sku` are retained. Barcode tags can contain several historic codes and cannot reliably identify a specific variant. `source_barcode_candidates` are therefore metadata only; `barcode` stays null unless the variant explicitly provides one. A stock Excel import should prefer Askari `id`, then unique exact source SKU, then an unambiguous exact normalized name+pack size, with preview and rejection of ambiguous matches.

Primary provenance:
- https://alfatah.pk/pages/grocery-foods
- https://alfatah.pk/collections/household-cleaning-products
- https://alfatah.pk/collections/personal-care-hygiene
- Public JSON feed form: https://alfatah.pk/collections/cooking-ingredients/products.json?limit=250&page=1

Naheed.pk returned403 to web fetch. No security challenge or access-control bypass was attempted. This is a broad enumerated source catalog within the requested nine categories, not a claim to contain every product on the internet or all Naheed inventory. Photos remain original retailer CDN URLs; HEAD checks verify response availability, not a grant of intellectual-property rights or future CDN availability.

