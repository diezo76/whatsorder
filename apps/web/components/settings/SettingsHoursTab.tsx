'use client';

import { useState, useEffect } from 'react';
import { Calendar, Copy, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OpeningHours {
  [day: string]: { open: string; close: string; closed: boolean };
}

interface SettingsHoursTabProps {
  openingHours: OpeningHours | null;
  onChange: (hours: OpeningHours) => void;
}

const DAYS = [
  { key: 'monday', label: 'Lundi', labelAr: 'الاثنين' },
  { key: 'tuesday', label: 'Mardi', labelAr: 'الثلاثاء' },
  { key: 'wednesday', label: 'Mercredi', labelAr: 'الأربعاء' },
  { key: 'thursday', label: 'Jeudi', labelAr: 'الخميس' },
  { key: 'friday', label: 'Vendredi', labelAr: 'الجمعة' },
  { key: 'saturday', label: 'Samedi', labelAr: 'السبت' },
  { key: 'sunday', label: 'Dimanche', labelAr: 'الأحد' },
];

// Valeurs par défaut
const getDefaultHours = (): OpeningHours => {
  return {
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '22:00', closed: false },
    saturday: { open: '09:00', close: '22:00', closed: false },
    sunday: { open: '10:00', close: '20:00', closed: false },
  };
};

export default function SettingsHoursTab({ openingHours, onChange }: SettingsHoursTabProps) {
  const [localHours, setLocalHours] = useState<OpeningHours>(() => {
    if (openingHours && Object.keys(openingHours).length > 0) {
      return openingHours;
    }
    return getDefaultHours();
  });

  // Synchroniser avec les props si elles changent
  useEffect(() => {
    if (openingHours && Object.keys(openingHours).length > 0) {
      setLocalHours(openingHours);
    } else {
      setLocalHours(getDefaultHours());
    }
  }, [openingHours]);

  const handleDayChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const newHours = {
      ...localHours,
      [day]: {
        ...localHours[day],
        [field]: value,
      },
    };

    setLocalHours(newHours);
    onChange(newHours);
  };

  const handleCopyToAll = (sourceDay: string) => {
    const sourceHours = localHours[sourceDay];
    if (!sourceHours) return;

    if (window.confirm(`Appliquer ces horaires (${sourceHours.open} - ${sourceHours.close}) à toute la semaine ?`)) {
      const newHours: OpeningHours = { ...localHours };
      
      DAYS.forEach((day) => {
        newHours[day.key] = {
          open: sourceHours.open,
          close: sourceHours.close,
          closed: sourceHours.closed,
        };
      });

      setLocalHours(newHours);
      onChange(newHours);
      toast.success('Horaires copiés à toute la semaine ✅');
    }
  };

  const validateHours = (_day: string, open: string, close: string): boolean => {
    if (!open || !close) return true; // Vide est valide si fermé
    const openTime = new Date(`2000-01-01T${open}:00`);
    const closeTime = new Date(`2000-01-01T${close}:00`);
    return closeTime > openTime;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Horaires d'ouverture</h2>
        <p className="text-gray-600 text-sm">
          Configurez vos horaires pour chaque jour de la semaine
        </p>
      </div>

      {/* Desktop : Tableau */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Jour</th>
              <th className="p-3 text-center font-semibold text-gray-700 border-b">Fermé</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Ouverture</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Fermeture</th>
              <th className="p-3 text-center font-semibold text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const dayHours = localHours[day.key] || { open: '09:00', close: '22:00', closed: false };
              const isValid = validateHours(day.key, dayHours.open, dayHours.close);
              const isDisabled = dayHours.closed;

              return (
                <tr key={day.key} className="border-b hover:bg-gray-50 transition-colors">
                  {/* Jour */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{day.label}</span>
                    </div>
                  </td>

                  {/* Toggle Fermé */}
                  <td className="p-3 text-center">
                    <label className="flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayHours.closed}
                        onChange={(e) => handleDayChange(day.key, 'closed', e.target.checked)}
                        className="w-5 h-5 accent-orange-600 cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">Fermé</span>
                    </label>
                  </td>

                  {/* Heure d'ouverture */}
                  <td className="p-3">
                    <input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => handleDayChange(day.key, 'open', e.target.value)}
                      disabled={isDisabled}
                      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-colors ${
                        isDisabled
                          ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                          : isValid
                          ? 'border-gray-300 focus:ring-orange-500'
                          : 'border-red-500 focus:ring-red-500'
                      }`}
                    />
                  </td>

                  {/* Heure de fermeture */}
                  <td className="p-3">
                    <div>
                      <input
                        type="time"
                        value={dayHours.close}
                        onChange={(e) => handleDayChange(day.key, 'close', e.target.value)}
                        disabled={isDisabled}
                        className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-colors ${
                          isDisabled
                            ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                            : isValid
                            ? 'border-gray-300 focus:ring-orange-500'
                            : 'border-red-500 focus:ring-red-500'
                        }`}
                      />
                      {!isValid && !isDisabled && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>L'heure de fermeture doit être après l'ouverture</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Bouton Copier */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleCopyToAll(day.key)}
                      disabled={isDisabled}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copier ces horaires à tous les jours"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile : Cards empilées */}
      <div className="md:hidden space-y-4">
        {DAYS.map((day) => {
          const dayHours = localHours[day.key] || { open: '09:00', close: '22:00', closed: false };
          const isValid = validateHours(day.key, dayHours.open, dayHours.close);
          const isDisabled = dayHours.closed;

          return (
            <div
              key={day.key}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
            >
              {/* En-tête du jour */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">{day.label}</h3>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dayHours.closed}
                    onChange={(e) => handleDayChange(day.key, 'closed', e.target.checked)}
                    className="w-5 h-5 accent-orange-600 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">Fermé</span>
                </label>
              </div>

              {/* Horaires */}
              {!isDisabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ouverture
                    </label>
                    <input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => handleDayChange(day.key, 'open', e.target.value)}
                      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-colors ${
                        isValid ? 'border-gray-300 focus:ring-orange-500' : 'border-red-500 focus:ring-red-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fermeture
                    </label>
                    <input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => handleDayChange(day.key, 'close', e.target.value)}
                      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 transition-colors ${
                        isValid ? 'border-gray-300 focus:ring-orange-500' : 'border-red-500 focus:ring-red-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Message d'erreur */}
              {!isValid && !isDisabled && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    L'heure de fermeture doit être après l'ouverture
                  </span>
                </div>
              )}

              {/* Bouton Copier */}
              {!isDisabled && (
                <button
                  onClick={() => handleCopyToAll(day.key)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-gray-200"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copier à tous les jours</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
