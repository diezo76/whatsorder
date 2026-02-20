'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  BarChart3,
  CreditCard,
  Smartphone,
  Columns3,
  TrendingUp,
  Bell,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface BentoCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
  children?: ReactNode;
}

function BentoCard({ icon, title, description, className = '', delay = 0, children }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className={`group relative rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-sm p-6 sm:p-8 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}

export default function BentoGrid() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Tout ce dont vous avez besoin.
            <br />
            <span className="text-gray-400">Rien de superflu.</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BentoCard
            icon={<Bot className="w-6 h-6 text-primary-600" />}
            title="IA WhatsApp"
            description="Comprehension naturelle en francais et arabe. L'IA analyse les messages et cree automatiquement les commandes."
            className="md:row-span-2"
            delay={0}
          >
            {/* Mini chat animation */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-end">
                <div className="bg-secondary-500 text-white text-xs px-3 py-2 rounded-xl rounded-br-sm max-w-[200px]">
                  Bonjour, je veux 2 pizzas margherita et 1 coca
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-xl rounded-bl-sm max-w-[220px]">
                  Commande creee ! 2x Pizza Margherita + 1x Coca-Cola. Total : 25.50€
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            icon={<BarChart3 className="w-6 h-6 text-primary-600" />}
            title="Dashboard Temps Reel"
            description="Toutes vos statistiques en un coup d'oeil. Revenus, commandes, clients — tout est la."
            delay={0.1}
          />

          <BentoCard
            icon={<CreditCard className="w-6 h-6 text-primary-600" />}
            title="Paiements Integres"
            description="Stripe, PayPal, especes. Encaissez en ligne ou sur place, comme vous voulez."
            delay={0.2}
          />

          <BentoCard
            icon={<Columns3 className="w-6 h-6 text-primary-600" />}
            title="Kanban Intuitif"
            description="Gerez vos commandes visuellement par drag & drop. En attente, Preparation, Livraison."
            className="md:col-span-2"
            delay={0.3}
          >
            {/* Mini kanban preview */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['En attente', 'Preparation', 'Livraison'].map((col, idx) => (
                <div key={col} className="space-y-2">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{col}</div>
                  {Array.from({ length: idx === 1 ? 2 : 1 }).map((_, j) => (
                    <div key={j} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <div className="h-1.5 w-12 bg-gray-200 rounded mb-1" />
                      <div className="h-1.5 w-8 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            icon={<Smartphone className="w-6 h-6 text-primary-600" />}
            title="Mobile-First"
            description="Application progressive (PWA). Fonctionne sur iPhone, Android et desktop."
            delay={0.4}
          />

          <BentoCard
            icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
            title="Analytics Avance"
            description="Prenez des decisions data-driven. Top plats, revenus, heures de pointe."
            delay={0.5}
          />

          <BentoCard
            icon={<Bell className="w-6 h-6 text-primary-600" />}
            title="Notifications Push"
            description="Soyez alerte instantanement a chaque nouvelle commande. Jamais de commande oubliee."
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}
