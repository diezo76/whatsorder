# 🧪 Guide de Test - Variants & Options

## ✅ Migration Appliquée

La migration a été appliquée avec succès ! Vous pouvez maintenant tester les fonctionnalités.

## 🚀 Tests Rapides

### 1. Test Dashboard - Créer un Variant

1. **Ouvrir le dashboard** : `http://localhost:3000/dashboard/menu`
2. **Sélectionner un produit existant** (ou créer un nouveau produit)
3. **Cliquer sur "Modifier"** sur un produit
4. **Faire défiler jusqu'à la section "Variants et Options"**
5. **Cliquer sur "Ajouter un variant"**
6. **Remplir le formulaire** :
   - Nom : `Small`
   - Nom arabe : `صغير` (optionnel)
   - Prix : `50`
   - SKU : `PIZZA-SMALL` (optionnel)
7. **Cliquer sur "Ajouter"**
8. **Vérifier** : Le variant apparaît dans la liste

### 2. Test Dashboard - Créer une Option

1. **Dans le même modal**, faire défiler jusqu'à "Options"
2. **Cliquer sur "Ajouter une option"**
3. **Remplir le formulaire** :
   - Nom : `Extra cheese`
   - Nom arabe : `جبنة إضافية` (optionnel)
   - Type : `Add-on payant`
   - Prix supplémentaire : `10`
   - Option requise : Non
   - Sélection multiple : Oui
   - Max sélections : `3`
4. **Cliquer sur "Ajouter"**
5. **Vérifier** : L'option apparaît dans la liste

### 3. Test Menu Public - Sélection Variant

1. **Ouvrir le menu public** : `http://localhost:3000/nile-bites` (ou votre slug)
2. **Trouver le produit avec variants**
3. **Cliquer sur "Ajouter"**
4. **Vérifier** : Le modal `ProductModal` s'ouvre
5. **Sélectionner un variant** (ex: `Medium`)
6. **Vérifier** : Le prix se met à jour
7. **Sélectionner des options** (ex: `Extra cheese`)
8. **Vérifier** : Le prix total se met à jour
9. **Modifier la quantité** : `2`
10. **Vérifier** : Le prix total = (prix variant + options) × quantité
11. **Cliquer sur "Ajouter au panier"**
12. **Vérifier** : L'item apparaît dans le panier avec les détails

### 4. Test Panier

1. **Ouvrir le panier** (bouton flottant)
2. **Vérifier** : Les items avec variants affichent :
   - Nom du produit
   - Variant sélectionné (ex: "Pizza Medium")
   - Options sélectionnées (ex: "Extra cheese +10 EGP")
   - Prix total correct
3. **Modifier la quantité**
4. **Vérifier** : Le prix se recalcule correctement

### 5. Test Commande

1. **Procéder au checkout** avec un panier contenant des variants/options
2. **Remplir les informations client**
3. **Confirmer la commande**
4. **Vérifier** : La commande est créée avec succès
5. **Aller dans le dashboard** : `http://localhost:3000/dashboard/orders`
6. **Ouvrir la commande**
7. **Vérifier** : Les détails affichent :
   - Le variant sélectionné
   - Les options sélectionnées
   - Le prix unitaire correct

## 🐛 Dépannage

### Le modal ne s'ouvre pas pour les produits avec variants

**Solution** : Vérifier que :
- L'API `/api/public/restaurants/[slug]/menu` retourne bien `hasVariants`, `variants` et `options`
- Le composant `MenuItemCard` utilise bien `ProductModal`

### Les variants/options ne s'affichent pas dans le dashboard

**Solution** : Vérifier que :
- Les composants `VariantManager` et `OptionManager` sont bien importés dans `ItemModal`
- L'item a bien un `id` (mode édition, pas création)

### Erreur "Cannot read property 'id' of null"

**Solution** : Les composants `VariantManager` et `OptionManager` ne s'affichent qu'en mode édition. Créez d'abord l'item, puis modifiez-le pour ajouter des variants/options.

### Le prix ne se met pas à jour dans ProductModal

**Solution** : Vérifier que :
- Le calcul du prix dans `ProductModal` utilise bien `getBasePrice()` et `getOptionsPrice()`
- Les variants sont bien chargés depuis l'API

## 📝 Notes

- **Création d'item** : Pour créer un nouvel item avec variants, créez d'abord l'item (avec un prix de base), puis modifiez-le pour ajouter des variants. Le prix de base sera ignoré si `hasVariants = true`.
- **Prix optionnel** : Si un item a des variants (`hasVariants = true`), le prix de base devient optionnel.
- **Options requises** : Les options marquées comme "requises" doivent être sélectionnées avant d'ajouter au panier.

## ✅ Checklist de Validation

- [ ] Variants créés dans le dashboard
- [ ] Options créées dans le dashboard
- [ ] Modal ProductModal s'ouvre pour les produits avec variants/options
- [ ] Sélection de variant met à jour le prix
- [ ] Sélection d'options met à jour le prix
- [ ] Quantité fonctionne correctement
- [ ] Ajout au panier fonctionne
- [ ] Panier affiche les variants et options
- [ ] Commande créée avec variants et options
- [ ] Dashboard affiche les détails de la commande

---

**Date** : 11 janvier 2026  
**Version** : 1.0.0
