'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, Clock } from 'lucide-react';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [pendingApproval, setPendingApproval] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const response = await api.get('/onboarding/check');
        const data = response.data;

        if (data.needsOnboarding) {
          router.push('/onboarding');
        } else if (data.isApproved === false) {
          setPendingApproval(true);
          setChecking(false);
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

  if (pendingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            En attente de validation
          </h1>
          <p className="text-gray-600 mb-6">
            Votre restaurant est en cours de verification par notre equipe. 
            Vous recevrez un acces complet une fois votre compte approuve.
          </p>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              Ce processus prend generalement moins de 24 heures. 
              Merci de votre patience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
