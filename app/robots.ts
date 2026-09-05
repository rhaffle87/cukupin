import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/legal/privacy', '/legal/terms'],
        disallow: ['/dashboard', '/transactions', '/reports', '/goals', '/wishlist', '/auth/'],
      },
    ],
    sitemap: 'https://cukupin.app/sitemap.xml',
  }
}
