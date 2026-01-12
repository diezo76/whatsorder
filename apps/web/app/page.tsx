'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [loading, isAuthenticated, router]);

  // Afficher un message de chargement pendant la vérification
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">WhatsOrder Clone</h1>
      <p className="mt-4 text-lg">Système de Commande Restaurant WhatsApp</p>
      <p className="mt-4 text-sm text-gray-500">Redirection en cours...</p>
    </main>
  );
}
