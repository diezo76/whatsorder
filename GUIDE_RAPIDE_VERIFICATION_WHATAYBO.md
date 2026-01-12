# Guide Rapide - Vérification Domaine Whataybo

## 🔒 Vérifier SSL

1. Ouvrir : **https://whataybo.com**
2. Cliquer sur le cadenas 🔒
3. Vérifier : ✅ "Connection is secure"
4. Certificat : Let's Encrypt (auto-renouvelé)

## ✅ Tester les URLs

- ✅ **https://whataybo.com** → Landing page
- ✅ **https://whataybo.com/login** → Page login
- ✅ **https://whataybo.com/register** → Page inscription
- ✅ **https://whataybo.com/dashboard** → Dashboard (après login)
- ✅ **https://whataybo.com/nile-bites** → Menu public
- ✅ **https://www.whataybo.com** → Redirige vers non-www

## 🔧 Variables d'Environnement Vercel

**Settings → Environment Variables** :

```env
# Si API séparée (sinon utilise automatiquement window.location.origin)
NEXT_PUBLIC_API_URL=https://whataybo.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle
```

**Note** : Le code utilise automatiquement `window.location.origin`, donc pas besoin de modifier si API sur même domaine.

## 📊 Analytics (Optionnel)

**Vercel Dashboard → Analytics → Enable Web Analytics**

OU

**Google Analytics** : Ajouter `NEXT_PUBLIC_GA_ID` dans les variables d'environnement

## ✅ Checklist Rapide

- [ ] HTTPS fonctionne (cadenas vert)
- [ ] Landing page s'affiche
- [ ] Login/Register fonctionnent
- [ ] Dashboard accessible
- [ ] Menu public fonctionne
- [ ] Redirection www fonctionne
- [ ] Variables d'environnement configurées
- [ ] Analytics activé (optionnel)

---

**Guide Complet** : Voir `GUIDE_VERIFICATION_DOMAINE_WHATAYBO.md`
