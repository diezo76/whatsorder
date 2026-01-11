import { openai, isAIEnabled, AI_MODEL } from '../config/openai';

// ==========================================
// INTERFACES
// ==========================================

export interface ParsedItem {
  name: string;
  quantity: number;
  variant?: string;
  modifiers?: string[];
  notes?: string;
  matchedMenuItemId?: string; // Si trouvé dans le menu
}

export interface ParsedOrder {
  items: ParsedItem[];
  deliveryType?: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
  deliveryAddress?: string;
  customerNotes?: string;
  confidence: number; // 0-1
  needsClarification: boolean;
  clarificationQuestions?: string[];
}

interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  variants?: any; // JSON: [{name: "Size", options: ["Small", "Large"], prices: [0, 10]}]
  modifiers?: any; // JSON: [{name: "Extra Cheese", price: 5, max: 2}]
  isAvailable?: boolean;
  isActive?: boolean;
}

interface RestaurantContext {
  name?: string;
  currency?: string;
  language?: string;
}

// ==========================================
// FONCTION PRINCIPALE
// ==========================================

/**
 * Parse un message WhatsApp pour extraire les informations de commande
 * @param message Le message du client
 * @param menuItems Liste des items disponibles dans le menu
 * @param restaurantContext Contexte du restaurant (nom, devise, etc.)
 * @returns Commande parsée avec items, adresse, type de livraison, etc.
 */
export async function parseOrderMessage(
  message: string,
  menuItems: MenuItem[],
  restaurantContext?: RestaurantContext
): Promise<ParsedOrder> {
  if (!isAIEnabled()) {
    throw new Error('AI parsing is not enabled. Please configure OPENAI_API_KEY.');
  }

  try {
    // Construction du prompt système
    const systemPrompt = buildSystemPrompt(menuItems, restaurantContext);

    // Appel OpenAI
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3, // Peu de créativité, on veut de la précision
      response_format: { type: 'json_object' },
    });

    // Parse la réponse
    const responseText = completion.choices[0].message.content || '{}';
    let parsed: any;
    
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Réponse OpenAI invalide (JSON malformé)');
    }

    // Validation et matching avec le menu réel
    const validatedOrder = await validateAndMatchItems(parsed, menuItems);

    return validatedOrder;
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Gestion des erreurs spécifiques OpenAI
    if (error.code === 'insufficient_quota') {
      throw new Error('Quota OpenAI dépassé. Veuillez vérifier votre compte.');
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Clé API OpenAI invalide.');
    }

    if (error.code === 'rate_limit_exceeded') {
      throw new Error('Limite de taux OpenAI dépassée. Veuillez réessayer plus tard.');
    }

    // Erreur générique
    throw new Error(`Erreur lors du parsing IA: ${error.message || 'Erreur inconnue'}`);
  }
}

// ==========================================
// CONSTRUCTION DU PROMPT SYSTÈME
// ==========================================

