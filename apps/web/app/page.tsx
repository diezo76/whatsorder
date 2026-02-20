'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Menu, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { RestaurantListing } from '@/types/restaurant';
import { isRestaurantOpen } from '@/lib/shared/pricing';

import HeroSection from '@/components/landing/HeroSection';
import SocialProof from '@/components/landing/SocialProof';
import ProblemSolution from '@/components/landing/ProblemSolution';
import BentoGrid from '@/components/landing/BentoGrid';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

function RestaurantsSection() {
  const [restaurants, setRestaurants] = useState<RestaurantListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/restaurants');
        const data = await response.json();

        if (data.success && data.restaurants) {
          setRestaurants(data.restaurants);
        } else {
          setError('Impossible de charger les restaurants');
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Erreur lors du chargement des restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (error || restaurants.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-4 bg-gray-50/50">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Nos restaurants partenaires
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Commandez directement depuis leurs menus en ligne.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((restaurant, i) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative w-full aspect-square bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
                {restaurant.coverImage && (
                  <Image
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  {restaurant.logo ? (
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                      <Image
                        src={restaurant.logo}
                        alt={`${restaurant.name} logo`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl">
                      {restaurant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {restaurant.name}
                </h3>

                <div className="mb-3">
                  {isRestaurantOpen(restaurant.openingHours) ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary-50 text-secondary-700 text-xs font-semibold rounded-full">
                      <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full animate-pulse" />
                      Ouvert
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Ferme
                    </span>
                  )}
                </div>

                {restaurant.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>
                )}

                <Link
                  href={`/${restaurant.slug}`}
                  className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  Voir le menu
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setMobileMenuOpen(false);
          }
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Whataybo</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Fonctionnalites
            </a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Tarifs
            </a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              FAQ
            </a>
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              Demarrer gratuitement
            </Link>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                <a href="#features" className="py-2 text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Fonctionnalites
                </a>
                <a href="#pricing" className="py-2 text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Tarifs
                </a>
                <a href="#faq" className="py-2 text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
                <Link href="/login" className="py-2 text-gray-600 font-medium">
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="mt-2 px-5 py-3 bg-primary-600 text-white rounded-xl text-center font-semibold"
                >
                  Demarrer gratuitement
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* PAGE SECTIONS */}
      <HeroSection />
      <SocialProof />
      <RestaurantsSection />
      <ProblemSolution />
      <BentoGrid />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
