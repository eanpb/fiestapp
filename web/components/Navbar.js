'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { FiMap, FiSearch, FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiPlus, FiDownload } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent bg-[linear-gradient(180deg,rgba(6,9,14,0.88),rgba(6,9,14,0.46)_68%,transparent)] backdrop-blur-2xl md:border-white/5 md:bg-[rgba(7,9,13,0.72)]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="page-container">
        <div className="flex items-center justify-between h-[74px]">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_20px_rgba(139,92,246,0.65)]" />
            <span className="text-[1.05rem] font-black tracking-[-0.04em] text-text group-hover:text-white transition-colors">
              FIESTAPP
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.02] p-1">
            <Link href="/" className="btn-ghost flex items-center gap-2 !rounded-full">
              <FiMap size={18} /> Mapa
            </Link>
            <Link href="/explore" className="btn-ghost flex items-center gap-2 !rounded-full">
              <FiSearch size={18} /> Explorar
            </Link>
            {user && (
              <Link href="/social" className="btn-ghost flex items-center gap-2 !rounded-full">
                <FiUsers size={18} /> Social
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('fiestapp:open-install'))}
              className="btn-ghost flex items-center gap-2 !rounded-full border !border-white/6 !px-3.5 text-sm"
            >
              <FiDownload size={16} /> Instalar
            </button>
            {user ? (
              <>
                <Link href="/create" className="btn-primary flex items-center gap-2 !py-2.5 !px-4 text-sm">
                  <FiPlus size={16} /> Crear Evento
                </Link>
                <Link href="/profile" className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-2 py-1.5 text-sm text-text-secondary transition-colors hover:text-text">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full bg-surface-2"
                  />
                  <span className="pr-2 font-medium">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="btn-ghost !rounded-full !px-3" title="Cerrar sesión">
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm">Iniciar sesión</Link>
                <Link href="/auth/register" className="btn-primary !py-2.5 !px-4 text-sm">Registrarse</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden rounded-full border border-white/8 bg-white/[0.06] px-3 py-2 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:bg-white/[0.1]">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-[calc(env(safe-area-inset-top)+74px)] z-[-1] bg-black/45 md:hidden"
          />
          <div className="md:hidden border-t border-white/8 bg-[rgba(7,9,13,0.94)] animate-fade-in backdrop-blur-3xl">
            <div className="page-container py-4 space-y-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
              <FiMap size={20} className="text-accent" /> <span>Mapa</span>
            </Link>
            <Link href="/explore" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
              <FiSearch size={20} className="text-accent" /> <span>Explorar</span>
            </Link>
            {user && (
              <Link href="/social" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                <FiUsers size={20} className="text-accent" /> <span>Social</span>
              </Link>
            )}
            <button onClick={() => { window.dispatchEvent(new CustomEvent('fiestapp:open-install')); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.04]">
              <FiDownload size={20} className="text-accent" /> <span>Instalar app</span>
            </button>
            <div className="border-t border-white/5 my-3" />
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                  <FiUser size={20} className="text-accent" /> <span>{user.name}</span>
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-danger transition-colors hover:bg-white/[0.04]">
                  <FiLogOut size={20} /> <span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                  <FiUser size={20} className="text-accent" /> <span>Iniciar sesión</span>
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="btn-primary mt-2 w-full text-center">
                  Registrarse
                </Link>
              </>
            )}
          </div>
          </div>
        </>
      )}
    </nav>
  );
}
