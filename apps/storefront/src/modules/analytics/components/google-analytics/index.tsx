import Script from "next/script"

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  // If no tracking ID is provided, do not render any scripts
  if (!gaId) {
    return null
  }

  return (
    <>
      {/* 1. Google Consent Mode v2 Default Configuration */}
      <Script
        id="google-consent-mode"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Initialize Consent Mode v2 with default denied state
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });

            // Check existing user preference from LaptopZone cookie consent
            try {
              var storedConsent = localStorage.getItem('cookie-consent-accepted');
              if (storedConsent === 'true') {
                gtag('consent', 'update', {
                  'analytics_storage': 'granted',
                  'ad_storage': 'granted',
                  'ad_user_data': 'granted',
                  'ad_personalization': 'granted'
                });
              }
            } catch(e) {}
          `,
        }}
      />

      {/* 2. Google Analytics Tag Library */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />

      {/* 3. GA4 Initialization with Manual Page View Handling */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              send_page_view: false
            });
          `,
        }}
      />
    </>
  )
}

