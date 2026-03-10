'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/lib/auth';
import { updateProfile } from '@/lib/api';
import { FiEdit3, FiCalendar, FiUsers, FiSettings, FiLogOut, FiChevronRight, FiSave } from 'react-icons/fi';

function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', isPublic: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', bio: user.bio || '', isPublic: user.isPublic ?? true });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateProfile(form);
      setUser(data.user);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="pt-[92px] flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <span className="text-6xl block mb-4">👤</span>
            <h2 className="text-2xl font-black mb-2">Mi Perfil</h2>
            <p className="text-text-secondary mb-6">Inicia sesión para ver tu perfil</p>
            <div className="flex gap-3 justify-center">
              <Link href="/auth/login" className="btn-primary">Iniciar sesión</Link>
              <Link href="/auth/register" className="btn-secondary">Registrarse</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-[92px] pb-12">
        <div className="page-container max-w-2xl">
          {/* Profile Header */}
          <div className="card p-8 text-center mb-6">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 bg-surface-2 border-2 border-accent/30"
            />

            {editing ? (
              <div className="space-y-3 max-w-sm mx-auto">
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-center" placeholder="Nombre" />
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field text-center resize-none" rows={3} placeholder="Bio" />
                <label className="flex items-center justify-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="accent-accent" />
                  Perfil público
                </label>
                <div className="flex gap-2 justify-center">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    <FiSave size={16} /> {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black">{user.name}</h2>
                <p className="text-text-muted">@{user.username}</p>
                {user.bio && <p className="text-text-secondary mt-2 max-w-sm mx-auto">{user.bio}</p>}
                <button onClick={() => setEditing(true)} className="btn-ghost mt-3 mx-auto flex items-center gap-2 text-sm">
                  <FiEdit3 size={14} /> Editar perfil
                </button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-black text-accent">{user._count?.attendances || 0}</p>
              <p className="text-xs text-text-muted mt-1">Eventos</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-black text-accent">{user._count?.friends || 0}</p>
              <p className="text-xs text-text-muted mt-1">Amigos</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-black text-accent">{user._count?.organizedEvents || 0}</p>
              <p className="text-xs text-text-muted mt-1">Organizados</p>
            </div>
          </div>

          {/* Menu */}
          <div className="card overflow-hidden divide-y divide-border">
            {[
              { icon: <FiCalendar size={18} />, label: 'Mis eventos', href: '/explore' },
              { icon: <FiUsers size={18} />, label: 'Amigos', href: '/social' },
              { icon: <FiSettings size={18} />, label: 'Configuración', href: '#' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center gap-3 px-5 py-4 hover:bg-surface-2 transition-colors">
                <span className="text-accent">{item.icon}</span>
                <span className="flex-1 font-medium">{item.label}</span>
                <FiChevronRight size={16} className="text-text-muted" />
              </Link>
            ))}
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-3 px-5 py-4 hover:bg-surface-2 transition-colors w-full text-left text-danger"
            >
              <FiLogOut size={18} />
              <span className="flex-1 font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <ProfilePage />
    </AuthProvider>
  );
}
