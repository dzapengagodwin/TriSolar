import { Metadata } from "next"
import NotFoundTemplate from "@modules/not-found/templates"

export const metadata: Metadata = {
  title: "404 - Page Not Found | TRITECH",
  description:
    "The page you are looking for could not be found. Discover enterprise networking hardware, switches, routers, and business laptops at TRITECH.",
}

export default function NotFound() {
  return <NotFoundTemplate countryCode="zw" />
}
