'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si deja connecte, rediriger
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Erreur de connexion');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_token', data.token);
      router.push('/admin/dashboard');
    } catch {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Whataybo Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
