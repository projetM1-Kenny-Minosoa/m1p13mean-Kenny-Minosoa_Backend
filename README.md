# API - Projet MEAN

## Description
API backend pour une plateforme de centre commercial permettant la gestion de boutiques, produits, commandes et avis. Développé dans le cadre du projet MEAN Master 1 - Promotion 13.

## Équipe
- Kenny
- Minosoa

## Architecture
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- Architecture MVC

## Installation

### Prérequis
- Node.js (v16+)
- MongoDB (local ou Atlas)
- npm ou yarn

### Étapes d'installation

1. **Cloner le dépôt**
- git clone https://github.com/votre-repo/m1p13mean-kenny-minosoa_backend.git
- cd m1p13mean-kenny-minosoa_backend

2. **Installer les dépendances**
- npm install

3. Configurer les variables d'environnement
- dans .env :
    PORT=
    MONGO_URI=
    JWT_SECRET=
    JWT_EXPIRE=
    NODE_ENV=development ==> Éditez .env avec vos valeurs

4. Lancer le serveur
### Mode développement
- npm run dev

## Information :
### Rôles utilisateurs
- Admin: Gestion complète (utilisateurs, boutiques, modération)
- Vendeur: Gestion de sa boutique et ses produits
- Client: Achat, commandes, avis

