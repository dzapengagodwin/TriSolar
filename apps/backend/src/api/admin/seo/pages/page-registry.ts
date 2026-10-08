export type StaticPageDefinition = {
  title: string
  description: string
  path: string
  aliases?: string[]
}

export const STATIC_PAGES: Record<string, StaticPageDefinition> = {
  home: {
    title: "Home",
    description: "Main landing page for the store.",
    path: "/",
    aliases: [
      "page_home",
      "page_laptops-pc-desktops-printers-sale-zimbabwe",
      "page_19719-2",
      "page_",
      "homepage",
    ],
  },
  about: {
    title: "About Us",
    description: "Company information, mission, and story.",
    path: "/about",
    aliases: ["page_about", "page_about-us", "about-us"],
  },
  faq: {
    title: "FAQ",
    description: "Frequently asked questions and support.",
    path: "/faq",
    aliases: ["page_faq", "page_faqs", "faqs"],
  },
  contact: {
    title: "Contact Us",
    description: "Contact information and enquiry form.",
    path: "/contact",
    aliases: ["page_contact-us", "page_contact-us-2", "page_contact", "contact-us"],
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    description: "Legal terms of service.",
    path: "/terms-and-conditions",
    aliases: [
      "page_terms-and-conditions",
      "page_terms-and-conditions-2",
      "page_terms",
      "terms",
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description: "Data privacy and protection policy.",
    path: "/privacy-policy",
    aliases: ["page_privacy-policy", "page_privacy", "privacy"],
  },
  "shipping-policy": {
    title: "Shipping Policy",
    description: "Delivery information and shipping rates.",
    path: "/shipping-policy",
    aliases: ["page_delivery-terms", "delivery-terms", "shipping", "page_shipping"],
  },
  "return-policy": {
    title: "Return Policy",
    description: "Return, refund, and exchange policy.",
    path: "/return-policy",
    aliases: [
      "page_returns-and-refunds",
      "returns-and-refunds",
      "returns",
      "page_returns",
    ],
  },
  "track-order": {
    title: "Track Order",
    description: "Track shipment and delivery status.",
    path: "/track-order",
    aliases: ["page_track-order"],
  },
  wishlist: {
    title: "Wishlist",
    description: "Saved customer products and wishlist.",
    path: "/wishlist",
    aliases: ["page_wishlist"],
  },
}

/**
 * Returns candidate entity IDs to search in seo_metadata table for a given page handle,
 * ordered from most specific/preferred to legacy/imported aliases.
 */
export function getPageEntityCandidates(handle: string): string[] {
  const def = STATIC_PAGES[handle]
  const list = [handle, `page_${handle}`]
  if (def?.aliases) {
    for (const alias of def.aliases) {
      if (!list.includes(alias)) {
        list.push(alias)
      }
    }
  }
  return list
}

