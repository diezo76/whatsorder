'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'Est-ce complique a installer ?',
    a: 'Non, 2 minutes suffisent. Creez votre compte, configurez votre menu, et commencez a recevoir des commandes. Un guide video est disponible pour vous accompagner.',
  },
  {
    q: 'Faut-il former mon equipe ?',
    a: 'Non, l\'interface est intuitive. Si vous savez utiliser WhatsApp, vous savez utiliser Whataybo. Votre equipe sera operationnelle en quelques minutes.',
  },
  {
    q: 'Et si l\'IA se trompe ?',
    a: 'C\'est rare (moins de 2% des cas). Vous validez chaque commande avant envoi, et notre support est disponible 24h/24 pour vous aider.',
  },
  {
    q: 'Mes donnees sont-elles securisees ?',
    a: 'Oui. Nous sommes conformes RGPD, nos serveurs sont heberges en Europe, et toutes les communications sont chiffrees de bout en bout.',
  },
  {
    q: 'Puis-je garder mon numero WhatsApp ?',
    a: 'Oui, vous pouvez utiliser votre numero existant ou creer un nouveau WhatsApp Business dedie a votre restaurant.',
  },
  {
    q: 'Quels moyens de paiement sont acceptes ?',
    a: 'Stripe (carte bancaire), PayPal, virement bancaire et especes a la livraison. Vous choisissez les methodes que vous souhaitez activer.',
  },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors pr-4">
          {q}
        </span>
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-50 flex items-center justify-center transition-colors">
          {isOpen ? (
            <Minus className="w-4 h-4 text-gray-600" />
          ) : (
            <Plus className="w-4 h-4 text-gray-600" />
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 bg-gray-50/50">
      <div className="container mx-auto max-w-3xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Questions frequentes
          </h2>
          <p className="text-lg text-gray-500">
            Tout ce que vous devez savoir avant de demarrer.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-gray-100 px-6 sm:px-8"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
