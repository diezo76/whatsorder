'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface StripeStatus {
  connected: boolean;
  accountId?: string;
  status?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  canAcceptPayments?: boolean;
  email?: string;
  businessName?: string;
}

interface PayPalStatus {
  connected: boolean;
  merchantId?: string;
  email?: string;
  canAcceptPayments?: boolean;
  connectedAt?: string;
}

interface PaymentOptions {
  enableCashPayment: boolean;
  enableCardPayment: boolean;
  enableStripePayment: boolean;
  enablePaypalPayment: boolean;
}

export default function SettingsPaymentsTab() {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [paypalStatus, setPayPalStatus] = useState<PayPalStatus | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions>({
    enableCashPayment: true,
    enableCardPayment: true,
    enableStripePayment: false,
    enablePaypalPayment: false,
  });
  const [loading, setLoading] = useState(true);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [connectingPaypal, setConnectingPaypal] = useState(false);

  // Charger les statuts au mount
  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      
      // Charger les statuts en parallèle
      const [stripeRes, paypalRes, restaurantRes] = await Promise.all([
        api.get('/connect/stripe/status').catch(() => ({ data: { connected: false } })),
        api.get('/connect/paypal/status').catch(() => ({ data: { connected: false } })),
        api.get('/restaurant').catch(() => null),
      ]);

      setStripeStatus(stripeRes.data);
      setPayPalStatus(paypalRes.data);
      
      if (restaurantRes?.data?.restaurant) {
        const r = restaurantRes.data.restaurant;
        setPaymentOptions({
          enableCashPayment: r.enableCashPayment ?? true,
          enableCardPayment: r.enableCardPayment ?? true,
          enableStripePayment: r.enableStripePayment ?? false,
          enablePaypalPayment: r.enablePaypalPayment ?? false,
        });
      }
    } catch (error) {
      console.error('Erreur chargement statuts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Connecter Stripe
  const handleConnectStripe = async () => {
    try {
      setConnectingStripe(true);
      const response = await api.post('/connect/stripe/onboard');
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error('Erreur connexion Stripe:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la connexion Stripe');
      setConnectingStripe(false);
    }
  };

  // Déconnecter Stripe
  const handleDisconnectStripe = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte Stripe ? Vos clients ne pourront plus payer par carte en ligne.')) {
      return;
    }

    try {
      await api.post('/connect/stripe/disconnect');
      toast.success('Compte Stripe déconnecté');
      await loadStatuses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la déconnexion');
    }
  };

  // Connecter PayPal
  const handleConnectPaypal = async () => {
    try {
      setConnectingPaypal(true);
      const response = await api.post('/connect/paypal/onboard');
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error('Erreur connexion PayPal:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la connexion PayPal');
      setConnectingPaypal(false);
    }
  };

  // Déconnecter PayPal
  const handleDisconnectPaypal = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte PayPal ?')) {
      return;
    }

    try {
      await api.post('/connect/paypal/disconnect');
      toast.success('Compte PayPal déconnecté');
      await loadStatuses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la déconnexion');
    }
  };

  // Toggle une option de paiement
  const handleTogglePaymentOption = async (option: keyof PaymentOptions) => {
    try {
      const newValue = !paymentOptions[option];
      
      // Vérifier que Stripe/PayPal est connecté avant d'activer
      if (option === 'enableStripePayment' && newValue && !stripeStatus?.canAcceptPayments) {
        toast.error('Connectez d\'abord votre compte Stripe');
        return;
      }
      if (option === 'enablePaypalPayment' && newValue && !paypalStatus?.canAcceptPayments) {
        toast.error('Connectez d\'abord votre compte PayPal');
        return;
      }

      await api.put('/restaurant', { [option]: newValue });
      setPaymentOptions(prev => ({ ...prev, [option]: newValue }));
      toast.success('Option mise à jour');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Titre */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration des paiements</h2>
        <p className="text-gray-600">
          Connectez vos comptes de paiement pour recevoir des paiements en ligne de vos clients.
        </p>
      </div>

      {/* Options de paiement à la livraison */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💵 Paiement à la livraison</h3>
        
        <div className="space-y-4">
          {/* Espèces */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Paiement en espèces</p>
              <p className="text-sm text-gray-500">Les clients peuvent payer en espèces à la livraison</p>
            </div>
            <button
              onClick={() => handleTogglePaymentOption('enableCashPayment')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                paymentOptions.enableCashPayment ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  paymentOptions.enableCashPayment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Carte TPE */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Paiement par carte (TPE)</p>
              <p className="text-sm text-gray-500">Les clients peuvent payer par carte à la livraison</p>
            </div>
            <button
              onClick={() => handleTogglePaymentOption('enableCardPayment')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                paymentOptions.enableCardPayment ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  paymentOptions.enableCardPayment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stripe Connect */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Stripe</h3>
              <p className="text-sm text-gray-500">Paiement par carte bancaire en ligne</p>
            </div>
          </div>

          {/* Statut */}
          {stripeStatus?.connected ? (
            <div className="flex items-center gap-2">
              {stripeStatus.canAcceptPayments ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Connecté
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  En attente de vérification
                </span>
              )}
            </div>
          ) : (
            <span className="flex items-center gap-1 text-gray-400 text-sm">
              <XCircle className="w-4 h-4" />
              Non connecté
            </span>
          )}
        </div>

        {/* Détails du compte Stripe */}
        {stripeStatus?.connected && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{stripeStatus.email || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Entreprise</p>
                <p className="font-medium text-gray-900">{stripeStatus.businessName || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Peut recevoir des paiements</p>
                <p className="font-medium text-gray-900">{stripeStatus.chargesEnabled ? 'Oui ✅' : 'Non ❌'}</p>
              </div>
              <div>
                <p className="text-gray-500">Peut recevoir des virements</p>
                <p className="font-medium text-gray-900">{stripeStatus.payoutsEnabled ? 'Oui ✅' : 'Non ❌'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle pour activer Stripe */}
        {stripeStatus?.canAcceptPayments && (
          <div className="flex items-center justify-between mb-4 p-3 bg-indigo-50 rounded-lg">
            <div>
              <p className="font-medium text-indigo-900">Activer les paiements Stripe</p>
              <p className="text-sm text-indigo-700">Les clients pourront payer par carte en ligne</p>
            </div>
            <button
              onClick={() => handleTogglePaymentOption('enableStripePayment')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                paymentOptions.enableStripePayment ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  paymentOptions.enableStripePayment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3">
          {!stripeStatus?.connected ? (
            <button
              onClick={handleConnectStripe}
              disabled={connectingStripe}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {connectingStripe ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Connecter Stripe
            </button>
          ) : (
            <>
              <button
                onClick={handleConnectStripe}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Compléter la configuration
              </button>
              <button
                onClick={handleDisconnectStripe}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Déconnecter
              </button>
            </>
          )}
        </div>
      </div>

      {/* PayPal */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PayPal</h3>
              <p className="text-sm text-gray-500">Paiement via compte PayPal</p>
            </div>
          </div>

          {/* Statut */}
          {paypalStatus?.connected ? (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Connecté
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400 text-sm">
              <XCircle className="w-4 h-4" />
              Non connecté
            </span>
          )}
        </div>

        {/* Détails du compte PayPal */}
        {paypalStatus?.connected && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Merchant ID</p>
                <p className="font-medium text-gray-900">{paypalStatus.merchantId || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Connecté le</p>
                <p className="font-medium text-gray-900">
                  {paypalStatus.connectedAt 
                    ? new Date(paypalStatus.connectedAt).toLocaleDateString('fr-FR')
                    : '-'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle pour activer PayPal */}
        {paypalStatus?.canAcceptPayments && (
          <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-blue-900">Activer les paiements PayPal</p>
              <p className="text-sm text-blue-700">Les clients pourront payer avec leur compte PayPal</p>
            </div>
            <button
              onClick={() => handleTogglePaymentOption('enablePaypalPayment')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                paymentOptions.enablePaypalPayment ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  paymentOptions.enablePaypalPayment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3">
          {!paypalStatus?.connected ? (
            <button
              onClick={handleConnectPaypal}
              disabled={connectingPaypal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {connectingPaypal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Connecter PayPal
            </button>
          ) : (
            <button
              onClick={handleDisconnectPaypal}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Déconnecter
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Comment ça marche ?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Connectez votre compte Stripe et/ou PayPal</li>
          <li>2. Activez les méthodes de paiement souhaitées</li>
          <li>3. Vos clients pourront choisir leur mode de paiement préféré</li>
          <li>4. Les paiements sont versés directement sur votre compte</li>
        </ul>
      </div>
    </div>
  );
}
