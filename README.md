<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/fr/a/ab/Logo_esb_algerie.png" alt="ESB Logo" width="120" />
  <h1>ESB Hub</h1>
  <p><strong>Portail Étudiant & Alumni de l'École Supérieure de Banque (ESB)</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

## 📖 À propos du projet

**ESB Hub** est une plateforme moderne et centralisée conçue exclusivement pour les étudiants, les professeurs, et les anciens élèves (Alumni) de l'**École Supérieure de Banque (ESB)**. 

Le but de cette plateforme est de faciliter le quotidien académique, de créer un réseau fort entre les générations d'étudiants (Annuaire) et de centraliser toutes les ressources pédagogiques (Bibliothèque).

## ✨ Fonctionnalités Principales

- 🔐 **Authentification Sécurisée :** Inscription et connexion gérées via Supabase Auth (support des différents profils : Étudiants ESB, Autres étudiants, Professeurs, Alumni).
- 🧑‍🎓 **Profil Personnalisable :** Possibilité de modifier ses informations, ajouter ses liens sociaux (LinkedIn, etc.), sa bio et ses compétences.
- 📚 **Bibliothèque Virtuelle :** Un espace de partage de documents organisé par cycles (Licence, DSEB, Master).
- 📖 **Annuaire Réseau :** Retrouvez vos camarades de promotion, des professeurs ou d'anciens ESBistes grâce à un annuaire intelligent.
- 👑 **Espace Administration :** Un tableau de bord réservé aux administrateurs pour gérer les utilisateurs, les accès et le contenu de la plateforme.

## 📂 Structure du Répertoire

L'architecture du projet suit les meilleures pratiques de **Next.js App Router** :

```text
esb-app/
├── app/                  # Routes et pages Next.js (App Router)
│   ├── (auth)/           # Pages d'authentification (Login, Register, Reset)
│   ├── (dashboard)/      # Espace connecté (Tableau de bord, Profil, Annuaire)
│   └── (admin)/          # Espace d'administration
├── components/           # Composants UI réutilisables (Boutons, Cartes, etc.)
├── lib/                  # Utilitaires et configuration (Supabase, helpers)
├── public/               # Fichiers statiques (Images, icônes)
├── scripts/              # Scripts de maintenance et d'import (Base de données)
└── supabase/             # Fichiers de migration et de configuration Supabase SQL
```

## 🚀 Installation & Démarrage

### Prérequis

- [Node.js](https://nodejs.org/en/) (v18 ou supérieur)
- Un compte [Supabase](https://supabase.com/) pour la base de données et l'authentification.

### 1. Cloner le dépôt

```bash
git clone https://github.com/nadhirXt/Esbsite-.git
cd esb-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet et ajoutez-y vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## 🛠️ Stack Technique

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Langage:** [TypeScript](https://www.typescriptlang.org/)
- **Style:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Base de données:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Icônes:** [Lucide React](https://lucide.dev/)

---
<div align="center">
  <i>Développé avec passion pour l'ESB.</i>
</div>
