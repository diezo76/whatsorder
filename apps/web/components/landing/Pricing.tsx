'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 23,
    features: [
      '100 commandes / mois',
      '1 restaurant',
      'IA basique',
      'Support email',
      'Dashboard analytics',
    ],
    cta: 'Essai 14 jours',
    href: '/register',
    popular: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 79,
    yearlyPrice: 63,
    features: [
      'Commandes illimitees',
      'Jusqu\'a 3 restaurants',
      'IA avancee',
      'Support prioritaire',
      'Analytics avance',
      'Paiements integres',
    ],
    cta: 'Essai 14 jours',
    href: '/register',
    popular: true,
  },
  {
    name: 'Entreprise',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Commandes illimitees',
      'Restaurants illimites',
      'IA personnalisee',
      'Support dedie',
      'API & Webhooks',
      'SLA garanti',
    ],
    cta: 'Nous contacter',
    href: 'mailto:contact@whataybo.com',
    popular: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Un tarif simple.
            <br />
            <span className="text-gray-400">Pas de frais caches.</span>
          </h2>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-14"
        >
          <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>Mensuel</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-primary-600' : 'bg-gray-300'}`}
            aria-label="Basculer entre mensuel et annuel"
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${annual ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
            Annuel
            <span className="ml-1.5 text-xs font-semibold text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full">-20%</span>
          </span>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/20 ring-1 ring-gray-800'
                  : 'bg-white border border-gray-200 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Zap className="w-3 h-3" /> Populaire
                  </span>
                </div>
              )}

              <h3 className={`text-lg font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>

              <div className="mb-6">
                {plan.monthlyPrice ? (
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {annual ? plan.yearlyPrice : plan.monthlyPrice}€
                    </span>
                    <span className={`text-sm ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>/mois</span>
                  </div>
                ) : (
                  <div className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    Sur mesure
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-primary-400' : 'text-secondary-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-400"
        >
          <span>Aucun frais de transaction</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>Annulation en 1 clic</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>Toutes les fonctionnalites incluses</span>
        </motion.div>
      </div>
    </section>
  );
}
