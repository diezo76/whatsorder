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
            Propulse par Whataybo
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
              href="https://wa.me/201276921081"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-xl font-semibold text-lg hover:bg-[#1fb855] transition-all duration-300 shadow-lg shadow-[#25D366]/20 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contactez-nous
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
