const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, optionalAuth, JWT_SECRET } = require('./middleware/auth');
const os = require('os');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, username } = req.body;
    if (!email || !password || !name || !username) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (exists) {
      return res.status(409).json({ error: 'Email o username ya existe' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name, username },
      select: { id: true, email: true, name: true, username: true, avatar: true, isPublic: true }
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userData } = user;
    res.json({ user: userData, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, name: true, username: true,
        avatar: true, bio: true, isPublic: true, createdAt: true,
        _count: { select: { attendances: true, organizedEvents: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const friendCount = await prisma.friendship.count({
      where: {
        status: 'accepted',
        OR: [{ requesterId: req.userId }, { addresseeId: req.userId }]
      }
    });
    res.json({ ...user, friendCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, username, bio, avatar, isPublic } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, username, bio, avatar, isPublic },
      select: { id: true, email: true, name: true, username: true, avatar: true, bio: true, isPublic: true }
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// ═══════════════════════════════════════════
// EVENTS ROUTES
// ═══════════════════════════════════════════
app.get('/api/events', optionalAuth, async (req, res) => {
  try {
    const { genre, search, minPrice, maxPrice, featured, lat, lng, radius } = req.query;
    const where = {};

    if (genre) where.genre = genre;
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { artists: { contains: search } },
        { venue: { contains: search } }
      ];
    }
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    where.date = { gte: new Date() };

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: { select: { id: true, name: true, username: true, avatar: true } },
        _count: { select: { attendances: true } }
      },
      orderBy: { date: 'asc' }
    });

    // If user is authenticated, include their attendance status
    let userAttendances = {};
    if (req.userId) {
      const atts = await prisma.attendance.findMany({
        where: { userId: req.userId, eventId: { in: events.map(e => e.id) } }
      });
      atts.forEach(a => { userAttendances[a.eventId] = a.status; });
    }

    const result = events.map(e => ({
      ...e,
      artists: JSON.parse(e.artists || '[]'),
      attendeeCount: e._count.attendances,
      myStatus: userAttendances[e.id] || null
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

app.get('/api/events/:id', optionalAuth, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        organizer: { select: { id: true, name: true, username: true, avatar: true } },
        attendances: {
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } }
          },
          take: 50,
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { attendances: true, posts: true } }
      }
    });
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    let myStatus = null;
    let friendsGoing = [];
    if (req.userId) {
      const att = await prisma.attendance.findUnique({
        where: { userId_eventId: { userId: req.userId, eventId: event.id } }
      });
      myStatus = att?.status || null;

      // Get friends who are attending
      const friends = await prisma.friendship.findMany({
        where: {
          status: 'accepted',
          OR: [{ requesterId: req.userId }, { addresseeId: req.userId }]
        }
      });
      const friendIds = friends.map(f =>
        f.requesterId === req.userId ? f.addresseeId : f.requesterId
      );
      friendsGoing = await prisma.attendance.findMany({
        where: { eventId: event.id, userId: { in: friendIds } },
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } }
        }
      });
    }

    res.json({
      ...event,
      artists: JSON.parse(event.artists || '[]'),
      attendeeCount: event._count.attendances,
      myStatus,
      friendsGoing: friendsGoing.map(a => a.user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/events', authMiddleware, async (req, res) => {
  try {
    const { title, description, date, endDate, lat, lng, address, venue, price, currency, genre, artists, imageUrl, capacity, minAge } = req.body;
    const event = await prisma.event.create({
      data: {
        title, description, date: new Date(date), endDate: endDate ? new Date(endDate) : null,
        lat, lng, address, venue, price: price || 0, currency: currency || 'COP',
        genre, artists: JSON.stringify(artists || []), imageUrl, capacity, minAge,
        organizerId: req.userId
      }
    });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

app.get('/api/genres', async (req, res) => {
  try {
    const events = await prisma.event.findMany({ select: { genre: true }, distinct: ['genre'] });
    res.json(events.map(e => e.genre));
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// ═══════════════════════════════════════════
// ATTENDANCE ROUTES
// ═══════════════════════════════════════════
app.post('/api/events/:id/attend', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // going, interested, maybe
    const attendance = await prisma.attendance.upsert({
      where: { userId_eventId: { userId: req.userId, eventId: req.params.id } },
      update: { status: status || 'going' },
      create: { userId: req.userId, eventId: req.params.id, status: status || 'going' }
    });
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

app.delete('/api/events/:id/attend', authMiddleware, async (req, res) => {
  try {
    await prisma.attendance.delete({
      where: { userId_eventId: { userId: req.userId, eventId: req.params.id } }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/events/:id/attendees', async (req, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { eventId: req.params.id },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true, isPublic: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(attendances.map(a => ({ ...a.user, status: a.status })));
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// ═══════════════════════════════════════════
// FRIENDS ROUTES
// ═══════════════════════════════════════════
app.get('/api/friends', authMiddleware, async (req, res) => {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: req.userId }, { addresseeId: req.userId }]
      },
      include: {
        requester: { select: { id: true, name: true, username: true, avatar: true } },
        addressee: { select: { id: true, name: true, username: true, avatar: true } }
      }
    });
    const friends = friendships.map(f =>
      f.requesterId === req.userId ? f.addressee : f.requester
    );
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/friends/requests', authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.friendship.findMany({
      where: { addresseeId: req.userId, status: 'pending' },
      include: {
        requester: { select: { id: true, name: true, username: true, avatar: true } }
      }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/friends/request', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId === req.userId) return res.status(400).json({ error: 'No puedes agregarte a ti mismo' });

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: req.userId, addresseeId: userId },
          { requesterId: userId, addresseeId: req.userId }
        ]
      }
    });
    if (existing) {
      if (existing.status === 'accepted') return res.status(400).json({ error: 'Ya son amigos' });
      if (existing.status === 'pending') return res.status(400).json({ error: 'Solicitud ya enviada' });
    }

    const friendship = await prisma.friendship.create({
      data: { requesterId: req.userId, addresseeId: userId }
    });
    res.status(201).json(friendship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

app.put('/api/friends/:id/accept', authMiddleware, async (req, res) => {
  try {
    const friendship = await prisma.friendship.findUnique({ where: { id: req.params.id } });
    if (!friendship || friendship.addresseeId !== req.userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const updated = await prisma.friendship.update({
      where: { id: req.params.id },
      data: { status: 'accepted' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

app.delete('/api/friends/:id', authMiddleware, async (req, res) => {
  try {
    const friendship = await prisma.friendship.findUnique({ where: { id: req.params.id } });
    if (!friendship || (friendship.requesterId !== req.userId && friendship.addresseeId !== req.userId)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    await prisma.friendship.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// Friends' upcoming events (social feed)
app.get('/api/feed', authMiddleware, async (req, res) => {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: req.userId }, { addresseeId: req.userId }]
      }
    });
    const friendIds = friendships.map(f =>
      f.requesterId === req.userId ? f.addresseeId : f.requesterId
    );

    const friendActivity = await prisma.attendance.findMany({
      where: {
        userId: { in: friendIds },
        event: { date: { gte: new Date() } }
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        event: {
          select: { id: true, title: true, date: true, venue: true, imageUrl: true, genre: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(friendActivity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

// ═══════════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════════
app.get('/api/users/search', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { username: { contains: q } }
        ]
      },
      select: { id: true, name: true, username: true, avatar: true, isPublic: true },
      take: 20
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/users/:id', optionalAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, username: true, avatar: true, bio: true, isPublic: true, createdAt: true,
        _count: { select: { attendances: true, organizedEvents: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Check friendship status
    let friendshipStatus = null;
    let friendshipId = null;
    if (req.userId && req.userId !== user.id) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: req.userId, addresseeId: user.id },
            { requesterId: user.id, addresseeId: req.userId }
          ]
        }
      });
      if (friendship) {
        friendshipStatus = friendship.status;
        friendshipId = friendship.id;
      }
    }

    // Get upcoming events they're attending (if public or friend)
    let upcomingEvents = [];
    const isFriend = friendshipStatus === 'accepted';
    if (user.isPublic || isFriend || req.userId === user.id) {
      upcomingEvents = await prisma.attendance.findMany({
        where: {
          userId: user.id,
          event: { date: { gte: new Date() } }
        },
        include: {
          event: {
            select: { id: true, title: true, date: true, venue: true, imageUrl: true, genre: true }
          }
        },
        take: 10,
        orderBy: { event: { date: 'asc' } }
      });
    }

    res.json({
      ...user,
      friendshipStatus,
      friendshipId,
      upcomingEvents: upcomingEvents.map(a => a.event)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

// ═══════════════════════════════════════════
// POSTS ROUTES (Social)
// ═══════════════════════════════════════════
app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { content, imageUrl, eventId, type } = req.body;
    const post = await prisma.post.create({
      data: { content, imageUrl, type: type || 'status', userId: req.userId, eventId },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        event: { select: { id: true, title: true } }
      }
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/posts', optionalAuth, async (req, res) => {
  try {
    const { eventId, userId } = req.query;
    const where = {};
    if (eventId) where.eventId = eventId;
    if (userId) where.userId = userId;

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        event: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// ═══════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', name: 'FIESTAPP API' });
});

// ═══════════════════════════════════════════
// START
// ═══════════════════════════════════════════
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`
╔══════════════════════════════════════════╗
║         🎉 FIESTAPP API v2.0           ║
╠══════════════════════════════════════════╣
║  Local:   http://localhost:${PORT}         ║
║  Network: http://${ip}:${PORT}      ║
╚══════════════════════════════════════════╝
  `);
});
