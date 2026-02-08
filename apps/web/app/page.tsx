'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageSquare, 
  Zap, 
  BarChart3, 
  Users, 
  Smartphone,
  TrendingUp,
  Clock,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

import type { RestaurantListing } from '@/types/restaurant';
import { isRestaurantOpen } from '@/lib/shared/pricing';

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
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-gray-600">Chargement des restaurants...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || restaurants.length === 0) {
    return null; // Ne rien afficher si erreur ou aucun restaurant
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Découvrez nos restaurants partenaires
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Commandez directement depuis leurs menus en ligne
          </p>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              {/* Logo/Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                {restaurant.coverImage ? (
                  <Image
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : restaurant.logo ? (
                  <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                    <Image
                      src={restaurant.logo}
                      alt={restaurant.name}
                      width={120}
                      height={120}
                      className="object-contain max-w-full max-h-full rounded-lg"
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                    <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {restaurant.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                  {restaurant.name}
                </h3>
                
                {/* Statut Ouvert/Fermé */}
                <div className="mb-4">
                  {isRestaurantOpen(restaurant.openingHours) ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Ouvert
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      {"Fermé"}
                    </span>
                  )}
                </div>

                {/* Description */}
                {restaurant.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>
                )}

                {/* CTA Button */}
                <Link
                  href={`/${restaurant.slug}`}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 font-semibold group-hover:shadow-md"
                >
                  Voir le menu
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // IMPORTANT: Empêcher toute redirection automatique depuis la landing page
    // Cette page doit toujours s'afficher, même si l'utilisateur est connecté
    
    // Protection contre les redirections automatiques
    // Empêcher toute tentative de redirection vers /login depuis cette page
    if (typeof window !== 'undefined') {
      // Vérifier que nous sommes bien sur la page d'accueil
      if (window.location.pathname === '/') {
        // Ne rien faire - laisser la landing page s'afficher
      }
    }
    
    // Smooth scroll pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setMobileMenuOpen(false); // Fermer le menu mobile après clic
          }
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* HEADER / NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-orange-500" />
            <span className="text-xl md:text-2xl font-bold text-gray-900">Whataybo</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-orange-500 transition">Fonctionnalités</a>
            <Link 
              href="/login" 
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Se connecter
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-orange-500 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#features" className="text-gray-600 hover:text-orange-500 transition py-2">Fonctionnalités</a>
              <Link 
                href="/login" 
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-center"
              >
                Se connecter
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
            {/* Text */}
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                Propulsé par Whataybo
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Gérez vos commandes WhatsApp
                <span className="text-orange-500"> sans effort</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transformez vos conversations WhatsApp en commandes automatiques. 
                Interface intuitive, IA intégrée, synchronisation temps réel. 
                Parfait pour les restaurants en Égypte.
              </p>
              
              {/* CTA Button */}
              <div className="flex justify-center">
                <a 
                  href={`https://wa.me/201276921081?text=${encodeURIComponent('Bonjour, je souhaite en savoir plus sur Whataybo')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  Contactez-nous
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-orange-500">500+</div>
                  <div className="text-xs md:text-sm text-gray-600">Restaurants</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-orange-500">50K+</div>
                  <div className="text-xs md:text-sm text-gray-600">Commandes/mois</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-orange-500">98%</div>
                  <div className="text-xs md:text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESTAURANTS SECTION */}
      <RestaurantsSection />

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour gérer vos commandes WhatsApp, 
              votre menu et vos clients en un seul endroit.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Parsing IA Automatique
              </h3>
              <p className="text-gray-600 leading-relaxed">
                L'IA analyse les messages WhatsApp et créé automatiquement les commandes. 
                Support arabe/français. Reconnaissance des plats, quantités et adresses.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Inbox Temps Réel
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Conversations WhatsApp synchronisées en direct. 
                Notifications instantanées. Historique complet. 
                Plusieurs utilisateurs simultanés.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Kanban Visuel
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Gérez vos commandes en drag & drop : En attente → Préparation → Livraison. 
                Vue d'ensemble claire. Assignation d'équipe.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Analytics Avancé
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Revenus, commandes, clients. Graphes interactifs. 
                Top des plats vendus. Export CSV/Excel. 
                KPIs en temps réel.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Menu Public
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Site web automatique pour vos clients. 
                Panier intégré. Checkout WhatsApp direct. 
                Design responsive mobile/desktop.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Gestion Menu CRUD
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Créez/modifiez vos plats en 2 clics. 
                Upload d'images. Prix en EGP. 
                Catégories drag & drop. Multi-langues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Column 1 - Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold text-white">Whataybo</span>
              </div>
              <p className="text-sm leading-relaxed">
                La solution complète pour gérer vos commandes WhatsApp. 
                Fabriqué en Égypte 🇪🇬
              </p>
            </div>

            {/* Column 2 - Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-orange-500 transition">Fonctionnalités</a></li>
                <li><Link href="/nile-bites" className="hover:text-orange-500 transition">Exemple live</Link></li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition">À propos</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Blog</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Carrières</a></li>
                <li><a href="mailto:contact@whatsorder.com" className="hover:text-orange-500 transition">Contact</a></li>
              </ul>
            </div>

            {/* Column 4 - Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">CGU</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2026 Whataybo. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-orange-500 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
