# Compte Rendu - Insertion du menu complet O'Chicken

## Date : 16 février 2026

## Restaurant
- **Nom** : O'Chicken
- **ID** : `bc2abbcf-4430-4296-ae58-c96ccb9a8f17`
- **Slug** : `o-chicken`
- **Devise** : EGP

## Actions effectuées

### 1. Nettoyage
- Suppression de toutes les données de démo existantes (3 catégories, 6 articles : Hummus, Moutabal, Kebab, Shawarma, Jus d'orange, Thé)
- Suppression des options et option groups associés

### 2. Catégories créées (6)
| Catégorie | Slug | Sort Order |
|---|---|---|
| Sandwiches Poulet | sandwiches-poulet | 1 |
| Sandwiches Kebab | sandwiches-kebab | 2 |
| Menus | menus | 3 |
| Petites Faims | petites-faims | 4 |
| Desserts | desserts | 5 |
| Boissons | boissons | 6 |

### 3. Articles insérés (28)

#### Sandwiches Poulet (6)
| Article | Prix | Options |
|---|---|---|
| Chicken Rouge | 220 EGP | Pain/Tortilla, 7 Sauces (1 gratuite, +10 EGP/supp), Suppléments (Viande +60, Cheddar +20), Retirer ingrédients, Formule Menu +40 |
| Chicken Jaune | 220 EGP | Idem |
| Chicken Mix | 230 EGP | Idem |
| Le Fines Herbes | 240 EGP | Idem |
| L'Emmental Le Fameux | 240 EGP | Idem |
| Le Classique | Simple: 210 / Double: 255 EGP | Idem + Oeuf (+15 EGP) - hasVariants: true |

#### Sandwiches Kebab (4)
| Article | Prix | Options |
|---|---|---|
| Le Signature | 255 EGP | Pain/Tortilla, 7 Sauces, Suppléments, Retirer ingrédients, Formule Menu +40 |
| Le Cheezy | 275 EGP | Idem |
| Le Mixte Royal | 275 EGP | Idem |
| L'Assiette | 360 EGP | Sauce au choix (1 incluse), Retirer ingrédients (PAS de formule menu - boisson incluse) |

#### Menus (2)
| Article | Prix | Options |
|---|---|---|
| Menu Jeûneur | 220 EGP | Choix: Chicken Rouge/Jaune, Retirer ingrédients |
| Menu Enfant | 200 EGP | Choix: Crok/4 Nuggets, Retirer ingrédients |

#### Petites Faims (4)
| Article | Prix | Options |
|---|---|---|
| Crok McD'O'Chicken | 130 EGP | Retirer ingrédients |
| Frites | 50 EGP | Aucune |
| 4 Nuggets | 125 EGP | Aucune |
| 6 Nuggets | 140 EGP | Aucune |

#### Desserts (6)
| Article | Prix | Options |
|---|---|---|
| Tiramisu | 130 EGP | Aucune |
| Pop Freshly | 130 EGP | Aucune |
| Speculoos Cara | 130 EGP | Aucune |
| Oreo Nutella | 150 EGP | Aucune |
| Bueno Morijane | 170 EGP | Choix: Morijane / White Morijane |
| Bueno Nutella | 150 EGP | Aucune |

#### Boissons (6) - ESTIMÉES D'APRÈS L'IMAGE, À VÉRIFIER
| Article | Prix |
|---|---|
| Canette (Pepsi/7Up/Mirinda) | 20 EGP |
| Eau (petite) | 10 EGP |
| Eau (grande) | 25 EGP |
| Jus de fruits | 40 EGP |
| Boisson grande | 50 EGP |
| Bebela | 45 EGP |

### 4. Option Groups et Options

#### Groupes d'options par sandwich (9 sandwiches réguliers) :
- **Type de pain** (obligatoire, 1 choix) : Pain, Tortilla
- **Sauces** (optionnel, 1 incluse gratuite, +10 EGP/supplémentaire) : Harissa, Algérienne, Ketchup, Mayonnaise, Biggy Burger, Sauce Blanche, BBQ
- **Suppléments** (optionnel) : Viande (+60 EGP), Cheddar (+20 EGP), Oeuf (+15 EGP uniquement Le Classique)
- **Retirer des ingrédients** (optionnel, gratuit, sélection multiple) : Sans Salade, Sans Tomates, Sans Oignons
- **Formule Menu** (standalone, +40 EGP) : Frites + Boisson

#### Groupes spécifiques :
- **L'Assiette** : Sauce au choix (7 sauces, 1 incluse) + Retirer ingrédients
- **Menu Jeûneur** : Choix du sandwich (Chicken Rouge/Jaune) + Retirer ingrédients
- **Menu Enfant** : Choix principal (Crok/4 Nuggets) + Retirer ingrédients
- **Crok** : Retirer ingrédients
- **Bueno Morijane** : Choix (Morijane / White Morijane)

### 5. Variants
- **Le Classique** : Simple (210 EGP) / Double (255 EGP)

### 6. Déploiement
- Déployé sur Vercel en production
- URL : https://whatsorder-gqxxysgpr-diiezos-projects.vercel.app

## Points à vérifier / corriger
1. **Boissons** : Les noms et prix sont estimés d'après l'image du frigo - à vérifier et corriger si nécessaire
2. **Images** : Aucune image n'a été ajoutée aux articles (non fournies)
3. **Horaires du Menu Jeûneur** : Configuré en description (Lundi et Jeudi) mais pas de restriction automatique par jour

## Aucune modification du code n'a été effectuée
Toutes les insertions ont été faites directement en base de données via SQL Supabase.
