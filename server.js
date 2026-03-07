const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── Sample event data ──
const events = [
  {
    id: 1,
    title: "Neon Nights",
    subtitle: "Electronic Music Festival",
    date: "2026-03-14",
    time: "22:00",
    venue: "Warehouse 54",
    address: "Calle 54 #12-30, Bogotá",
    lat: 4.6690,
    lng: -74.0580,
    price: 85000,
    currency: "COP",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80",
    artists: ["DJ Snake", "Alesso", "KVSH"],
    genre: "Electrónica",
    tags: ["EDM", "Festival", "Neon"],
    capacity: 3000,
    attending: 1842,
    description: "La fiesta electrónica más grande de la ciudad. Luces neón, sonido envolvente y los mejores DJs internacionales."
  },
  {
    id: 2,
    title: "Reggaetón Royale",
    subtitle: "La Noche Urbana",
    date: "2026-03-21",
    time: "21:00",
    venue: "Club Platinum",
    address: "Carrera 7 #45-10, Bogotá",
    lat: 4.6480,
    lng: -74.0630,
    price: 60000,
    currency: "COP",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
    artists: ["Feid", "Ryan Castro", "Blessd"],
    genre: "Reggaetón",
    tags: ["Urbano", "VIP", "Premium"],
    capacity: 2000,
    attending: 1567,
    description: "Los reyes del reggaetón en una noche exclusiva. Open bar hasta las 12. Zona VIP disponible."
  },
  {
    id: 3,
    title: "Techno Underground",
    subtitle: "Secret Rave",
    date: "2026-03-28",
    time: "23:00",
    venue: "La Bodega Secreta",
    address: "Calle 85 #15-22, Bogotá",
    lat: 4.6780,
    lng: -74.0470,
    price: 45000,
    currency: "COP",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&q=80",
    artists: ["Charlotte de Witte", "Amelie Lens"],
    genre: "Techno",
    tags: ["Underground", "Rave", "Secret"],
    capacity: 500,
    attending: 487,
    description: "Ubicación revelada 2h antes del evento. Solo para los verdaderos amantes del techno underground."
  },
  {
    id: 4,
    title: "Salsa en la Calle",
    subtitle: "Festival de Salsa",
    date: "2026-04-04",
    time: "19:00",
    venue: "Plaza Central",
    address: "Carrera 10 #28-50, Bogotá",
    lat: 4.6350,
    lng: -74.0720,
    price: 35000,
    currency: "COP",
    image: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=600&q=80",
    artists: ["Grupo Niche", "Oscar D'León", "La Sonora Dinamita"],
    genre: "Salsa",
    tags: ["Latino", "Baile", "En Vivo"],
    capacity: 5000,
    attending: 3200,
    description: "La salsa se toma las calles. Orquestas en vivo, clases de baile gratuitas y mucho sabor."
  },
  {
    id: 5,
    title: "Trap House",
    subtitle: "Urban Night Experience",
    date: "2026-04-11",
    time: "22:00",
    venue: "Studio 88",
    address: "Calle 93 #11-30, Bogotá",
    lat: 4.6820,
    lng: -74.0530,
    price: 70000,
    currency: "COP",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    artists: ["Mora", "Dei V", "Young Miko"],
    genre: "Trap",
    tags: ["Trap", "Urban", "Premium"],
    capacity: 1500,
    attending: 1120,
    description: "La experiencia urbana definitiva. Freestyle battles, beats exclusivos y los artistas trap del momento."
  },
  {
    id: 6,
    title: "House Garden Party",
    subtitle: "Daytime Vibes",
    date: "2026-04-18",
    time: "14:00",
    venue: "Jardín Botánico Norte",
    address: "Calle 63 #68-95, Bogotá",
    lat: 4.6610,
    lng: -74.0930,
    price: 55000,
    currency: "COP",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
    artists: ["Disclosure", "Rüfüs Du Sol"],
    genre: "House",
    tags: ["Garden", "Daytime", "Chill"],
    capacity: 2500,
    attending: 1890,
    description: "Música house al aire libre rodeado de naturaleza. Food trucks, cócteles artesanales y buen house music."
  },
  {
    id: 7,
    title: "Rock en Vivo",
    subtitle: "Festival Rock Alternativo",
    date: "2026-04-25",
    time: "18:00",
    venue: "Parque Simón Bolívar",
    address: "Calle 53, Bogotá",
    lat: 4.6580,
    lng: -74.0940,
    price: 90000,
    currency: "COP",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80",
    artists: ["Aterciopelados", "Bomba Estéreo", "Diamante Eléctrico"],
    genre: "Rock",
    tags: ["Rock", "Festival", "En Vivo"],
    capacity: 10000,
    attending: 7500,
    description: "El festival de rock alternativo más importante. Tres escenarios, bandas nacionales e internacionales."
  },
  {
    id: 8,
    title: "Afrobeats Night",
    subtitle: "Ritmos Africanos",
    date: "2026-05-02",
    time: "21:00",
    venue: "Armando Records",
    address: "Calle 85 #14-46, Bogotá",
    lat: 4.6770,
    lng: -74.0490,
    price: 50000,
    currency: "COP",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    artists: ["Burna Boy DJ Set", "Amaarae"],
    genre: "Afrobeats",
    tags: ["Afrobeats", "Dance", "World"],
    capacity: 800,
    attending: 620,
    description: "Una noche dedicada a los ritmos africanos. Afrobeats, amapiano y mucha energía."
  }
];

// ── API Routes ──
app.get('/api/events', (req, res) => {
  const { genre, search, minPrice, maxPrice } = req.query;
  let filtered = [...events];
  if (genre && genre !== 'Todos') {
    filtered = filtered.filter(e => e.genre === genre);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.artists.some(a => a.toLowerCase().includes(q)) ||
      e.venue.toLowerCase().includes(q)
    );
  }
  if (minPrice) filtered = filtered.filter(e => e.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(e => e.price <= Number(maxPrice));
  res.json(filtered);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === Number(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.get('/api/genres', (req, res) => {
  const genres = ['Todos', ...new Set(events.map(e => e.genre))];
  res.json(genres);
});

const os = require('os');
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`\n🎉 FIESTAPP running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${ip}:${PORT}`);
  console.log(`\n📱 Abre esta URL en tu teléfono para verla como app iOS\n`);
});
