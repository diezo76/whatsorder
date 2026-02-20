'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, MessageCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const orderNumber = searchParams?.get('order');
  const sessionId = searchParams?.get('session_id');
  
  const [isVerifying, setIsVerifying] = useState(!!sessionId);
  const [verificationComplete, setVerificationComplete] = useState(!sessionId);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');

  // Récupérer les données du restaurant (numéro WhatsApp)
  useEffect(() => {
    if (!slug) return;
    
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`/api/public/restaurants/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setWhatsappNumber(data.whatsappNumber || null);
          setRestaurantName(data.name || '');
        }
      } catch {
        // Silently fail - WhatsApp button just won't show
      }
    };

    fetchRestaurant();
  }, [slug]);

  // Vérifier le paiement Stripe si on a un session_id
  useEffect(() => {
    if (sessionId) {
      // Le webhook Stripe gère la mise à jour du paiement
      // On attend juste un court moment pour que le webhook soit traité
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setVerificationComplete(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [sessionId]);

  // Construire l'URL WhatsApp avec le numéro du restaurant
  const getWhatsAppUrl = () => {
    if (!whatsappNumber) return null;
    const phone = whatsappNumber.replace(/[^0-9+]/g, '');
    const message = `Bonjour${restaurantName ? ` ${restaurantName}` : ''}, je viens de passer la commande #${orderNumber}. Le paiement a été effectué en ligne.`;
    return `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
  };

  const whatsappUrl = getWhatsAppUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icône de succès */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          {isVerifying ? (
            <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
          ) : (
            <CheckCircle className="w-12 h-12 text-green-600" />
          )}
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isVerifying ? 'Vérification en cours...' : 'Paiement réussi !'}
        </h1>

        {/* Numéro de commande */}
        {orderNumber && (
          <p className="text-gray-600 mb-6">
            Commande <span className="font-semibold text-green-600">#{orderNumber}</span>
          </p>
        )}

        {/* Message */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            {isVerifying 
              ? 'Nous vérifions votre paiement...'
              : '✅ Votre paiement a été traité avec succès. Votre commande est confirmée et en cours de préparation.'
            }
          </p>
        </div>

        {/* Actions */}
        {verificationComplete && (
          <div className="space-y-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Envoyer la commande sur WhatsApp
              </a>
            )}

            <Link
              href={`/${slug}`}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Retour au menu
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Loader pendant la vérification */}
        {isVerifying && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
