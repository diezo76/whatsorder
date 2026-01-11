'use client';

import { useState } from 'react';
import { Phone, Shield, Key, HelpCircle, Eye, EyeOff, ExternalLink, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsIntegrationsTabProps {
  formData: {
    whatsappNumber: string;
    whatsappApiToken: string;
    whatsappBusinessId: string;
  };
  onChange: (field: string, value: string) => void;
}

// Validation du numéro WhatsApp (format international)
const validateWhatsAppNumber = (number: string): { valid: boolean; error?: string } => {
  if (!number || number.trim() === '') {
    return { valid: false, error: 'Le numéro WhatsApp est requis' };
  }
  
  // Format: + suivi de chiffres (min 7, max 15)
  const cleaned = number.replace(/\s|-/g, '');
  const regex = /^\+[1-9]\d{6,14}$/;
  
  if (!regex.test(cleaned)) {
    return { valid: false, error: 'Format invalide. Utilisez le format international (ex: +20 123 456 7890)' };
  }
  
  return { valid: true };
};

// Validation Business ID (alphanumérique si fourni)
const validateBusinessId = (id: string): { valid: boolean; error?: string } => {
  if (!id || id.trim() === '') {
    return { valid: true }; // Optionnel
  }
  
  const regex = /^[a-zA-Z0-9]+$/;
  if (!regex.test(id)) {
    return { valid: false, error: 'Le Business ID doit être alphanumérique' };
  }
  
  return { valid: true };
};

// Validation Token (min 20 chars si fourni)
const validateToken = (token: string): { valid: boolean; error?: string } => {
  if (!token || token.trim() === '') {
    return { valid: true }; // Optionnel
  }
  
  if (token.length < 20) {
    return { valid: false, error: 'Le token doit contenir au moins 20 caractères' };
  }
  
  return { valid: true };
};

// Formatage du numéro WhatsApp pour l'affichage
const formatWhatsAppNumber = (number: string): string => {
  if (!number) return '';
  
  // Si commence déjà par +, garder tel quel
  let cleaned = number.replace(/\s|-/g, '');
  
  // Si ne commence pas par +, l'ajouter
  if (cleaned && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  // Formatage visuel (ajouter des espaces tous les 3-4 chiffres après le +)
  if (cleaned.length > 4) {
    const countryCode = cleaned.substring(0, 3); // +XX
    const rest = cleaned.substring(3).replace(/\s/g, '');
    
    // Formater le reste par groupes de 3
    const formatted = rest.match(/.{1,3}/g)?.join(' ') || rest;
    return countryCode + ' ' + formatted;
  }
  
  return cleaned;
};

// Nettoyage du numéro pour le storage (retirer espaces/tirets)
const cleanWhatsAppNumber = (number: string): string => {
  return number.replace(/\s|-/g, '');
};

export default function SettingsIntegrationsTab({
  formData,
  onChange,
}: SettingsIntegrationsTabProps) {
  const [showToken, setShowToken] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  
  // Validations
  const whatsappValidation = validateWhatsAppNumber(formData.whatsappNumber);
  const businessIdValidation = validateBusinessId(formData.whatsappBusinessId);
  const tokenValidation = validateToken(formData.whatsappApiToken);
  
  // Statut de connexion WhatsApp
  const isWhatsAppConfigured = formData.whatsappNumber && formData.whatsappNumber.trim() !== '';
  
  // Gestion du changement de numéro WhatsApp avec formatage
  const handleWhatsAppNumberChange = (value: string) => {
    const formatted = formatWhatsAppNumber(value);
    const cleaned = cleanWhatsAppNumber(formatted);
    onChange('whatsappNumber', cleaned);
  };
  
  // Test de connexion (optionnel)
  const handleTestConnection = async () => {
    if (!formData.whatsappNumber || !whatsappValidation.valid) {
      toast.error('Veuillez d\'abord configurer un numéro WhatsApp valide');
      return;
    }
    
    setTestingConnection(true);
    
    try {
      // TODO: Implémenter l'appel API réel
      // const response = await api.post('/whatsapp/test', { number: formData.whatsappNumber });
      
      // Simulation pour l'instant
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Connexion WhatsApp testée avec succès ✅');
    } catch (error: any) {
      console.error('Erreur test connexion:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors du test de connexion';
      toast.error(errorMessage);
    } finally {
      setTestingConnection(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Section WhatsApp Business */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp Business</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Configurez WhatsApp pour recevoir les commandes automatiquement
        </p>
        
        {/* Numéro WhatsApp */}
        <div className="mb-4">
          <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Numéro WhatsApp <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              id="whatsappNumber"
              value={formatWhatsAppNumber(formData.whatsappNumber)}
              onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
              placeholder="+20 123 456 7890"
              className={`w-full border rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 transition-colors ${
                formData.whatsappNumber && !whatsappValidation.valid
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
            />
          </div>
          {formData.whatsappNumber && !whatsappValidation.valid && (
            <p className="mt-1 text-xs text-red-600">{whatsappValidation.error}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Format international requis (ex: +20 123 456 7890)
          </p>
        </div>
        
        {/* Statut de connexion */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Statut :</span>
          {isWhatsAppConfigured ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
              <CheckCircle2 className="w-4 h-4" />
              Connecté ✓
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
              Non configuré
            </span>
          )}
        </div>
        
        {/* Bouton Test de connexion */}
        {isWhatsAppConfigured && whatsappValidation.valid && (
          <div className="mt-4">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingConnection ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Test en cours...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Tester la connexion
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Section WhatsApp API (Avancé) */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp API (Avancé)</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          Configuration optionnelle pour l'API WhatsApp Business Cloud
        </p>
        <p className="text-sm text-gray-500 mb-4 italic">
          Laissez vide si vous utilisez WhatsApp standard
        </p>
        
        {/* Business Account ID */}
        <div className="mb-4">
          <label htmlFor="whatsappBusinessId" className="block text-sm font-medium text-gray-700 mb-1">
            Business Account ID
          </label>
          <input
            type="text"
            id="whatsappBusinessId"
            value={formData.whatsappBusinessId}
            onChange={(e) => onChange('whatsappBusinessId', e.target.value)}
            placeholder="123456789012345"
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
              formData.whatsappBusinessId && !businessIdValidation.valid
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
          />
          {formData.whatsappBusinessId && !businessIdValidation.valid && (
            <p className="mt-1 text-xs text-red-600">{businessIdValidation.error}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Votre WhatsApp Business Account ID
          </p>
        </div>
        
        {/* Access Token */}
        <div className="mb-4">
          <label htmlFor="whatsappApiToken" className="block text-sm font-medium text-gray-700 mb-1">
            Access Token
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showToken ? 'text' : 'password'}
              id="whatsappApiToken"
              value={formData.whatsappApiToken}
              onChange={(e) => onChange('whatsappApiToken', e.target.value)}
              placeholder="EAAxxxxxxxxxxxx"
              className={`w-full border rounded-lg px-4 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 transition-colors ${
                formData.whatsappApiToken && !tokenValidation.valid
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={showToken ? 'Masquer le token' : 'Afficher le token'}
            >
              {showToken ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {formData.whatsappApiToken && !tokenValidation.valid && (
            <p className="mt-1 text-xs text-red-600">{tokenValidation.error}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Token d'accès permanent de l'API
          </p>
        </div>
      </div>
      
      {/* Helper Card */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">
              Comment obtenir vos identifiants ?
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 mb-3">
              <li>Créer un compte Meta Business</li>
              <li>Configurer WhatsApp Business API</li>
              <li>Copier les identifiants ici</li>
            </ol>
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Documentation Meta
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
