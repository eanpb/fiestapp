'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/lib/auth';
import { getFeed, getFriends, searchUsers, sendFriendRequest, acceptFriendRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FiSearch, FiUserPlus, FiCheck, FiClock, FiUsers, FiActivity, FiX } from 'react-icons/fi';
import Link from 'next/link';

function SocialPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('feed');
  const [feed, setFeed] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (tab === 'feed') {
      setLoading(true);
      getFeed().then(data => setFeed(data.feed || data)).catch(console.error).finally(() => setLoading(false));
    } else if (tab === 'friends') {
      setLoading(true);
      getFriends().then(data => setFriends(data.friends || data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [tab, user]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
    const timeout = setTimeout(() => {
      searchUsers(searchQuery).then(data => setSearchResults(data.users || data)).catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, friendshipStatus: 'pending' } : u));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="pt-20 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <span className="text-6xl block mb-4">👥</span>
            <h2 className="text-2xl font-black mb-2">Social</h2>
            <p className="text-text-secondary mb-6">Inicia sesión para ver tus amigos y feed</p>
            <Link href="/auth/login" className="btn-primary">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="page-container max-w-3xl">
          <h1 className="text-3xl font-black mb-6">Social</h1>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface rounded-xl p-1 mb-6 border border-border">
            {[
              { key: 'feed', label: 'Feed', icon: <FiActivity size={16} /> },
              { key: 'friends', label: 'Amigos', icon: <FiUsers size={16} /> },
              { key: 'search', label: 'Buscar', icon: <FiSearch size={16} /> },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-accent text-bg' : 'text-text-secondary hover:text-text'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Feed */}
          {tab === 'feed' && (
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card p-4 space-y-3"><div className="h-4 w-2/3 shimmer rounded" /><div className="h-3 w-1/3 shimmer rounded" /></div>
                ))
              ) : feed.length > 0 ? (
                feed.map((item, i) => (
                  <div key={i} className="card p-4 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-start gap-3">
                      <img src={item.user?.avatar} alt="" className="w-10 h-10 rounded-full bg-surface-2" />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-bold">{item.user?.name}</span>{' '}
                          <span className="text-text-secondary">{item.type === 'attendance' ? 'va a' : 'publicó en'}</span>{' '}
                          {item.event && <Link href={`/event/${item.event.id}`} className="text-accent font-semibold hover:underline">{item.event.title}</Link>}
                        </p>
                        {item.content && <p className="text-text-secondary text-sm mt-1">{item.content}</p>}
                        <p className="text-xs text-text-muted mt-2">{formatDate(item.createdAt || new Date().toISOString())}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <span className="text-4xl block mb-3">📭</span>
                  <p className="text-text-secondary">Aún no hay actividad en tu feed</p>
                </div>
              )}
            </div>
          )}

          {/* Friends */}
          {tab === 'friends' && (
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-4 flex items-center gap-3"><div className="w-12 h-12 rounded-full shimmer" /><div className="flex-1 space-y-2"><div className="h-4 w-1/3 shimmer rounded" /><div className="h-3 w-1/4 shimmer rounded" /></div></div>
                ))
              ) : friends.length > 0 ? (
                friends.map((friend, i) => (
                  <Link key={friend.id} href={`/user/${friend.id}`} className="card p-4 flex items-center gap-3 hover:bg-surface-2 transition-colors animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <img src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`} alt={friend.name} className="w-12 h-12 rounded-full bg-surface-2" />
                    <div className="flex-1">
                      <p className="font-bold">{friend.name}</p>
                      <p className="text-sm text-text-muted">@{friend.username}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-16">
                  <span className="text-4xl block mb-3">🤝</span>
                  <p className="text-text-secondary mb-4">Aún no tienes amigos</p>
                  <button onClick={() => setTab('search')} className="btn-primary">Buscar personas</button>
                </div>
              )}
            </div>
          )}

          {/* Search */}
          {tab === 'search' && (
            <div>
              <div className="relative mb-6">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Buscar personas por nombre o username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field !pl-11"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                    <FiX size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {searchResults.map((u, i) => (
                  <div key={u.id} className="card p-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.name} className="w-12 h-12 rounded-full bg-surface-2" />
                    <div className="flex-1">
                      <p className="font-bold">{u.name}</p>
                      <p className="text-sm text-text-muted">@{u.username}</p>
                    </div>
                    {u.id !== user.id && (
                      u.friendshipStatus === 'accepted' ? (
                        <span className="text-xs text-success flex items-center gap-1"><FiCheck size={14} /> Amigos</span>
                      ) : u.friendshipStatus === 'pending' ? (
                        <span className="text-xs text-warning flex items-center gap-1"><FiClock size={14} /> Pendiente</span>
                      ) : (
                        <button onClick={() => handleSendRequest(u.id)} className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1">
                          <FiUserPlus size={14} /> Agregar
                        </button>
                      )
                    )}
                  </div>
                ))}
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-3">🔍</span>
                    <p className="text-text-secondary">No se encontraron personas</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <SocialPage />
    </AuthProvider>
  );
}
