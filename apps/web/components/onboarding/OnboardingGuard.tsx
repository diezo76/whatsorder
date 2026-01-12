'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const response = await api.get('/onboarding/check');
        const data = response.data;

        if (data.needsOnboarding) {
          router.push('/onboarding');
        } else {
          setChecking(false);
        }
      } catch (error) {
        // Si erreur, on laisse passer (peut-être pas encore connecté)
        console.error('Onboarding check error:', error);
        setChecking(false);
      }
    };

    checkOnboarding();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
