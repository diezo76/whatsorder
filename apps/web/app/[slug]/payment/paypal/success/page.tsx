'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PayPalSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const slug = params?.slug as string;
  const orderNumber = searchParams?.get('order');
  const orderId = searchParams?.get('orderId');
  const paypalToken = searchParams?.get('token'); // PayPal renvoie le token de la commande
  
  const [status, setStatus] = useState<'capturing' | 'success' | 'error'>('capturing');
  const [errorMessage, setErrorMessage] = useState('');

  // Capturer le paiement PayPal
  useEffect(() => {
    const capturePayment = async () => {
      if (!paypalToken || !orderId) {
        setStatus('error');
        setErrorMessage('Informations de paiement manquantes');
        return;
      }

      try {
        const response = await fetch('/api/payments/paypal/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paypalOrderId: paypalToken,
            orderId,
            orderNumber,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          // Rediriger vers la page de succès après un court délai
          setTimeout(() => {
            router.push(`/${slug}/payment/success?order=${orderNumber}`);
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Erreur lors de la capture du paiement');
        }
      } catch (error: any) {
        console.error('Erreur capture PayPal:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Erreur lors de la capture du paiement');
      }
    };

    capturePayment();
  }, [paypalToken, orderId, orderNumber, slug, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* État: Capture en cours */}
        {status === 'capturing' && (
          <>
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Finalisation du paiement...
            </h1>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous confirmons votre paiement PayPal.
            </p>
          </>
        )}

        {/* État: Succès */}
        {status === 'success' && (
          <>
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement confirmé !
            </h1>
            {orderNumber && (
              <p className="text-gray-600 mb-4">
                Commande <span className="font-semibold text-green-600">#{orderNumber}</span>
              </p>
            )}
            <p className="text-sm text-gray-500">
              Redirection en cours...
            </p>
          </>
        )}

        {/* État: Erreur */}
        {status === 'error' && (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erreur de paiement
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link
                href={`/${slug}`}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Réessayer la commande
              </Link>
              <Link
                href={`/${slug}`}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Retour au menu
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