function buildSystemPrompt(menuItems: MenuItem[], restaurantContext?: RestaurantContext): string {
  // Filtre les items disponibles et actifs
  const availableItems = menuItems.filter(
    item => item.isAvailable !== false && item.isActive !== false
  );

  // Formatage de la liste du menu
  const menuList = availableItems.map(item => {
    let itemLine = `- ${item.name}`;
    
    // Ajoute le nom arabe si disponible
    if (item.nameAr) {
      itemLine += ` (${item.nameAr})`;
    }
    
    // Ajoute le prix
    const currency = restaurantContext?.currency || 'EGP';
    itemLine += ` - ${item.price} ${currency}`;
    
    // Ajoute les variantes si disponibles
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      const variantsStr = item.variants
        .map((v: any) => {
          if (v.options && Array.isArray(v.options)) {
            return v.options.join(', ');
          }
          return JSON.stringify(v);
        })
        .join('; ');
      itemLine += ` (variantes: ${variantsStr})`;
    }
    
    return itemLine;
  }).join('\n');

  const restaurantName = restaurantContext?.name || 'Restaurant';
  const language = restaurantContext?.language || 'ar';

  return `Tu es un assistant de commande pour le restaurant "${restaurantName}".

**Rôle** : Analyser les messages des clients et extraire les informations de commande.

**Menu disponible** :
${menuList || 'Aucun item disponible'}

**Instructions** :
1. Extrait les items commandés avec leurs quantités
2. Identifie les variantes (taille, options) si mentionnées
3. Détecte le type de livraison (livraison/à emporter/sur place)
4. Extrait l'adresse si c'est une livraison
5. Note toutes les instructions spéciales
6. Si des informations sont ambiguës ou manquantes, indique qu'une clarification est nécessaire
7. Support multilingue (arabe, français, anglais) - le restaurant utilise principalement ${language}

**Format de réponse (JSON strict)** :
{
  "items": [
    {
      "name": "Nom exact du plat (du menu)",
      "quantity": 2,
      "variant": "Large" (si applicable),
      "modifiers": ["Extra sauce", "Sans oignons"] (si applicable),
      "notes": "instructions spécifiques"
    }
  ],
  "deliveryType": "DELIVERY" | "PICKUP" | "DINE_IN" (si mentionné),
  "deliveryAddress": "adresse complète" (si livraison),
  "customerNotes": "notes générales du client",
  "confidence": 0.95 (score de confiance 0-1),
  "needsClarification": false,
  "clarificationQuestions": ["Question à poser si besoin"]
}

**Exemples** :

Message : "Je voudrais 2 koshari large et 1 grilled chicken"
Réponse : {
  "items": [
    {"name": "Koshari", "quantity": 2, "variant": "Large"},
    {"name": "Grilled Chicken", "quantity": 1}
  ],
  "confidence": 0.95,
  "needsClarification": false
}

Message : "Bonjour"
Réponse : {
  "items": [],
  "confidence": 0.1,
  "needsClarification": true,
  "clarificationQuestions": ["Que souhaitez-vous commander ?"]
}

Message : "Je veux commander pour livraison à 123 rue principale"
Réponse : {
  "items": [],
  "deliveryType": "DELIVERY",
  "deliveryAddress": "123 rue principale",
  "confidence": 0.8,
  "needsClarification": true,
  "clarificationQuestions": ["Que souhaitez-vous commander ?"]
}

**Important** :
- Respecte EXACTEMENT les noms du menu (utilise le nom exact, pas une approximation)
- Si un plat n'existe pas dans le menu, indique needsClarification: true
- Support multilingue (arabe, français, anglais)
- Sois précis et conservateur (confidence basse si doute)
- Si le message ne contient pas de commande claire, retourne needsClarification: true
- Les quantités doivent être des nombres entiers positifs
`;
}

// ==========================================
// VALIDATION ET MATCHING
// ==========================================

async function validateAndMatchItems(
  parsed: any,
  menuItems: MenuItem[]
): Promise<ParsedOrder> {
  const validatedItems: ParsedItem[] = [];

  // Valide et match chaque item
  for (const item of parsed.items || []) {
    // Valide la quantité
    const quantity = parseInt(item.quantity) || 1;
    if (quantity <= 0) {
      continue; // Skip les items avec quantité invalide
    }

    // Cherche le menu item correspondant (fuzzy match)
    const matchedItem = findBestMatch(item.name, menuItems);

    if (matchedItem) {
      validatedItems.push({
        name: matchedItem.name, // Normalise le nom avec celui du menu
        quantity: quantity,
        variant: item.variant || undefined,
        modifiers: Array.isArray(item.modifiers) ? item.modifiers : undefined,
        notes: item.notes || undefined,
        matchedMenuItemId: matchedItem.id
      });
    } else {
      // Item non trouvé, baisse la confiance
      parsed.confidence = Math.min(parsed.confidence || 1, 0.5);
      parsed.needsClarification = true;
      parsed.clarificationQuestions = parsed.clarificationQuestions || [];
      
      // Évite les doublons dans les questions
      const question = `Le plat "${item.name}" n'est pas dans notre menu. Voulez-vous dire quelque chose d'autre ?`;
      if (!parsed.clarificationQuestions.includes(question)) {
        parsed.clarificationQuestions.push(question);
      }
    }
  }

  // Valide le deliveryType
  let deliveryType: 'DELIVERY' | 'PICKUP' | 'DINE_IN' | undefined;
  if (parsed.deliveryType) {
    const dt = parsed.deliveryType.toUpperCase();
    if (dt === 'DELIVERY' || dt === 'PICKUP' || dt === 'DINE_IN') {
      deliveryType = dt as 'DELIVERY' | 'PICKUP' | 'DINE_IN';
    }
  }

  // Si livraison mais pas d'adresse, demande clarification
  if (deliveryType === 'DELIVERY' && !parsed.deliveryAddress) {
    parsed.needsClarification = true;
    parsed.clarificationQuestions = parsed.clarificationQuestions || [];
    if (!parsed.clarificationQuestions.includes('Quelle est votre adresse de livraison ?')) {
      parsed.clarificationQuestions.push('Quelle est votre adresse de livraison ?');
    }
  }

  return {
    items: validatedItems,
    deliveryType: deliveryType,
    deliveryAddress: parsed.deliveryAddress || undefined,
    customerNotes: parsed.customerNotes || undefined,
    confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)), // Clamp entre 0 et 1
    needsClarification: parsed.needsClarification || false,
    clarificationQuestions: parsed.clarificationQuestions || []
  };
}

