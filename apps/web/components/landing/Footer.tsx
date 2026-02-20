'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

const footerLinks = {
  produit: [
    { label: 'Fonctionnalites', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  ressources: [
    { label: 'Documentation', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  entreprise: [
    { label: 'A propos', href: '#' },
    { label: 'Contact', href: 'mailto:contact@whataybo.com' },
    { label: 'Mentions legales', href: '#' },
    { label: 'CGU', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-bold text-white">Whataybo</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Automatisez votre restaurant avec l&apos;IA WhatsApp. Fabrique avec passion en France.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-2.5">
              {footerLinks.produit.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Ressources</h4>
            <ul className="space-y-2.5">
              {footerLinks.ressources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Entreprise</h4>
            <ul className="space-y-2.5">
              {footerLinks.entreprise.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2026 Whataybo. Tous droits reserves.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Twitter">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
