type GoogleAnalyticsScriptsProps = {
  gaId?: string
  nonce?: string
}

export function GoogleAnalyticsScripts({gaId, nonce}: GoogleAnalyticsScriptsProps) {
  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
            window.gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              functionality_storage: 'granted',
              personalization_storage: 'denied',
              security_storage: 'granted',
              wait_for_update: 500
            });
          `,
        }}
      />
      {gaId ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
                window.__neoGaId = ${JSON.stringify(gaId)};
                window.gtag('js', new Date());
                window.gtag('config', ${JSON.stringify(gaId)}, {
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      ) : null}
    </>
  )
}
