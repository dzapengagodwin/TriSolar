import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import {
  CACHE_TAGS,
  productTag,
  productHandleTag,
  categoryTag,
  collectionTag,
} from "@lib/cache-tags"

type RevalidationPayload = {
  event?: string
  product_id?: string
  productId?: string
  id?: string
  handle?: string
  old_handle?: string
  oldHandle?: string
  category_id?: string
  categoryId?: string
  collection_id?: string
  collectionId?: string
  data?: {
    id?: string
    handle?: string
    old_handle?: string
    category_id?: string
    collection_id?: string
    product_id?: string
    [key: string]: unknown
  }
}

export async function POST(request: NextRequest) {
  const secretHeader = request.headers.get("x-revalidation-secret")
  const { searchParams } = new URL(request.url)
  const secretParam = searchParams.get("secret")
  const providedSecret = secretHeader || secretParam

  const expectedSecret = process.env.REVALIDATION_SECRET

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing revalidation secret" },
      { status: 401 }
    )
  }

  let body: RevalidationPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    )
  }

  const event = body.event || "manual.revalidate"
  const rawData = body.data || {}

  const productId =
    body.product_id ||
    body.productId ||
    rawData.product_id ||
    (event.startsWith("product.") ? body.id || rawData.id : undefined)

  const handle = body.handle || rawData.handle
  const oldHandle = body.old_handle || body.oldHandle || rawData.old_handle

  const categoryId =
    body.category_id ||
    body.categoryId ||
    rawData.category_id ||
    (event.startsWith("product-category.") ? body.id || rawData.id : undefined)

  const collectionId =
    body.collection_id ||
    body.collectionId ||
    rawData.collection_id ||
    (event.startsWith("product-collection.") ? body.id || rawData.id : undefined)

  const tagsToInvalidate = new Set<string>()

  // Invalidation mapping based on verified Medusa event categories
  if (event.startsWith("product-category.")) {
    tagsToInvalidate.add(CACHE_TAGS.categories)
    tagsToInvalidate.add(CACHE_TAGS.navigation)
    tagsToInvalidate.add(CACHE_TAGS.products)
    tagsToInvalidate.add(CACHE_TAGS.homepage)
    if (categoryId) {
      tagsToInvalidate.add(categoryTag(categoryId))
    }
    if (handle) {
      tagsToInvalidate.add(categoryTag(handle))
    }
  } else if (event.startsWith("product-collection.")) {
    tagsToInvalidate.add(CACHE_TAGS.collections)
    tagsToInvalidate.add(CACHE_TAGS.homepage)
    tagsToInvalidate.add(CACHE_TAGS.products)
    if (collectionId) {
      tagsToInvalidate.add(collectionTag(collectionId))
    }
    if (handle) {
      tagsToInvalidate.add(collectionTag(handle))
    }
  } else if (event.startsWith("product-variant.")) {
    tagsToInvalidate.add(CACHE_TAGS.products)
    tagsToInvalidate.add(CACHE_TAGS.homepage)
    if (productId) {
      tagsToInvalidate.add(productTag(productId))
    }
    if (handle) {
      tagsToInvalidate.add(productHandleTag(handle))
    }
  } else if (event.startsWith("product.")) {
    tagsToInvalidate.add(CACHE_TAGS.products)
    tagsToInvalidate.add(CACHE_TAGS.homepage)
    if (productId) {
      tagsToInvalidate.add(productTag(productId))
    }
    if (handle) {
      tagsToInvalidate.add(productHandleTag(handle))
    }
    if (oldHandle && oldHandle !== handle) {
      tagsToInvalidate.add(productHandleTag(oldHandle))
    }
    if (categoryId) {
      tagsToInvalidate.add(categoryTag(categoryId))
    }
    if (collectionId) {
      tagsToInvalidate.add(collectionTag(collectionId))
    }
  } else if (event === "all") {
    Object.values(CACHE_TAGS).forEach((tag) => tagsToInvalidate.add(tag))
  } else {
    // Default fallback for unknown or manual events
    tagsToInvalidate.add(CACHE_TAGS.products)
    tagsToInvalidate.add(CACHE_TAGS.homepage)
    if (productId) {
      tagsToInvalidate.add(productTag(productId))
    }
    if (handle) {
      tagsToInvalidate.add(productHandleTag(handle))
    }
    if (categoryId) {
      tagsToInvalidate.add(categoryTag(categoryId))
    }
    if (collectionId) {
      tagsToInvalidate.add(collectionTag(collectionId))
    }
  }

  const invalidatedTags: string[] = []
  for (const tag of tagsToInvalidate) {
    try {
      revalidateTag(tag)
      invalidatedTags.push(tag)
    } catch (err) {
      console.error(`[Cache Revalidation] Failed to revalidate tag: ${tag}`, err)
    }
  }

  // Structured diagnostic log (secrets are never logged)
  console.log(
    `[Cache Revalidation] event=${event} tags=${invalidatedTags.join(",")} status=success`
  )

  return NextResponse.json({
    revalidated: true,
    event,
    tags: invalidatedTags,
    count: invalidatedTags.length,
    timestamp: Date.now(),
  })
}

