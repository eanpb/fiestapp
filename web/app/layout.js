import './globals.css';

export const metadata = {
  title: 'FIESTAPP — Encuentra tu próxima fiesta',
  description: 'Descubre eventos, fiestas y festivales cerca de ti. Mapa interactivo, géneros musicales, y conecta con amigos.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="min-h-screen bg-bg antialiased">
        {children}
      </body>
    </html>
  );
}
