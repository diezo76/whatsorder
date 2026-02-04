# Configuration Vercel pour Supabase Taybo II

## 🎯 Objectif
Connecter l'application Vercel au projet Supabase **Taybo II** (`yqpbgdowfycuhixpxygr`).

## 📋 Variables d'environnement à configurer dans Vercel

### Étapes :

1. **Allez sur Vercel Dashboard** : https://vercel.com/diiezos-projects/whatsorder-web/settings/environment-variables

2. **Vérifiez/Modifiez ces variables** :

### Variables Supabase (Taybo II)

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yqpbgdowfycuhixpxygr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcGJnZG93ZnljdWhpeHB4eWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDQ0MDYsImV4cCI6MjA3OTQyMDQwNn0.ZLFrpvbcmzap4qo7Lge9wcR3_fkygRBTSzgSxBkLk08` |

### Variable DATABASE_URL (Prisma)

Pour obtenir la `DATABASE_URL`, allez dans :
- **Supabase Dashboard** > Taybo II > Settings > Database > Connection string (URI)

Le format est :
```
postgresql://postgres.[PROJECT-REF]:[VOTRE-MOT-DE-PASSE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Ou** (connexion directe) :
```
postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.yqpbgdowfycuhixpxygr.supabase.co:5432/postgres
```

### Variable SUPABASE_SERVICE_ROLE_KEY

Pour obtenir cette clé :
- **Supabase Dashboard** > Taybo II > Settings > API > service_role (secret key)

⚠️ **ATTENTION** : Cette clé est secrète et bypass les politiques RLS !

## 🔄 Après modification

1. **Redéployez** l'application sur Vercel (cliquez "Redeploy" sur le dernier déploiement)

2. **Créez le restaurant "Doctor Grill"** via l'interface de l'application ou via l'onboarding

## 🧪 Test

Après redéploiement, vérifiez que :
- La page d'accueil fonctionne
- Vous pouvez vous connecter/créer un compte
- Le restaurant "Doctor Grill" apparaît

## 📌 Notes importantes

- Le projet Supabase MCP est bien connecté à "Taybo II" (`yqpbgdowfycuhixpxygr`)
- Toutes les tables nécessaires existent déjà
- RLS est activé avec les bonnes politiques

---

Date : 2026-02-04
Projet Supabase : Taybo II (`yqpbgdowfycuhixpxygr`)
