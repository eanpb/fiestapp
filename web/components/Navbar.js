'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { FiMap, FiSearch, FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiPlus } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🎉</span>
            <span className="text-xl font-black tracking-tight text-text group-hover:text-accent transition-colors">
              FIESTAPP
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="btn-ghost flex items-center gap-2">
              <FiMap size={18} /> Mapa
            </Link>
            <Link href="/explore" className="btn-ghost flex items-center gap-2">
              <FiSearch size={18} /> Explorar
            </Link>
            {user && (
              <Link href="/social" className="btn-ghost flex items-center gap-2">
                <FiUsers size={18} /> Social
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/create" className="btn-primary flex items-center gap-2 !py-2 !px-4 text-sm">
                  <FiPlus size={16} /> Crear Evento
                </Link>
                <Link href="/profile" className="flex items-center gap-2 btn-ghost">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-surface-2"
                  />
                  <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="btn-ghost !px-2" title="Cerrar sesión">
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm">Iniciar sesión</Link>
                <Link href="/auth/register" className="btn-primary !py-2 !px-4 text-sm">Registrarse</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden btn-ghost !px-2">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-2 transition-colors">
              <FiMap size={20} className="text-accent" /> <span>Mapa</span>
            </Link>
            <Link href="/explore" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-2 transition-colors">
              <FiSearch size={20} className="text-accent" /> <span>Explorar</span>
            </Link>
            {user && (
              <Link href="/social" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-2 transition-colors">
                <FiUsers size={20} className="text-accent" /> <span>Social</span>
              </Link>
            )}
            <div className="border-t border-border my-2" />
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-2 transition-colors">
                  <FiUser size={20} className="text-accent" /> <span>{user.name}</span>
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-2 transition-colors w-full text-left text-danger">
                  <FiLogOut size={20} /> <span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-2 transition-colors">
                  <FiUser size={20} className="text-accent" /> <span>Iniciar sesión</span>
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="btn-primary block text-center mt-2">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
