/**
 * Génère un slug à partir d'une chaîne de caractères
 * @param text - Le texte à convertir en slug
 * @returns Le slug généré
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remplacer les espaces et caractères spéciaux par des tirets
    .replace(/[\s_]+/g, '-')
    // Supprimer les caractères non alphanumériques sauf les tirets
    .replace(/[^\w\-]+/g, '')
    // Remplacer les tirets multiples par un seul tiret
    .replace(/\-\-+/g, '-')
    // Supprimer les tirets en début et fin
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
