import { Metadata } from "next"
import NotFoundTemplate from "@modules/not-found/templates"

export const metadata: Metadata = {
  title: "404 - Page Not Found | Laptopzone",
  description:
    "The page you are looking for could not be found. Discover popular laptops, gaming PCs, and tech accessories at Laptopzone.",
}

export default function NotFound() {
  return <NotFoundTemplate countryCode="zw" />
}
