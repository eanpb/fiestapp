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

  // ── EVENTS (Chile: Santiago — Bellavista, Barrio Italia, Las Condes, Providencia, etc.) ──
  const now = new Date();
  const day = 86400000;

  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Blondie Techno Night',
        description: 'La noche más oscura de Santiago vuelve al club de referencia. 3 salas, luces stroboscópicas, line-up all-black. Dress code obligatorio: negro total.',
        date: new Date(now.getTime() + 3 * day),
        endDate: new Date(now.getTime() + 3 * day + 10 * 3600000),
        lat: -33.4310, lng: -70.6440,
        address: 'Loreto 68, Bellavista, Santiago', venue: 'Club Blondie',
        price: 18000, genre: 'Techno',
        artists: JSON.stringify(['Boris Brejcha', 'Amelie Lens', 'Local Resident']),
        imageUrl: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800',
        capacity: 3000, minAge: 18, featured: true,
        organizerId: users[2].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Salsa en el Parque',
        description: 'El mejor encuentro de salsa en Santiago. Orquestas en vivo, clases abiertas y mucho sabor. Evento al aire libre, entrada liberada.',
        date: new Date(now.getTime() + 5 * day),
        lat: -33.3936, lng: -70.5779,
        address: 'Av. Bicentenario 3600, Vitacura', venue: 'Parque Bicentenario',
        price: 0, genre: 'Salsa',
        artists: JSON.stringify(['Orquesta Son del Pacífico', 'Grupo Karma', 'Los Conquistadores']),
        imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
        capacity: 10000, featured: true,
        organizerId: users[4].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Reggaeton Pool Party',
        description: 'La piscina del W Santiago se convierte en la mejor fiesta del año. Open bar, DJ desde el atardecer. Dress code: blanco.',
        date: new Date(now.getTime() + 7 * day),
        endDate: new Date(now.getTime() + 7 * day + 8 * 3600000),
        lat: -33.4138, lng: -70.5969,
        address: 'Isidora Goyenechea 3000, Las Condes', venue: 'W Santiago Hotel',
        price: 25000, genre: 'Reggaeton',
        artists: JSON.stringify(['Feid', 'Ryan Castro', 'Blessd']),
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        capacity: 2000, minAge: 18, featured: true,
        organizerId: users[1].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Underground Warehouse',
        description: 'Sesión underground en bodega secreta. Solo techno/house. Dirección revelada 2h antes. BYOB. Line-up anónimo.',
        date: new Date(now.getTime() + 2 * day),
        lat: -33.4488, lng: -70.6387,
        address: 'Ubicación secreta · Barrio Italia', venue: 'Galpón TBA',
        price: 8000, genre: 'House',
        artists: JSON.stringify(['???', 'Residents Only']),
        imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
        capacity: 500, minAge: 21,
        organizerId: users[3].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Festival Primavera Electrónica',
        description: 'El festival open-air más esperado del año en Santiago. Cumbia meets techno, 4 escenarios, food trucks, campamento.',
        date: new Date(now.getTime() + 10 * day),
        lat: -33.4872, lng: -70.7195,
        address: 'Av. Lo Errázuriz 1000, Cerrillos', venue: 'Parque Cerrillos',
        price: 12000, genre: 'Electronic',
        artists: JSON.stringify(['Bomba Estéreo', 'Nicola Cruz', 'Acid Pauli']),
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        capacity: 8000, featured: true,
        organizerId: users[2].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Hip Hop Nights Vol. 12',
        description: 'Freestyle battles, rap en vivo, graffiti en vivo. La cultura urbana toma Santiago Centro. MC, DJ, B-Boys, todo en una noche.',
        date: new Date(now.getTime() + 4 * day),
        lat: -33.4534, lng: -70.6514,
        address: 'Bombero Ossa 1020, Santiago Centro', venue: 'Club Subterráneo',
        price: 7000, genre: 'Hip-Hop',
        artists: JSON.stringify(['Portavoz', 'Movimiento Original', 'MC Local']),
        imageUrl: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
        capacity: 800, minAge: 16,
        organizerId: users[0].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Noche de Cueca & Folclore',
        description: 'Los mejores conjuntos folklóricos del país en el escenario más emblemático de Santiago. Cueca brava, fonda chic, huaso moderno.',
        date: new Date(now.getTime() + 6 * day),
        lat: -33.4562, lng: -70.6484,
        address: 'San Diego 850, Santiago Centro', venue: 'Teatro Caupolicán',
        price: 15000, genre: 'Folclore',
        artists: JSON.stringify(['Los Huasos Quincheros', 'Millaray', 'Conjunto Cuncumén']),
        imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
        capacity: 4500,
        organizerId: users[4].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Sunset Rooftop Sessions',
        description: 'Deep house y cócteles artesanales en el rooftop del Costanera Center. Vista 360° de los Andes y la ciudad. Smart casual obligatorio.',
        date: new Date(now.getTime() + 1 * day),
        lat: -33.4194, lng: -70.6073,
        address: 'Av. Andrés Bello 2425, Providencia', venue: 'Sky Costanera',
        price: 12000, genre: 'Deep House',
        artists: JSON.stringify(['Café del Mar residents', 'DJ Soulful Set']),
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        capacity: 200, minAge: 18,
        organizerId: users[3].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Festival Pop Latino',
        description: 'Los hits más grandes del pop latino en el estadio más icónico de Chile. Karaoke zone, photobooth, y mucha buena vibra.',
        date: new Date(now.getTime() + 12 * day),
        lat: -33.4647, lng: -70.6027,
        address: 'Av. Grecia 2001, Ñuñoa', venue: 'Estadio Nacional',
        price: 22000, genre: 'Pop',
        artists: JSON.stringify(['Sebastián Yatra', 'Camilo', 'Mon Laferte']),
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        capacity: 55000, featured: true,
        organizerId: users[1].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Rock en Bellavista',
        description: 'Noche de rock alternativo chileno en el corazón de Bellavista. 2 escenarios, food trucks, craftbeer garden.',
        date: new Date(now.getTime() + 14 * day),
        lat: -33.4300, lng: -70.6437,
        address: 'Loreto 20, Bellavista, Santiago', venue: 'Club Chocolate',
        price: 9000, genre: 'Rock',
        artists: JSON.stringify(['Moral Distraída', 'Matorral', 'Tiro de Gracia']),
        imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        capacity: 1200,
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
