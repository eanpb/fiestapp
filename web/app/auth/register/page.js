'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiAtSign } from 'react-icons/fi';

function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await register(form);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text mb-8 transition-colors">
          <FiArrowLeft size={18} /> Volver
        </Link>

        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🚀</span>
          <h1 className="text-3xl font-black">Crear cuenta</h1>
          <p className="text-text-secondary mt-2">Únete a FIESTAPP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input type="text" placeholder="Nombre completo" value={form.name} onChange={update('name')} className="input-field !pl-11" required />
          </div>

          <div className="relative">
            <FiAtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input type="text" placeholder="Username" value={form.username} onChange={update('username')} className="input-field !pl-11" required />
          </div>

          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input type="email" placeholder="Email" value={form.email} onChange={update('email')} className="input-field !pl-11" required />
          </div>

          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña (mín. 6 chars)"
              value={form.password}
              onChange={update('password')}
              className="input-field !pl-11 !pr-11"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center mt-6 text-text-secondary text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-accent font-semibold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>
  );
}
