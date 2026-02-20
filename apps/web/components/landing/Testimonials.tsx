'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Marc Dubois',
    restaurant: 'Pizza Napoli',
    city: 'Lyon',
    quote: 'On a double nos commandes en 3 mois. L\'IA ne se trompe jamais. Un gain de temps incroyable pour toute l\'equipe.',
    rating: 5,
  },
  {
    name: 'Sarah Cohen',
    restaurant: 'Sushi Time',
    city: 'Marseille',
    quote: 'Fini le stress du rush. WhatsApp gere tout automatiquement. Mes clients adorent commander depuis leur telephone.',
    rating: 5,
  },
  {
    name: 'Ahmed Benali',
    restaurant: 'Le Tajine d\'Or',
    city: 'Toulouse',
    quote: 'Installation en 10 minutes. ROI en 2 semaines. L\'interface est tellement intuitive que meme mon equipe l\'a adoptee direct.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 bg-gray-50/50">
      <div className="container mx-auto max-w-5xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Ils ont transforme leur restaurant
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Decouvrez ce que nos clients pensent de Whataybo.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent-400 text-accent-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.restaurant} &middot; {t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
