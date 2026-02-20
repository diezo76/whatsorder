'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}

const stats = [
  { value: 15, suffix: 'M€', label: 'de CA genere' },
  { value: 200, suffix: 'K', label: 'commandes gerees' },
  { value: 4.9, suffix: '/5', label: 'sur Trustpilot' },
];

export default function SocialProof() {
  return (
    <section className="py-20 px-4 border-y border-gray-100 bg-gray-50/50">
      <div className="container mx-auto max-w-5xl">
        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-12"
        >
          Utilise par 500+ restaurants en France
        </motion.p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">
                {stat.value === 4.9 ? (
                  <span>4.9{stat.suffix}</span>
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <p className="text-gray-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
