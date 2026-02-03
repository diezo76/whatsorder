'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, QrCode, ExternalLink, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsShareTabProps {
  restaurantSlug: string;
  restaurantName: string;
}

// Composant QR Code simple (sans dépendance externe)
function QRCodeSVG({ value, size = 200 }: { value: string; size?: number }) {
  // Utiliser une API publique pour générer le QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  
  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg border-2 border-gray-200">
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        className="w-full h-full"
        style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
      />
    </div>
  );
}

export default function SettingsShareTab({ restaurantSlug, restaurantName }: SettingsShareTabProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeSize, setQrCodeSize] = useState(200);

  // Construire l'URL publique
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'https://www.whataybo.com';
  
  const publicUrl = `${baseUrl}/${restaurantSlug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Lien copié dans le presse-papiers ! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Impossible de copier le lien');
    }
  };

  const shareLink = async () => {
    if (typeof window !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Commandez chez ${restaurantName}`,
          text: `Découvrez le menu de ${restaurantName} et commandez en ligne !`,
          url: publicUrl,
        });
        toast.success('Lien partagé ! 🎉');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast.error('Erreur lors du partage');
        }
      }
    } else {
      // Fallback : copier le lien
      copyToClipboard();
    }
  };

  const downloadQRCode = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrCodeSize * 2}x${qrCodeSize * 2}&data=${encodeURIComponent(publicUrl)}`;
    
    fetch(qrCodeUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-code-${restaurantSlug}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('QR Code téléchargé ! 📥');
      })
      .catch(() => {
        toast.error('Erreur lors du téléchargement');
      });
  };

  return (
    <div className="space-y-8">
      {/* Section : Lien Public */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Lien Public de Votre Restaurant</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de votre page de commande
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Copier le lien"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="text-sm">Copier</span>
                  </>
                )}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="text-sm">Ouvrir</span>
              </a>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Partagez ce lien avec vos clients pour qu'ils puissent voir votre menu et passer des commandes.
            </p>
          </div>

          {/* Bouton Partage Natif */}
          {typeof window !== 'undefined' && 'share' in navigator && (
            <button
              onClick={shareLink}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Partager via...</span>
            </button>
          )}
        </div>
      </div>

      {/* Section : QR Code */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Scannez ce QR code avec votre téléphone pour accéder directement à votre page de commande.
            Vous pouvez l'imprimer et l'afficher dans votre restaurant, sur vos menus, ou le partager sur les réseaux sociaux.
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <QRCodeSVG value={publicUrl} size={qrCodeSize} />
          </div>

          {/* Taille du QR Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille du QR Code
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="150"
                max="300"
                step="50"
                value={qrCodeSize}
                onChange={(e) => setQrCodeSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-20 text-right">{qrCodeSize}px</span>
            </div>
          </div>

          {/* Bouton Télécharger */}
          <button
            onClick={downloadQRCode}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Télécharger le QR Code</span>
          </button>
        </div>
      </div>

      {/* Section : Conseils */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils pour partager votre restaurant</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Ajoutez le QR code sur vos menus papier</li>
          <li>Partagez le lien sur vos réseaux sociaux</li>
          <li>Affichez le QR code à l'entrée de votre restaurant</li>
          <li>Incluez le lien dans vos emails marketing</li>
          <li>Ajoutez-le sur vos cartes de visite</li>
        </ul>
      </div>
    </div>
  );
}