// ==========================================
// FUZZY MATCHING
// ==========================================

/**
 * Trouve le meilleur match pour un nom d'item dans le menu
 * @param searchName Le nom recherché
 * @param menuItems Liste des items du menu
 * @returns L'item correspondant ou null
 */
function findBestMatch(searchName: string, menuItems: MenuItem[]): MenuItem | null {
  if (!searchName || !menuItems || menuItems.length === 0) {
    return null;
  }

  const normalized = searchName.toLowerCase().trim();
  
  // 1. Match exact (nom ou nomAr)
  let match = menuItems.find(item => {
    if (!item.isAvailable || item.isActive === false) return false;
    return (
      item.name.toLowerCase() === normalized ||
      item.nameAr?.toLowerCase() === normalized
    );
  });
  if (match) return match;
  
  // 2. Match contient (nom ou nomAr)
  match = menuItems.find(item => {
    if (!item.isAvailable || item.isActive === false) return false;
    const nameLower = item.name.toLowerCase();
    const nameArLower = item.nameAr?.toLowerCase() || '';
    return (
      nameLower.includes(normalized) ||
      normalized.includes(nameLower) ||
      nameArLower.includes(normalized) ||
      normalized.includes(nameArLower)
    );
  });
  if (match) return match;
  
  // 3. Calcul de similarité (Jaccard)
  const scores = menuItems
    .filter(item => item.isAvailable !== false && item.isActive !== false)
    .map(item => ({
      item,
      score: Math.max(
        similarity(normalized, item.name.toLowerCase()),
        item.nameAr ? similarity(normalized, item.nameAr.toLowerCase()) : 0
      )
    }));
  
  scores.sort((a, b) => b.score - a.score);
  
  // Si le meilleur score > 0.7, on considère que c'est un match
  if (scores[0] && scores[0].score > 0.7) {
    return scores[0].item;
  }
  
  return null;
}

/**
 * Calcule la similarité entre deux chaînes (coefficient de Jaccard)
 * @param str1 Première chaîne
 * @param str2 Deuxième chaîne
 * @returns Score de similarité entre 0 et 1
 */
function similarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  // Normalise les chaînes (supprime les accents, caractères spéciaux)
  const normalize = (s: string) => s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s]/g, '') // Supprime les caractères spéciaux
    .toLowerCase();
  
  const norm1 = normalize(str1);
  const norm2 = normalize(str2);
  
  // Crée des sets de mots
  const set1 = new Set(norm1.split(/\s+/).filter(w => w.length > 0));
  const set2 = new Set(norm2.split(/\s+/).filter(w => w.length > 0));
  
  // Intersection
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  
  // Union
  const union = new Set([...set1, ...set2]);
  
  // Coefficient de Jaccard
  return union.size > 0 ? intersection.size / union.size : 0;
}

// TODO: Tests unitaires
// - Test avec message simple
// - Test avec message complexe
// - Test avec items inexistants
// - Test multilingue
// - Test avec variantes et modifiers
// - Test avec adresse de livraison
// - Test avec confidence faible
