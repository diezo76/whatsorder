'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const orderNumber = searchParams?.get('order');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icône d'échec */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement annulé
        </h1>

        {/* Numéro de commande */}
        {orderNumber && (
          <p className="text-gray-600 mb-6">
            Commande <span className="font-semibold text-red-600">#{orderNumber}</span>
          </p>
        )}

        {/* Message */}
        <div className="bg-amber-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            Le paiement a été annulé. Votre commande n'a pas été finalisée.
            Vous pouvez réessayer ou choisir un autre mode de paiement.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={`/${slug}`}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer la commande
          </Link>

          <Link
            href={`/${slug}`}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au menu
          </Link>
        </div>

        {/* Info supplémentaire */}
        <p className="text-xs text-gray-500 mt-6">
          Si vous avez des questions, n'hésitez pas à contacter le restaurant.
        </p>
      </div>
    </div>
  );
}
