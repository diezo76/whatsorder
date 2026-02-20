'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-4 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-[128px]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-accent-200/20 rounded-full blur-[128px]" />
        <div className="absolute -bottom-32 left-1/2 w-[700px] h-[400px] bg-secondary-200/20 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto max-w-5xl">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={item} className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-sm font-medium text-primary-700">
            <Sparkles className="w-4 h-4" />
            Nouveau : IA Claude integree
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={item}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.08]"
          >
            Gerez votre restaurant{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 bg-clip-text text-transparent">
              avec l&apos;IA WhatsApp
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed"
          >
            Transformez vos messages WhatsApp en commandes automatiquement.
            Gagnez 5h par jour. Zero formation necessaire.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-primary-500/25 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Essai Gratuit 14 Jours
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              Voir la Demo
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-secondary-500" /> Aucune carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-secondary-500" /> 2 min setup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-secondary-500" /> Support 24/7
            </span>
          </motion.div>

          {/* Mockup */}
          <motion.div
            variants={item}
            className="mt-16 relative mx-auto max-w-4xl"
          >
            <div className="relative rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-400 border border-gray-200">
                    app.whataybo.com/dashboard
                  </div>
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 p-8 w-full max-w-3xl">
                  {/* Mini Kanban preview */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">En attente</div>
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="h-2 w-20 bg-accent-200 rounded mb-2" />
                        <div className="h-2 w-14 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preparation</div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-primary-100">
                        <div className="h-2 w-16 bg-primary-200 rounded mb-2" />
                        <div className="h-2 w-12 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Livraison</div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-secondary-100">
                      <div className="h-2 w-18 bg-secondary-200 rounded mb-2" />
                      <div className="h-2 w-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow underneath */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-primary-400/10 rounded-full blur-2xl" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
