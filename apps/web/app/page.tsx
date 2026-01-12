'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Zap, 
  BarChart3, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Smartphone,
  TrendingUp,
  Clock,
  Star,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
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
            <span className="text-xl md:text-2xl font-bold text-gray-900">WhatsOrder</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-orange-500 transition">Fonctionnalités</a>
            <a href="#pricing" className="text-gray-600 hover:text-orange-500 transition">Tarifs</a>
            <a href="#demo" className="text-gray-600 hover:text-orange-500 transition">Démo</a>
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
              <a href="#pricing" className="text-gray-600 hover:text-orange-500 transition py-2">Tarifs</a>
              <a href="#demo" className="text-gray-600 hover:text-orange-500 transition py-2">Démo</a>
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
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                🚀 Propulsé par l'IA
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
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/nile-bites" 
                  className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  Essayer la démo
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#demo" 
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-orange-500 hover:text-orange-500 transition flex items-center justify-center gap-2 text-lg font-semibold"
                >
                  Voir la vidéo
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8">
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

            {/* Right: Screenshot/Demo */}
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop" 
                  alt="WhatsOrder Dashboard"
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-50 -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-orange-300 rounded-full blur-3xl opacity-30 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BANNER */}
      <section className="py-8 bg-white border-y">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 mb-6">Ils nous font confiance :</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale">
            <div className="text-2xl font-bold">🍔 Burger King</div>
            <div className="text-2xl font-bold">🍕 Pizza Hut</div>
            <div className="text-2xl font-bold">🥙 Shawarma Express</div>
            <div className="text-2xl font-bold">🍜 Nile Bites</div>
          </div>
        </div>
      </section>

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

      {/* DEMO / SCREENSHOTS SECTION */}
      <section id="demo" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Découvrez WhatsOrder en action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une interface intuitive conçue pour les restaurateurs égyptiens
            </p>
          </div>

          {/* Video Demo */}
          <div className="mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              {/* Placeholder for video - Replace with actual video later */}
              <div className="aspect-video bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/40 transition">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-xl font-semibold">Voir la démo vidéo (2 min)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Screenshot 1 - Dashboard */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                  alt="Dashboard Analytics"
                  className="w-full h-auto"
                />
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-gray-900 mb-1">Dashboard Analytics</h3>
                  <p className="text-sm text-gray-600">Suivez vos KPIs en temps réel</p>
                </div>
              </div>
            </div>

            {/* Screenshot 2 - Kanban */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" 
                  alt="Kanban Orders"
                  className="w-full h-auto"
                />
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-gray-900 mb-1">Kanban des Commandes</h3>
                  <p className="text-sm text-gray-600">Drag & drop intuitif</p>
                </div>
              </div>
            </div>

            {/* Screenshot 3 - Inbox */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop" 
                  alt="WhatsApp Inbox"
                  className="w-full h-auto"
                />
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-gray-900 mb-1">Inbox WhatsApp</h3>
                  <p className="text-sm text-gray-600">Conversations en temps réel</p>
                </div>
              </div>
            </div>

            {/* Screenshot 4 - Menu */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" 
                  alt="Menu Management"
                  className="w-full h-auto"
                />
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-gray-900 mb-1">Gestion du Menu</h3>
                  <p className="text-sm text-gray-600">CRUD facile et rapide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Des tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choisissez le plan adapté à la taille de votre restaurant
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Starter */}
            <div className="rounded-2xl border-2 border-gray-200 p-8 hover:border-orange-300 transition">
              <div className="text-sm font-semibold text-gray-600 mb-2">STARTER</div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">Gratuit</span>
              </div>
              <p className="text-gray-600 mb-6">
                Parfait pour tester la plateforme
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Jusqu'à 50 commandes/mois</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Menu public</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Dashboard basique</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">1 utilisateur</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-orange-500 hover:text-orange-500 transition font-semibold">
                Commencer gratuitement
              </button>
            </div>

            {/* Plan Pro - POPULAR */}
            <div className="rounded-2xl border-2 border-orange-500 p-8 relative shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                LE PLUS POPULAIRE
              </div>
              <div className="text-sm font-semibold text-orange-600 mb-2">PRO</div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">299</span>
                <span className="text-xl text-gray-600"> EGP/mois</span>
              </div>
              <p className="text-gray-600 mb-6">
                Pour les restaurants en croissance
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Commandes illimitées</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Parsing IA activé</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Analytics avancé</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Temps réel</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">5 utilisateurs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Support prioritaire</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold">
                Démarrer maintenant
              </button>
            </div>

            {/* Plan Enterprise */}
            <div className="rounded-2xl border-2 border-gray-200 p-8 hover:border-orange-300 transition">
              <div className="text-sm font-semibold text-gray-600 mb-2">ENTERPRISE</div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">Sur mesure</span>
              </div>
              <p className="text-gray-600 mb-6">
                Pour les chaînes de restaurants
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Tout du plan Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Multi-restaurants</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">API personnalisée</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Utilisateurs illimités</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Support dédié 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Formation équipe</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-orange-500 hover:text-orange-500 transition font-semibold">
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600">
              +500 restaurateurs nous font confiance
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "WhatsOrder a transformé notre façon de gérer les commandes. 
                L'IA comprend parfaitement l'arabe et le français. 
                Un gain de temps incroyable !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ahmed Hassan</div>
                  <div className="text-sm text-gray-600">Propriétaire, Cairo Kitchen</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Le Kanban est génial ! On voit toutes les commandes d'un coup d'œil. 
                Plus de confusion entre les équipes. Interface très intuitive."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sara Mohamed</div>
                  <div className="text-sm text-gray-600">Manager, Shawarma Express</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Les analytics nous ont aidé à optimiser notre menu. 
                On sait exactement quels plats se vendent le mieux. ROI rapide !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                  K
                </div>
                <div>
                  <div className="font-bold text-gray-900">Karim Ali</div>
                  <div className="text-sm text-gray-600">Chef, Nile Bites</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à simplifier vos commandes ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez +500 restaurants qui utilisent WhatsOrder chaque jour
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/nile-bites" 
              className="px-8 py-4 bg-white text-orange-500 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
            >
              Essayer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="mailto:contact@whatsorder.com" 
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-orange-500 transition flex items-center justify-center gap-2 text-lg font-semibold"
            >
              Nous contacter
            </a>
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
                <span className="text-xl font-bold text-white">WhatsOrder</span>
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
                <li><a href="#pricing" className="hover:text-orange-500 transition">Tarifs</a></li>
                <li><a href="#demo" className="hover:text-orange-500 transition">Démo</a></li>
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
              © 2026 WhatsOrder. Tous droits réservés.
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
