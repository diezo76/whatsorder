# 📊 Analyse des Tables Supabase - Projet Taybo II

**Date** : 15 janvier 2026  
**Projet** : Taybo II (Whataybo - Système de Commande Restaurant WhatsApp)  
**URL Supabase** : https://yqpbgdowfycuhixpxygr.supabase.co

---

## ✅ Tables Taybo II (WhatsApp Order) - À CONSERVER

### Tables Principales (7 tables)
| Table | Colonnes | RLS | Politiques | Statut |
|-------|----------|-----|------------|--------|
| Restaurant | 20 | ✅ | 2 | ✅ Active |
| User | 12 | ✅ | 2 | ✅ Active |
| Category | 11 | ✅ | 2 | ✅ Active |
| MenuItem | 24 | ✅ | 2 | ✅ Active |
| Customer | 13 | ✅ | 2 | ✅ Active |
| Order | 28 | ✅ | 3 | ✅ Active |
| OrderItem | 10 | ✅ | 2 | ✅ Active |

### Tables de Communication (3 tables)
| Table | Colonnes | RLS | Politiques | Statut |
|-------|----------|-----|------------|--------|
| Conversation | 8 | ✅ | 2 | ✅ Active |
| Message | 11 | ✅ | 2 | ✅ Active |
| InternalNote | 6 | ✅ | 2 | ✅ Active |

### Tables Avancées (4 tables)
| Table | Colonnes | RLS | Politiques | Statut |
|-------|----------|-----|------------|--------|
| Workflow | 10 | ✅ | 2 | ✅ Active |
| WorkflowExecution | 8 | ✅ | 2 | ✅ Active |
| Campaign | 17 | ✅ | 2 | ✅ Active |
| DailyAnalytics | 14 | ✅ | 2 | ✅ Active |

**Total** : 14 tables Taybo II ✅

---

## ⚠️ Tables Ancien Projet (Voyage) - À SUPPRIMER ?

### Tables avec Données
| Table | Colonnes | Données | Action Recommandée |
|-------|----------|---------|-------------------|
| users | 13 | ~106 lignes | ⚠️ Vérifier avant suppression |
| itineraries | 13 | ~122 lignes | ⚠️ Vérifier avant suppression |
| daily_itineraries | 167 | ~115 lignes | ⚠️ Vérifier avant suppression |
| user_credits | 5 | ~106 lignes | ⚠️ Vérifier avant suppression |
| credit_transactions | 7 | ~346 lignes | ⚠️ Vérifier avant suppression |
| activity_ratings | 7 | ~48 lignes | ⚠️ Vérifier avant suppression |
| day_ratings | 8 | ~4 lignes | ✅ Peut être supprimée |
| saved_places | 8 | ~4 lignes | ✅ Peut être supprimée |
| subscription_history | 11 | ~4 lignes | ✅ Peut être supprimée |
| itinerary_shortlists | 8 | ~40 lignes | ⚠️ Vérifier avant suppression |
| user_cities | 10 | ~94 lignes | ⚠️ Vérifier avant suppression |
| ai_request_logs | 4 | ~549 lignes | ⚠️ Vérifier avant suppression |

### Tables Vides
| Table | Colonnes | Action |
|-------|----------|--------|
| user_preferences | 7 | ✅ Peut être supprimée |
| itinerary_activities | 10 | ✅ Peut être supprimée |
| user_activity_history | 5 | ✅ Peut être supprimée |
| account_deletion_log | 8 | ✅ Peut être supprimée |

**Total** : 16 tables ancien projet ⚠️

---

## 🎯 Recommandations

### Option 1 : Supprimer Toutes les Tables Ancien Projet (Recommandé)
Si vous ne travaillez **que** sur Taybo II et n'avez plus besoin des données de voyage :

**Avantages** :
- ✅ Table Editor Supabase plus propre
- ✅ Pas de confusion
- ✅ Moins de tables à gérer
- ✅ Meilleure performance

**Inconvénients** :
- ⚠️ Perte définitive des données de voyage
- ⚠️ Impossible de récupérer les données

### Option 2 : Garder les Tables (Si Données Importantes)
Si vous avez besoin de conserver les données de voyage :

**Avantages** :
- ✅ Données conservées
- ✅ Possibilité de réutiliser plus tard

**Inconvénients** :
- ⚠️ Confusion dans le Table Editor
- ⚠️ Plus de tables à gérer
- ⚠️ RLS à gérer sur deux projets

---

## 📝 Action Proposée

Je recommande de **supprimer toutes les tables de l'ancien projet** pour garder uniquement les tables Taybo II, sauf si vous avez explicitement besoin de conserver les données de voyage.

Souhaitez-vous que je supprime les tables de l'ancien projet ?

---

**Dernière mise à jour** : 15 janvier 2026
