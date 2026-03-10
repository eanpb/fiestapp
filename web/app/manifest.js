export default function manifest() {
  return {
    name: 'FIESTAPP',
    short_name: 'FIESTAPP',
    description: 'Descubre fiestas, eventos y festivales cerca de ti en Colombia.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#07090d',
    theme_color: '#07090d',
    categories: ['music', 'social', 'lifestyle', 'entertainment'],
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}
