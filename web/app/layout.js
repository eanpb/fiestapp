import './globals.css';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export const metadata = {
  title: 'FIESTAPP — Encuentra tu próxima fiesta',
  description: 'Descubre eventos, fiestas y festivales cerca de ti. Mapa interactivo, géneros musicales, y conecta con amigos.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FIESTAPP',
  },
};

export const viewport = {
  themeColor: '#07090d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="min-h-screen bg-bg antialiased">
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
