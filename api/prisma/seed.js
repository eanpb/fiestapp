const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── USERS ──
  const hash = await bcrypt.hash('demo123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: { email: 'demo@fiestapp.co', password: hash, name: 'Demo User', username: 'demo', bio: 'Party lover 🎉', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo' }
    }),
    prisma.user.create({
      data: { email: 'maria@fiestapp.co', password: hash, name: 'María García', username: 'maria_g', bio: 'Reggaeton all day 🔥', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria' }
    }),
    prisma.user.create({
      data: { email: 'carlos@fiestapp.co', password: hash, name: 'Carlos López', username: 'carlos_dj', bio: 'DJ & Producer 🎧', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos' }
    }),
    prisma.user.create({
      data: { email: 'valentina@fiestapp.co', password: hash, name: 'Valentina Torres', username: 'vale_t', bio: 'Techno vibes only ⚡', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=valentina', isPublic: false }
    }),
    prisma.user.create({
      data: { email: 'andres@fiestapp.co', password: hash, name: 'Andrés Martínez', username: 'andres_m', bio: 'Salsa es mi vida', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andres' }
    }),
    prisma.user.create({
      data: { email: 'laura@fiestapp.co', password: hash, name: 'Laura Restrepo', username: 'lau_r', bio: 'Festivals & concerts 🎤', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura' }
    }),
  ]);

  console.log(`✅ Created ${users.length} users (password: demo123)`);

  // ── FRIENDSHIPS ──
  await Promise.all([
    prisma.friendship.create({ data: { requesterId: users[0].id, addresseeId: users[1].id, status: 'accepted' } }),
    prisma.friendship.create({ data: { requesterId: users[0].id, addresseeId: users[2].id, status: 'accepted' } }),
    prisma.friendship.create({ data: { requesterId: users[0].id, addresseeId: users[4].id, status: 'accepted' } }),
    prisma.friendship.create({ data: { requesterId: users[1].id, addresseeId: users[3].id, status: 'accepted' } }),
    prisma.friendship.create({ data: { requesterId: users[3].id, addresseeId: users[0].id, status: 'pending' } }),
    prisma.friendship.create({ data: { requesterId: users[5].id, addresseeId: users[0].id, status: 'pending' } }),
  ]);
  console.log('✅ Created friendships');

  // ── EVENTS (Colombia: Bogotá, Medellín, Cali, Cartagena, Barranquilla) ──
  const now = new Date();
  const day = 86400000;

  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Baum Festival 2026',
        description: 'El festival de electrónica más grande de Colombia. 3 escenarios, 24 artistas, una noche inolvidable. Dress code: all black.',
        date: new Date(now.getTime() + 3 * day),
        endDate: new Date(now.getTime() + 3 * day + 10 * 3600000),
        lat: 4.667, lng: -74.056,
        address: 'Cra 13 #82-74, Bogotá', venue: 'Baum Club',
        price: 180000, genre: 'Techno',
        artists: JSON.stringify(['Boris Brejcha', 'Amelie Lens', 'Local Resident']),
        imageUrl: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800', 
        capacity: 3000, minAge: 18, featured: true,
        organizerId: users[2].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Salsa al Parque',
        description: 'El encuentro más grande de salsa en Cali. Orquestas en vivo, clases de baile y mucho sabor. Evento al aire libre, entrada libre.',
        date: new Date(now.getTime() + 5 * day),
        lat: 3.451, lng: -76.532,
        address: 'Parque de la Música, Cali', venue: 'Parque de la Música',
        price: 0, genre: 'Salsa',
        artists: JSON.stringify(['Grupo Niche', 'Son de Cali', 'Orquesta Guayacán']),
        imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
        capacity: 10000, featured: true,
        organizerId: users[4].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Reggaeton Beach Party',
        description: 'La playa se enciende con los mejores beats de reggaetón. Open bar, piscina infinity, sunset DJ set. Dress code: white.',
        date: new Date(now.getTime() + 7 * day),
        endDate: new Date(now.getTime() + 7 * day + 8 * 3600000),
        lat: 10.395, lng: -75.514,
        address: 'Hotel Las Américas, Cartagena', venue: 'Las Américas Resort',
        price: 250000, genre: 'Reggaeton',
        artists: JSON.stringify(['Feid', 'Ryan Castro', 'Blessd']),
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        capacity: 2000, minAge: 18, featured: true,
        organizerId: users[1].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Underground Warehouse',
        description: 'Sesión underground en bodega. Solo techno/house. Dirección revelada 2h antes. BYOB. Line-up secreto.',
        date: new Date(now.getTime() + 2 * day),
        lat: 6.248, lng: -75.574,
        address: 'Ubicación secreta - Medellín', venue: 'Warehouse TBA',
        price: 50000, genre: 'House',
        artists: JSON.stringify(['???', 'Residents Only']),
        imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
        capacity: 500, minAge: 21,
        organizerId: users[3].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Carnaval Electrónico',
        description: 'La versión electrónica del Carnaval de Barranquilla. Marimondas con bass drops. Cumbia meets techno.',
        date: new Date(now.getTime() + 10 * day),
        lat: 10.964, lng: -74.796,
        address: 'Vía 40, Barranquilla', venue: 'Vía 40 Open Air',
        price: 120000, genre: 'Electronic',
        artists: JSON.stringify(['Bomba Estéreo', 'Acid Pauli', 'Nicola Cruz']),
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        capacity: 8000, featured: true,
        organizerId: users[2].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Hip Hop Nights Vol. 12',
        description: 'Freestyle battles, rap en vivo, graffiti en vivo. La cultura urbana se toma Medellín. MC, DJ, B-Boys, todo en una noche.',
        date: new Date(now.getTime() + 4 * day),
        lat: 6.210, lng: -75.571,
        address: 'Calle 44 #70-29, Medellín', venue: 'Salon Amador',
        price: 45000, genre: 'Hip-Hop',
        artists: JSON.stringify(['Nanpa Básico', 'Akapellah', 'MC Local']),
        imageUrl: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
        capacity: 800, minAge: 16,
        organizerId: users[0].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Fiesta Vallenata',
        description: 'Los mejores acordeoneros del país en una noche. Vallenato tradicional y nueva ola. Con cena incluida.',
        date: new Date(now.getTime() + 6 * day),
        lat: 4.710, lng: -74.072,
        address: 'Cra 7 #67-49, Bogotá', venue: 'Gaira Café',
        price: 95000, genre: 'Vallenato',
        artists: JSON.stringify(['Silvestre Dangond', 'Elder Dayán', 'Rolando Ochoa']),
        imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
        capacity: 600,
        organizerId: users[4].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Sunset Rooftop Sessions',
        description: 'Deep house y cocktails artesanales en el rooftop más alto de Bogotá. Vista 360° de la ciudad. Smart casual.',
        date: new Date(now.getTime() + 1 * day),
        lat: 4.651, lng: -74.055,
        address: 'Clle 93a #11-12, Piso 28, Bogotá', venue: 'Alto Rooftop',
        price: 75000, genre: 'Deep House',
        artists: JSON.stringify(['Café del Mar residents', 'DJ Soulful Set']),
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        capacity: 200, minAge: 18,
        organizerId: users[3].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Pop Latino Festival',
        description: 'Los hits más grandes del pop latino en un solo escenario. Karaoke zone, photobooth, y mucha buena vibra.',
        date: new Date(now.getTime() + 12 * day),
        lat: 6.265, lng: -75.566,
        address: 'Parque Norte, Medellín', venue: 'Parque Norte',
        price: 85000, genre: 'Pop',
        artists: JSON.stringify(['Sebastián Yatra', 'Camilo', 'Manuel Turizo']),
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        capacity: 15000, featured: true,
        organizerId: users[1].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Rock al Río',
        description: 'Festival de rock alternativo junto al río Cali. 2 escenarios, food trucks, craftbeer garden. Llueva o truene.',
        date: new Date(now.getTime() + 14 * day),
        lat: 3.437, lng: -76.522,
        address: 'Bulevar del Río, Cali', venue: 'Bulevar del Río',
        price: 60000, genre: 'Rock',
        artists: JSON.stringify(['Diamante Eléctrico', 'Telebit', 'Canserbero Tribute']),
        imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        capacity: 5000,
        organizerId: users[0].id
      }
    }),
  ]);

  console.log(`✅ Created ${events.length} events`);

  // ── ATTENDANCES ──
  await Promise.all([
    // Demo user goes to several events
    prisma.attendance.create({ data: { userId: users[0].id, eventId: events[0].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[0].id, eventId: events[2].id, status: 'interested' } }),
    prisma.attendance.create({ data: { userId: users[0].id, eventId: events[7].id, status: 'going' } }),
    // María
    prisma.attendance.create({ data: { userId: users[1].id, eventId: events[2].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[1].id, eventId: events[0].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[1].id, eventId: events[8].id, status: 'interested' } }),
    // Carlos
    prisma.attendance.create({ data: { userId: users[2].id, eventId: events[0].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[2].id, eventId: events[3].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[2].id, eventId: events[4].id, status: 'going' } }),
    // Valentina
    prisma.attendance.create({ data: { userId: users[3].id, eventId: events[3].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[3].id, eventId: events[0].id, status: 'interested' } }),
    // Andrés
    prisma.attendance.create({ data: { userId: users[4].id, eventId: events[1].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[4].id, eventId: events[6].id, status: 'going' } }),
    // Laura
    prisma.attendance.create({ data: { userId: users[5].id, eventId: events[4].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[5].id, eventId: events[8].id, status: 'going' } }),
    prisma.attendance.create({ data: { userId: users[5].id, eventId: events[9].id, status: 'interested' } }),
  ]);
  console.log('✅ Created attendances');

  console.log('\n🎉 Seed complete!');
  console.log('📧 Login: demo@fiestapp.co / demo123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
