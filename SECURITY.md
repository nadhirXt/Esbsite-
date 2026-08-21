# Politique de Sécurité — ESB Hub

## Signalement de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité dans ESB Hub, merci de **ne pas la divulguer publiquement** via les issues GitHub.

Contactez-nous directement par email en décrivant :
1. La nature de la vulnérabilité
2. Les étapes pour la reproduire
3. L'impact potentiel

Nous nous engageons à répondre dans les **48 heures**.

---

## Mesures de Sécurité en Place

### Application
- ✅ Authentification via Supabase Auth (JWT sécurisés)
- ✅ Row Level Security (RLS) activée sur toutes les tables
- ✅ Headers HTTP de sécurité (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Rate limiting sur les routes d'authentification (10 req/min/IP)
- ✅ Validation des entrées côté serveur
- ✅ Variables d'environnement jamais commitées sur GitHub

### Base de Données
- ✅ RLS activée sur toutes les tables Supabase
- ✅ Fonctions sécurisées avec `security definer`
- ✅ Pas de secrets dans le code source
- ✅ Service role key uniquement côté serveur

### Stockage (Backblaze B2)
- ✅ URLs signées (présignées) avec expiration
- ✅ Pas d'URLs publiques directes
- ✅ Credentials stockés uniquement en variables d'environnement

### GitHub
- ✅ `.env*` exclu du repository
- ✅ Scripts d'administration exclus
- ✅ Données privées (documents étudiants) exclues

---

## Variables d'Environnement Requises

Ces variables ne doivent **JAMAIS** être dans le code source :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      ← JAMAIS publique
B2_ACCESS_KEY_ID=
B2_SECRET_ACCESS_KEY=           ← JAMAIS publique
B2_BUCKET_NAME=
B2_ENDPOINT=
B2_REGION=
```

---

## Versions Supportées

| Version | Support Sécurité |
|---------|-----------------|
| latest  | ✅ Supportée    |
| < 1.0   | ❌ Non supportée |
