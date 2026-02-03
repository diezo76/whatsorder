'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Building2, Phone, Mail, MapPin, Globe, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const onboardingSchema = z.object({
  restaurantName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  currency: z.string(),
  timezone: z.string(),
  language: z.string(),
  createSampleMenu: z.boolean(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const steps = [
  { id: 1, title: 'Informations de base', icon: Building2 },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'Configuration', icon: Globe },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      language: 'ar',
      createSampleMenu: true,
    },
  });

  const createSampleMenu = watch('createSampleMenu');

  const onSubmit = async (data: OnboardingFormData) => {
    // Vérifier qu'on est bien à la dernière étape
    if (currentStep !== steps.length) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post('/onboarding/quick-setup', {
        restaurantName: data.restaurantName,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        currency: data.currency,
        timezone: data.timezone,
        language: data.language,
        createSampleMenu: data.createSampleMenu,
      });

      if (response.data.success) {
        setCompleted(true);
        toast.success('Restaurant configuré avec succès ! 🎉');
        
        // Rediriger vers le dashboard après 2 secondes
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Configuration terminée ! 🎉
            </h2>
            <p className="text-gray-600">
              Votre restaurant est maintenant en ligne. Vous allez être redirigé vers le tableau de bord...
            </p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration rapide de votre restaurant
          </h1>
          <p className="text-gray-600">
            Quelques informations pour mettre votre restaurant en ligne rapidement
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-orange-600 border-orange-600 text-white'
                          : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-orange-600' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du restaurant <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('restaurantName')}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: Restaurant El Fattah"
                />
                {errors.restaurantName && (
                  <p className="mt-1 text-sm text-red-600">{errors.restaurantName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+20 123 456 7890"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optionnel)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="contact@restaurant.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse (optionnel)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('address')}
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="123 Rue Example, Ville, Pays"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    {...register('currency')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="EGP">EGP - Livre égyptienne</option>
                    <option value="USD">USD - Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuseau horaire
                  </label>
                  <select
                    {...register('timezone')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Africa/Cairo">Égypte (Cairo)</option>
                    <option value="Europe/Paris">France (Paris)</option>
                    <option value="Europe/London">Royaume-Uni (London)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <select
                    {...register('language')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ar">العربية (Arabe)</option>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    {...register('createSampleMenu')}
                    type="checkbox"
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Créer un menu d'exemple avec quelques catégories et plats
                    <br />
                    <span className="text-gray-500">
                      Vous pourrez modifier ou supprimer ces éléments plus tard
                    </span>
                  </span>
                </label>
              </div>

              {createSampleMenu && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✅ Un menu d'exemple sera créé avec :
                  </p>
                  <ul className="mt-2 text-sm text-green-700 list-disc list-inside space-y-1">
                    <li>3 catégories (Entrées, Plats principaux, Boissons)</li>
                    <li>6 plats d'exemple</li>
                    <li>Horaires d'ouverture par défaut</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Précédent
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all"
              >
                Suivant
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(onSubmit)()}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Configuration en cours...
                  </>
                ) : (
                  'Mettre en ligne maintenant 🚀'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Astuce :</strong> Vous pourrez modifier toutes ces informations plus tard dans les paramètres.
            L'objectif est de mettre votre restaurant en ligne rapidement !
          </p>
        </div>
      </div>
    </div>
  );
}
