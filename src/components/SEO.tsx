import Head from 'next/head';

export interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  structuredData?: Record<string, any>;
  noIndex?: boolean;
}

/**
 * SEO Component
 * 
 * A reusable component for managing page metadata and SEO information.
 * This component should be included on every page to ensure proper SEO.
 * 
 * @example
 * <SEO 
 *   title="My Page Title"
 *   description="This is a description of my page"
 *   ogImage="https://example.com/image.jpg"
 * />
 */
export function SEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  ogUrl,
  twitterCard = 'summary',
  twitterSite,
  twitterCreator,
  structuredData,
  noIndex = false,
}: SEOProps) {
  // Base site information
  const baseUrl = 'https://smartdebtflow.com';
  const defaultImage = `${baseUrl}/og-image.jpg`;
  const siteName = 'Smart Debt Flow';

  // Format the full title
  const formattedTitle = title.includes(siteName) 
    ? title 
    : `${title} | ${siteName}`;

  return (
    <Head>
      <title>{formattedTitle}</title>
      
      {/* Basic Meta Tags */}
      {description && <meta name="description" content={description} />}
      
      {/* Canonical Link */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* No Index for non-production or specific pages */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage || defaultImage} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage || defaultImage} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
}

export default SEO; 