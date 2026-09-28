"use server"


export type Locale = {
  code: string
  name: string
}

/**
 * Fetches available locales from the backend.
 * Returns null if the endpoint is not configured.
 * To enable, set up a custom /store/locales route in the backend
 * and remove the early return below.
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  // No /store/locales endpoint is configured in the backend.
  // Return null to avoid a 404 request on every page load (~2s wasted).
  return null
}
