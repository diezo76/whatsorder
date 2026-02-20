'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-400/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto max-w-3xl text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Pret a automatiser
            <br />
            votre restaurant ?
          </h2>
          <p className="text-lg text-primary-200 mb-10 max-w-xl mx-auto">
            Rejoignez 500+ restaurateurs qui ont fait le choix de l&apos;IA.
          </p>

          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Commencer Gratuitement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-primary-200">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> 14 jours gratuits
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Support francais 24/7
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
