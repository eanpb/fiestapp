'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text mb-8 transition-colors">
          <FiArrowLeft size={18} /> Volver
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🎉</span>
          <h1 className="text-3xl font-black">Bienvenido</h1>
          <p className="text-text-secondary mt-2">Inicia sesión en FIESTAPP</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field !pl-11"
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field !pl-11 !pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base disabled:opacity-50">
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 card p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Demo: usa estas credenciales</p>
          <p className="text-sm font-mono text-text-secondary">demo@fiestapp.co / demo123</p>
        </div>

        {/* Register link */}
        <p className="text-center mt-6 text-text-secondary text-sm">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="text-accent font-semibold hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}
