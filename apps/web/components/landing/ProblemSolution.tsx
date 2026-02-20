'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const beforeItems = [
  'Appels manques pendant le rush',
  'Erreurs de prise de commande',
  'Clients qui raccrochent',
  'Stress de l\'equipe',
  'Perte de chiffre d\'affaires',
];

const afterItems = [
  'WhatsApp toujours disponible',
  'L\'IA comprend et cree la commande',
  'Clients satisfaits 24h/24',
  'Equipe concentree sur la cuisine',
  '+30% de commandes en moyenne',
];

export default function ProblemSolution() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Marre de perdre des commandes{' '}
            <br className="hidden sm:block" />
            a cause d&apos;un telephone qui sonne ?
          </h2>
        </motion.div>

        {/* Before / After Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* BEFORE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-red-100 bg-red-50/50 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-900">Avant Whataybo</h3>
            </div>
            <ul className="space-y-4">
              {beforeItems.map((text, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3 text-red-800"
                >
                  <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-secondary-100 bg-secondary-50/50 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900">Avec Whataybo</h3>
            </div>
            <ul className="space-y-4">
              {afterItems.map((text, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3 text-secondary-800"
                >
                  <Check className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
