# 🎬 StreamZone - Site de Streaming en Ligne

Un site de streaming moderne avec films, séries et animés en utilisant de vraies APIs.

## 📋 Fonctionnalités

- **Films** : Affichage des films populaires avec TMDB API
- **Séries** : Affichage des séries populaires avec TMDB API  
- **Animés** : Affichage des animés avec Kitsu API
- **Recherche** : Recherche en temps réel
- **Authentification** : Inscription et connexion utilisateur
- **Favoris** : Ajout/suppression de contenus en favoris
- **Historique** : Suivi de votre historique de visionnage
- **Bande-annonce** : Lecteur YouTube intégré pour les trailers
- **Design** : Thème sombre style Netflix, responsive

## 🛠️ Technologies

- **Backend** : Node.js + Express
- **Base de données** : SQLite (via better-sqlite3)
- **Frontend** : HTML5, CSS3, JavaScript vanilla
- **APIs** :
  - [TMDB API](https://www.themoviedb.org/documentation/api) - Films et Séries
  - [Kitsu API](https://kitsu.docs.apiary.io/) - Animés
- **Authentification** : JWT (JSON Web Tokens)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <url-du-depot>
cd streamzone
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la clé API TMDB

1. Créez un compte sur [TMDB](https://www.themoviedb.org/)
2. Allez dans **Settings > API** et créez une clé API
3. Copiez le fichier `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
4. Éditez le fichier `.env` et ajoutez votre clé API :
   ```
   TMDB_API_KEY=votre_clé_api_ici
   ```

### 4. Démarrer le serveur

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

### 5. Ouvrir le navigateur

Allez sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
streamzone/
├── public/              # Fichiers statiques
│   ├── index.html       # Page d'accueil
│   ├── movies.html      # Page films
│   ├── anime.html       # Page animés
│   ├── series.html      # Page séries
│   ├── styles.css       # Styles CSS
│   ├── script.js        # JavaScript principal
│   └── api.js           # Client API
├── server.js            # Serveur Express
├── database.js          # Configuration SQLite
├── package.json         # Dépendances
├── .env                 # Variables d'environnement
└── README.md            # Documentation
```

## 🔑 API Keys

### TMDB API (films et séries)

1. Allez sur https://www.themoviedb.org/
2. Créez un compte gratuit
3. Allez dans **Settings > API**
4. Créez une nouvelle clé API
5. Copiez la clé dans votre fichier `.env`

### Kitsu API (animés)

L'API Kitsu est **publique** et ne nécessite pas de clé API !

## 📝 Routes API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil (authentifié)

### Films
- `GET /api/movies/popular` - Films populaires
- `GET /api/movies/trending` - Films tendance
- `GET /api/movies/:id` - Détails d'un film
- `GET /api/movies/search/:query` - Recherche

### Séries
- `GET /api/series/popular` - Séries populaires
- `GET /api/series/trending` - Séries tendance
- `GET /api/series/:id` - Détails d'une série

### Animés
- `GET /api/anime/popular` - Animés populaires
- `GET /api/anime/trending` - Animés tendance
- `GET /api/anime/:id` - Détails d'un anime
- `GET /api/anime/search/:query` - Recherche

### Utilisateur (authentifié)
- `POST /api/favorites` - Ajouter aux favoris
- `GET /api/favorites` - Liste des favoris
- `DELETE /api/favorites/:id` - Supprimer un favori
- `POST /api/history` - Ajouter à l'historique
- `GET /api/history` - Historique de visionnage

## 🎨 Personnalisation

### Changer le thème

Éditez les variables CSS dans `public/styles.css` :

```css
:root {
    --primary: #e50914;        /* Couleur principale */
    --primary-hover: #b20710;  /* Couleur au survol */
    --bg-dark: #141414;        /* Couleur de fond */
    --bg-card: #1a1a2e;        /* Couleur des cartes */
}
```

## 🐛 Dépannage

### Erreur "Failed to fetch" pour TMDB

- Vérifiez que votre clé API TMDB est valide
- Vérifiez que le fichier `.env` est bien configuré

### Erreur de connexion à la base de données

- Supprimez le fichier `streamzone.db` et redémarrez le serveur

## 📄 Licence

Ce projet est à but éducatif. Les images et données proviennent de TMDB et Kitsu.

---

**Développé avec ❤️ pour les amateurs de streaming**
