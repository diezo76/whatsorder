# Compte Rendu - Groupes d'Options avec Quota Inclus

**Date** : 4 fevrier 2026  
**Agent** : Composer (Cursor AI)  
**Statut** : Termine avec succes

---

## Objectif

Implementer un systeme de groupes d'options avec quota inclus pour les articles du menu. Par exemple, un "Wrap 3 viandes" permet de choisir 3 viandes gratuitement, puis chaque viande supplementaire est facturee.

---

## Modifications Effectuees

### 1. Schema Base de Donnees

**Fichier** : `apps/web/prisma/schema.prisma`

- Ajout du modele `OptionGroup` :
  - `id` : Identifiant unique
  - `menuItemId` : Lien vers l'article du menu
  - `name`, `nameAr` : Nom du groupe (FR/AR)
  - `includedCount` : Nombre de choix INCLUS gratuitement
  - `minSelections` : Minimum requis
  - `maxSelections` : Maximum autorise
  - `isRequired` : Groupe obligatoire

- Modification de `MenuItemOption` :
  - Ajout de `optionGroupId` : Lien optionnel vers un groupe

- Modification de `MenuItem` :
  - Ajout de la relation `optionGroups`

**Migration SQL appliquee** : `add_option_groups`

---

### 2. Types TypeScript

**Fichier** : `apps/web/types/menu.ts`

Nouveaux types ajoutes :

```typescript
export interface OptionGroup {
  id: string;
  menuItemId: string;
  name: string;
  nameAr?: string;
  includedCount: number;  // Choix gratuits inclus
  minSelections: number;
  maxSelections?: number;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  options: MenuItemOption[];
}
```

Modification de `CartItem.selectedOptions` :
- `isIncluded?: boolean` - Indique si l'option est dans le quota inclus
- `groupId?: string` - ID du groupe
- `groupName?: string` - Nom du groupe

---

### 3. Routes API

**Nouveaux fichiers crees** :

| Route | Methode | Description |
|-------|---------|-------------|
| `/api/menu/items/[id]/option-groups` | GET | Liste des groupes |
| `/api/menu/items/[id]/option-groups` | POST | Creer un groupe |
| `/api/menu/items/[id]/option-groups/[groupId]` | GET | Details d'un groupe |
| `/api/menu/items/[id]/option-groups/[groupId]` | PUT | Modifier un groupe |
| `/api/menu/items/[id]/option-groups/[groupId]` | DELETE | Supprimer un groupe |
| `/api/menu/items/[id]/option-groups/[groupId]/options` | GET | Options d'un groupe |
| `/api/menu/items/[id]/option-groups/[groupId]/options` | POST | Ajouter une option |
| `/api/menu/items/[id]/option-groups/[groupId]/options/[optionId]` | PUT | Modifier une option |
| `/api/menu/items/[id]/option-groups/[groupId]/options/[optionId]` | DELETE | Supprimer une option |

---

### 4. Composant Dashboard

**Fichier** : `apps/web/components/menu/OptionGroupManager.tsx`

Fonctionnalites :
- Creation de groupes d'options
- Configuration du quota inclus (nombre de choix gratuits)
- Ajout/modification/suppression d'options dans chaque groupe
- Configuration du prix supplement par option
- Interface accordion pour une navigation facile

**Integration** : `apps/web/components/dashboard/ItemModal.tsx`
- Le composant est maintenant disponible dans le modal d'edition d'article

---

### 5. ProductModal (Frontend Client)

**Fichier** : `apps/web/components/public/ProductModal.tsx`

Nouvelle logique implementee :
- Affichage des groupes d'options separement
- Compteur de selections par groupe
- Badge "Inclus" pour les options dans le quota
- Badge "Supplement" pour les options au-dela du quota
- Options grisees visuellement quand le quota est depasse mais restent cliquables
- Calcul dynamique du prix :
  - Options dans le quota = 0 EGP
  - Options au-dela = prix supplement de l'option

---

### 6. API Menu Public

**Fichier** : `apps/web/app/api/public/restaurants/[slug]/menu/route.ts`

- Inclusion des `optionGroups` dans la reponse
- Filtrage des options individuelles (sans groupe)
- Format de reponse enrichi avec les groupes et leurs options

---

## Exemple d'Utilisation

### Configuration d'un "Wrap 3 viandes" :

1. Creer l'article "Wrap 3 viandes" - Prix: 80 EGP
2. Dans le modal d'edition, section "Groupes d'options"
3. Cliquer "Nouveau groupe"
4. Configurer :
   - Nom: "Choix de viandes"
   - Choix inclus: 3
   - Min requis: 3
   - Max autorise: 6 (ou laisser vide pour illimite)
5. Ajouter les options :
   - Boeuf - Supplement: 20 EGP
   - Poulet - Supplement: 15 EGP
   - Kefta - Supplement: 12 EGP
   - Merguez - Supplement: 18 EGP

### Comportement client :

- Client selectionne Boeuf, Poulet, Kefta = 0 EGP (3 inclus)
- Client ajoute Merguez = +18 EGP (4eme choix = supplement)
- **Total : 80 + 18 = 98 EGP**

---

## Structure des Fichiers

```
apps/web/
├── prisma/schema.prisma                     # Schema avec OptionGroup
├── types/menu.ts                            # Types OptionGroup, CartItem
├── components/
│   ├── menu/
│   │   └── OptionGroupManager.tsx           # Gestion dashboard
│   ├── public/
│   │   └── ProductModal.tsx                 # Selection client
│   └── dashboard/
│       └── ItemModal.tsx                    # Integration dashboard
└── app/api/
    ├── menu/items/[id]/option-groups/       # Routes API
    └── public/restaurants/[slug]/menu/      # Menu public
```

---

## Notes pour le Prochain Agent

1. **Les options existantes** (sans groupe) continuent de fonctionner normalement
2. **Retrocompatibilite** : Le champ `optionGroupId` est optionnel
3. **Le prix supplement** est applique uniquement au-dela du quota inclus
4. **Les groupes obligatoires** necessitent le minimum de selections
5. **L'API menu public** inclut maintenant les `optionGroups` dans la reponse

---

**Statut Final** : Implementation complete et fonctionnelle
