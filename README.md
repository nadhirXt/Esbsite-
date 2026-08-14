<div align="center">

<br/>

<img src="https://upload.wikimedia.org/wikipedia/fr/a/ab/Logo_esb_algerie.png" alt="ESB Logo" width="140" />

<h1>🏛️ ESB Hub — Portail Numérique de l'ESB</h1>

<p><strong>Plateforme web centralisée pour les étudiants, professeurs et Alumni de l'École Supérieure de Banque d'Algérie</strong></p>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Backblaze B2](https://img.shields.io/badge/Backblaze_B2-Storage-FF0000?style=for-the-badge&logo=backblaze&logoColor=white)](https://www.backblaze.com/)

<br/>

![Status](https://img.shields.io/badge/Status-En%20Développement%20Actif-success?style=flat-square)
![License](https://img.shields.io/badge/License-Projet%20Académique-blue?style=flat-square)
![Version](https://img.shields.io/badge/Version-0.1.0-orange?style=flat-square)

<br/>

</div>

---

## 📖 À propos du projet

**ESB Hub** est une application web moderne conçue spécifiquement pour la communauté de l'**École Supérieure de Banque (ESB)** d'Algérie. Elle centralise en un seul endroit toutes les ressources académiques, crée un réseau solide entre les générations et simplifie la gestion administrative.

> Ce projet est développé dans le cadre d'une initiative d'amélioration des outils numériques au sein de l'ESB. Il est actuellement en cours de développement et de présentation à la direction.

### 🎯 Objectifs

- **Centraliser** toutes les ressources pédagogiques (documents, cours, mémoires)
- **Connecter** la communauté ESB via un annuaire intelligent
- **Simplifier** la gestion administrative pour les équipes
- **Moderniser** l'expérience numérique des étudiants de l'ESB

---

## ✨ Fonctionnalités

### 👤 Authentification & Profils
- Inscription multi-profils : Étudiant ESB, Autre étudiant, Professeur, Alumni
- Connexion sécurisée via **Supabase Auth**
- Réinitialisation de mot de passe par email
- Profil personnalisable : bio, photo, liens LinkedIn, compétences

### 📚 Bibliothèque Virtuelle
- Documents organisés par cycles : **Licence**, **DSEB**, **Master**
- Catégories : Comptabilité, Finance, Droit, Économie...
- Bibliothèque de livres, mémoires et rapports de stage
- Prévisualisation de documents intégrée (Office, PDF)
- Stockage sécurisé via **Backblaze B2**

### 🗂️ Annuaire Réseau
- Recherche avancée d'étudiants, professeurs et Alumni
- Filtres par cycle, promotion, spécialité
- Profils publics avec liens sociaux

### 👑 Espace Administration
- Tableau de bord avec statistiques en temps réel
- Gestion des utilisateurs (validation, modification des rôles)
- Upload et gestion des documents
- Gestion des liens utiles
- Filtres avancés par cycle et statut

---

## 🏗️ Architecture du Projet

```
esb-app/
│
├── 📁 app/                          # Routes & Pages (Next.js App Router)
│   ├── 📁 (auth)/                   # Groupe : Authentification
│   │   ├── login/                   # Page de connexion
│   │   ├── register/                # Page d'inscription
│   │   └── reset-password/          # Réinitialisation du mot de passe
│   │
│   ├── 📁 (dashboard)/              # Groupe : Espace Étudiant Connecté
│   │   └── dashboard/
│   │       ├── page.tsx             # Tableau de bord principal
│   │       ├── profile/             # Gestion du profil
│   │       ├── annuaire/            # Annuaire de la communauté
│   │       ├── bibliotheque/        # Bibliothèque (accueil)
│   │       ├── licence/             # Documents Licence
│   │       ├── dseb/                # Documents DSEB
│   │       ├── master/              # Documents Master
│   │       └── ressources/          # Ressources générales
│   │
│   └── 📁 (admin)/                  # Groupe : Espace Administrateur
│       └── admin/
│           ├── page.tsx             # Dashboard admin
│           ├── documents/           # Gestion des documents
│           ├── etudiants/           # Gestion des utilisateurs
│           ├── liens/               # Gestion des liens utiles
│           └── upload/              # Upload de fichiers
│
├── 📁 components/                   # Composants UI Réutilisables
│   ├── admin/                       # Composants spécifiques à l'admin
│   ├── dashboard/                   # Composants du tableau de bord
│   ├── public/                      # Composants publics
│   └── ui/                          # Composants UI génériques
│
├── 📁 lib/                          # Utilitaires & Configuration
├── 📁 supabase/                     # Scripts SQL & Migrations
│   ├── schema.sql                   # Schéma principal de la BDD
│   └── ESB_Master_Update.sql        # Migrations & mises à jour
│
├── 📁 public/                       # Fichiers statiques
├── 📁 scripts/                      # Scripts de maintenance
├── .env.local                       # Variables d'environnement (non versionné)
├── next.config.ts                   # Configuration Next.js
└── package.json                     # Dépendances npm
```

---

## 🛠️ Stack Technique

| Technologie | Version | Rôle |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 | Framework React (App Router, SSR) |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Langage typé |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styling utilitaire |
| [Supabase](https://supabase.com/) | Latest | BDD PostgreSQL + Auth + RLS |
| [Backblaze B2](https://www.backblaze.com/) | — | Stockage des fichiers (S3-compatible) |
| [Lucide React](https://lucide.dev/) | Latest | Icônes SVG |
| [AWS SDK v3](https://aws.amazon.com/sdk-for-javascript/) | 3 | Client S3 pour Backblaze B2 |

---

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** v18 ou supérieur → [Télécharger](https://nodejs.org/)
- Un compte **[Supabase](https://supabase.com/)** (gratuit)
- Un compte **[Backblaze B2](https://www.backblaze.com/)** pour le stockage

---

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/nadhirXt/Esbsite-.git
cd Esbsite-/esb-app
```

---

### Étape 2 — Installer les dépendances

```bash
npm install
```

---

### Étape 3 — Configuration de Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com/)
2. Dans **SQL Editor**, exécuter le fichier [`supabase/schema.sql`](./supabase/schema.sql)
3. Ensuite exécuter [`supabase/ESB_Master_Update.sql`](./supabase/ESB_Master_Update.sql)
4. Dans **Authentication → URL Configuration** :
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : `http://localhost:3000/**`

---

### Étape 4 — Variables d'environnement

Créez un fichier `.env.local` à la racine du dossier `esb-app/` :

```env
# ─── Supabase ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ─── Backblaze B2 (Stockage de fichiers) ─────────────────────
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_BUCKET_NAME=nom-de-votre-bucket
B2_KEY_ID=votre_key_id
B2_APP_KEY=votre_app_key
```

> ⚠️ **Important** : Ne jamais committer le fichier `.env.local`. Il est déjà inclus dans `.gitignore`.

---

### Étape 5 — Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

### Étape 6 — Créer le premier compte administrateur

Après avoir créé un compte via l'interface, exécutez dans **Supabase SQL Editor** :

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'votre-user-id';
```

---

## 📊 Schéma de la Base de Données

```
auth.users (Supabase Auth)
    │
    └── public.profiles          ← Infos utilisateur + rôle
         ├── id (uuid, FK)
         ├── full_name
         ├── role                 ('student' | 'admin')
         ├── user_type            ('etudiant_esb' | 'professeur' | 'ancien' | ...)
         ├── cycle                ('licence' | 'dseb' | 'master')
         └── linkedin_url, bio, skills...

public.documents                 ← Ressources pédagogiques
    ├── id, title, file_path
    ├── cycle, category
    └── created_at

public.useful_links              ← Liens utiles
    ├── id, title, url
    └── category, created_at
```

**Sécurité RLS** : Toutes les tables sont protégées par Row Level Security. Les étudiants ne voient que ce qui leur est autorisé ; seuls les admins peuvent modifier les données sensibles.

---

## 🔒 Sécurité

- ✅ **Row Level Security (RLS)** sur toutes les tables Supabase
- ✅ **Variables d'environnement** pour toutes les clés sensibles
- ✅ **Middleware d'authentification** Next.js pour protéger les routes
- ✅ **Groupes de routes** séparés : `(auth)`, `(dashboard)`, `(admin)`
- ✅ **Vérification du rôle admin** côté serveur avant chaque action admin

---

## 📝 Scripts Disponibles

```bash
npm run dev        # Démarrer le serveur de développement (localhost:3000)
npm run build      # Compiler l'application pour la production
npm run start      # Démarrer en mode production (après build)
npm run lint       # Vérifier les erreurs ESLint
```

---

## 🗺️ Roadmap

- [x] Authentification multi-profils
- [x] Tableau de bord étudiant
- [x] Bibliothèque de documents (Licence, DSEB, Master)
- [x] Annuaire réseau avec filtres
- [x] Espace administration complet
- [x] Stockage fichiers via Backblaze B2
- [x] Prévisualisation de documents
- [x] Design responsive (mobile, tablette, desktop)
- [ ] Notifications en temps réel
- [ ] Messagerie interne entre membres
- [ ] Déploiement en production (Vercel)

---

## 👨‍💻 Développeur

<div align="center">

**Mohamed Nadhir Benelhadj**  
*Étudiant & Développeur Web Full-Stack*

[![GitHub](https://img.shields.io/badge/GitHub-nadhirXt-181717?style=for-the-badge&logo=github)](https://github.com/nadhirXt)

</div>

---

<div align="center">

*Développé avec ❤️ pour la communauté de l'École Supérieure de Banque (ESB) — Algérie*

<br/>

<img src="https://upload.wikimedia.org/wikipedia/fr/a/ab/Logo_esb_algerie.png" alt="ESB" width="60" />

</div>
