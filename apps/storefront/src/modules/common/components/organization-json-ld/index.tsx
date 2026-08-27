import { ORGANIZATION_INFO } from "@lib/seo/constants"

/**
 * Emits Schema.org OnlineStore JSON-LD Structured Data for LaptopZone
 */
export default function OrganizationJsonLd() {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: ORGANIZATION_INFO.name,
    legalName: ORGANIZATION_INFO.legalName,
    url: ORGANIZATION_INFO.url,
    logo: ORGANIZATION_INFO.logo,
    description: ORGANIZATION_INFO.description,
  }

  if (ORGANIZATION_INFO.telephone || ORGANIZATION_INFO.email) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      telephone: ORGANIZATION_INFO.telephone,
      email: ORGANIZATION_INFO.email,
      contactType: "Customer Service",
      areaServed: "ZW",
      availableLanguage: ["English"],
    }
  }

  if (ORGANIZATION_INFO.sameAs && ORGANIZATION_INFO.sameAs.length > 0) {
    schema.sameAs = ORGANIZATION_INFO.sameAs
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}
