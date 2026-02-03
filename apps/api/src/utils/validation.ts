import { z } from 'zod';

/**
 * Fonction utilitaire pour sanitizer les strings et prévenir XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Échapper les caractères HTML dangereux
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validation et sanitization pour les noms d'utilisateurs
 */
export const sanitizedStringSchema = z.string().transform((val) => sanitizeString(val));

/**
 * Validation pour les emails avec sanitization
 */
export const emailSchema = z.string().email().transform((val) => val.toLowerCase().trim());

/**
 * Validation pour les URLs avec vérification
 */
export const urlSchema = z.string().url().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      // Autoriser seulement HTTP et HTTPS
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: 'URL invalide' }
);

/**
 * Validation pour les téléphones (format international)
 */
export const phoneSchema = z.string().regex(
  /^\+[1-9]\d{1,14}$/,
  'Format de téléphone invalide. Utilisez le format international: +1234567890'
);
