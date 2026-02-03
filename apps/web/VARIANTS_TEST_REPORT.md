# ✅ VARIANTS & OPTIONS - TEST REPORT

## 📋 Vue d'ensemble

Ce document décrit les tests à effectuer pour valider le système de variants (tailles) et options (add-ons) pour les produits du menu, similaire à Take.app.

## 🧪 Tests Dashboard Admin

### Tests Variants
- [ ] **Ajout variant** : Créer un variant avec nom, nom arabe, prix
- [ ] **Modification variant** : Modifier le nom, prix, ou stock d'un variant existant
- [ ] **Suppression variant** : Supprimer un variant et vérifier que `hasVariants` est désactivé si plus de variants
- [ ] **Gestion stock** : Activer le suivi de stock et vérifier les alertes
- [ ] **Ordre de tri** : Vérifier que les variants s'affichent dans l'ordre défini par `sortOrder`

### Tests Options
- [ ] **Ajout option** : Créer une option ADDON payante (+10 EGP)
- [ ] **Ajout modification** : Créer une option MODIFICATION gratuite (0 EGP)
- [ ] **Ajout instruction** : Créer une option INSTRUCTION spéciale
- [ ] **Modification option** : Modifier le prix, le type, ou les contraintes d'une option
- [ ] **Suppression option** : Supprimer une option existante
- [ ] **Option requise** : Créer une option requise et vérifier qu'elle doit être sélectionnée
- [ ] **Option multiple** : Créer une option avec sélection multiple et vérifier le maxSelections

## 🛒 Tests Menu Public

### Tests Affichage
- [ ] **Modal produit** : Le modal s'ouvre quand on clique sur un produit avec variants/options
- [ ] **Affichage variants** : Les variants s'affichent correctement avec leurs prix
- [ ] **Affichage options** : Les options s'affichent avec leurs types et prix
- [ ] **Prix dynamique** : Le prix total se met à jour quand on change de variant ou d'options
- [ ] **Options requises** : Les options requises sont marquées et doivent être sélectionnées

### Tests Sélection
- [ ] **Sélection variant** : Choisir un variant met à jour le prix de base
- [ ] **Sélection option unique** : Sélectionner une option non-multiple désélectionne les autres
- [ ] **Sélection option multiple** : Sélectionner plusieurs options multiples fonctionne
- [ ] **Max sélections** : Le maxSelections est respecté pour les options multiples
- [ ] **Quantité** : Modifier la quantité met à jour le prix total

### Tests Panier
- [ ] **Ajout avec variant** : Ajouter un produit avec variant au panier
- [ ] **Ajout avec options** : Ajouter un produit avec options au panier
- [ ] **Ajout avec variant + options** : Ajouter un produit avec variant et options
- [ ] **Affichage panier** : Le panier affiche correctement les variants et options sélectionnés
- [ ] **Prix panier** : Le prix total du panier est correct (basePrice + options) × quantity
- [ ] **Modification quantité** : Modifier la quantité dans le panier recalcule le prix
- [ ] **Suppression item** : Supprimer un item du panier fonctionne

## 📦 Tests Commande

### Tests API
- [ ] **Création commande** : L'API accepte `variantId` dans les items
- [ ] **Création commande** : L'API accepte `selectedOptions` dans les items
- [ ] **Enregistrement OrderItem** : Le variant est enregistré dans `OrderItem.variantId`
- [ ] **Enregistrement OrderItemOption** : Les options sont enregistrées dans `OrderItemOption`
- [ ] **Prix unitaire** : Le `unitPrice` inclut le prix du variant + options
- [ ] **Sous-total** : Le `subtotal` est correct (unitPrice × quantity)

### Tests Affichage Commande
- [ ] **Détails commande** : Les variants s'affichent dans les détails de commande
- [ ] **Détails commande** : Les options s'affichent dans les détails de commande
- [ ] **Message WhatsApp** : Le message WhatsApp inclut les variants et options

## 🔍 Tests Edge Cases

- [ ] **Produit sans variant** : Un produit sans variant utilise le prix de base
- [ ] **Produit avec variant mais prix de base** : Le prix de base est ignoré si `hasVariants = true`
- [ ] **Option gratuite** : Les options avec `priceModifier = 0` s'affichent comme "Gratuit"
- [ ] **Stock épuisé** : Un variant avec stock = 0 ne peut pas être sélectionné (à implémenter)
- [ ] **Validation options requises** : Impossible d'ajouter au panier sans sélectionner les options requises

## 📊 Améliorations Take.app manquantes

- [ ] **Bulk add options** : Appliquer des options à plusieurs produits en une fois
- [ ] **Import/export variants CSV** : Import/export des variants depuis un fichier CSV
- [ ] **Images par variant** : Ajouter une image spécifique pour chaque variant
- [ ] **Gestion stock avec alertes** : Alertes automatiques quand le stock est bas
- [ ] **Groupes d'options** : Organiser les options en groupes (ex: "Sauces", "Garnitures")
- [ ] **Prix conditionnel** : Prix différent selon la combinaison d'options sélectionnées

## ✅ Checklist de Validation

### Backend
- [x] Schéma Prisma mis à jour avec `MenuItemVariant`, `MenuItemOption`, `OrderItemOption`
- [x] API routes pour CRUD variants
- [x] API routes pour CRUD options
- [x] API de commande mise à jour pour enregistrer variants/options
- [x] API publique du menu inclut variants/options

### Frontend Dashboard
- [x] Composant `VariantManager` créé
- [x] Composant `OptionManager` créé
- [ ] Intégration dans `ItemModal` du dashboard (à faire)
- [ ] Affichage des variants/options dans la liste des items (à faire)

### Frontend Public
- [x] Composant `ProductModal` créé
- [x] `MenuItemCard` mis à jour pour utiliser `ProductModal`
- [x] `cartStore` mis à jour pour gérer variants/options
- [ ] `CartDrawer` mis à jour pour afficher variants/options (à vérifier)
- [ ] `CheckoutModal` mis à jour pour inclure variants/options dans le message WhatsApp (à vérifier)

## 🚀 Prochaines Étapes

1. **Migration Prisma** : Exécuter `npx prisma db push` et `npx prisma generate`
2. **Tests manuels** : Effectuer tous les tests listés ci-dessus
3. **Intégration dashboard** : Ajouter VariantManager et OptionManager dans ItemModal
4. **Améliorations UX** : Ajouter des animations et feedback visuels
5. **Tests automatisés** : Créer des tests unitaires et d'intégration

---

**Date de création** : 2026-01-11  
**Version** : 1.0.0  
**Statut** : En cours de développement
