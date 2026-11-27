import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
}

const SITE_URL = 'https://styleendpurse.com';

export function SEO({
  title = 'Style End Purse | Luxury Handbags, Footwear & Accessories',
  description = 'Explore exquisite designer handbags, luxury footwear & heels, leather pouches, and curated 3-piece ensemble sets at Style End Purse.',
  keywords = 'style end purse, luxury handbags, designer purses, women shoes, heels, leather pouches, 3 piece sets, pakistan',
  image = '/style-end-logo.svg',
  url,
  type = 'website',
  schema
}: SEOProps) {
  const canonicalUrl =
    url ||
    (typeof window !== 'undefined'
      ? `${SITE_URL}${window.location.pathname === '/' ? '' : window.location.pathname}`
      : SITE_URL);

  const absoluteImage = image.startsWith('http')
    ? image
    : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={absoluteImage} />

      {/* Additional SEO Tags */}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow" />
      
      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

