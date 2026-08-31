require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { initDatabase, db: dbWrapper } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
});
app.use('/api/', limiter);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'streamzone_secret_key_2024';

// ===== TMDB (optional - still supported if user adds key) =====
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const hasTMDBKey = TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE' && TMDB_API_KEY.length > 10;

console.log(`🔑 TMDB API: ${hasTMDBKey ? 'Configured ✓' : 'Not configured — using free APIs (TVmaze + Jikan)'}`);

// ===== Helper Functions =====

// Convert TVmaze show/movie to our format
function formatTVMazeShow(show) {
    const image = show.image?.original || show.image?.medium || `https://via.placeholder.com/500x750?text=${encodeURIComponent(show.name)}`;
    return {
        id: show.id,
        title: show.name,
        name: show.name,
        overview: show.summary?.replace(/<[^>]*>/g, '') || 'Pas de description disponible',
        poster_url: image,
        poster_path: show.image?.original ? show.image.original.replace('https://image.tmdb.org/t/p/', '') : null,
        backdrop_url: show.image?.original || null,
        vote_average: show.rating?.average || 0,
        release_date: show.premiered || show.firstAired || 'N/A',
        first_air_date: show.premiered || show.firstAired || 'N/A',
        genres: show.genres || [],
        genre_ids: [],
        type: show.type || 'Scripted',
        status: show.status || 'Running',
        language: show.language || 'English',
        runtime: show.runtime || show.averageRuntime || 0,
        network: show.network?.name || show.webChannel?.name || 'N/A',
        trailer_url: show.officialSite || null,
        embed_url: show.officialSite || show.url || null,
        source: 'tvmaze'
    };
}

// Convert Jikan anime to our format
function formatJikanAnime(anime) {
    const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || `https://via.placeholder.com/500x750?text=${encodeURIComponent(anime.title)}`;
    return {
        id: anime.mal_id,
        title: anime.title || anime.title_english,
        title_jp: anime.title_japanese,
        overview: anime.synopsis || 'Pas de synopsis disponible',
        poster_url: image,
        poster_path: null,
        backdrop_url: anime.trailer?.images?.maximum_image_url || null,
        vote_average: anime.score || 0,
        release_date: anime.aired?.from?.split('T')[0] || anime.year || 'N/A',
        genres: anime.genres?.map(g => g.name) || [],
        genre_ids: anime.genres?.map(g => g.mal_id) || [],
        status: anime.status || 'N/A',
        episodeCount: anime.episodes || 0,
        episodeLength: anime.duration || 0,
        rating: anime.rating || 'N/A',
        studio: anime.studios?.map(s => s.name).join(', ') || 'N/A',
        trailer_url: anime.trailer?.url || null,
        trailer_embed: anime.trailer?.embed_url || null,
        source: 'jikan',
        mal_url: anime.url
    };
}

// Convert Kitsu anime to our format (keep existing logic)
function formatKitsuAnime(item) {
    return {
        id: item.id,
        title: item.attributes.canonicalTitle || item.attributes.titles.en_jp,
        title_jp: item.attributes.titles.ja_jp,
        overview: item.attributes.synopsis,
        averageRating: item.attributes.averageRating,
        release_date: item.attributes.startDate || 'N/A',
        status: item.attributes.status,
        episodeCount: item.attributes.episodeCount,
        episodeLength: item.attributes.episodeLength,
        ageRating: item.attributes.ageRating,
        poster_url: item.attributes.posterImage?.original || item.attributes.posterImage?.large,
        cover_url: item.attributes.coverImage?.original,
        youtubeVideoId: item.attributes.youtubeVideoId,
        trailer_url: item.attributes.youtubeVideoId ? `https://www.youtube.com/watch?v=${item.attributes.youtubeVideoId}` : null,
        source: 'kitsu'
    };
}

// Generic format for TMDB items
function formatTMDBItem(item, type) {
    return {
        ...item,
        poster_url: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : `https://via.placeholder.com/500x750?text=${encodeURIComponent(item.title || item.name)}`,
        backdrop_url: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
        source: 'tmdb'
    };
}

// ===== Middleware d'authentification =====
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide' });
    }
};

// ===== Routes Auth =====

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const existingUser = dbWrapper.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = dbWrapper.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashedPassword);

        const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Compte créé avec succès',
            token,
            user: { id: result.lastInsertRowid, username, email }
        });
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const user = dbWrapper.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Connexion réussie',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/auth/profile', authMiddleware, (req, res) => {
    try {
        const user = dbWrapper.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== Routes Films =====

app.get('/api/movies/popular', async (req, res) => {
    try {
        // Priority: TMDB if configured, else TVmaze
        if (hasTMDBKey) {
            const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${req.query.page || 1}`);
            const data = await response.json();
            const movies = data.results?.map(m => formatTMDBItem(m, 'movie')) || [];
            return res.json({ results: movies, total_pages: data.total_pages, source: 'tmdb' });
        }

        // TVmaze: fetch popular shows
        const page = parseInt(req.query.page) || 0;
        const response = await fetch('https://api.tvmaze.com/shows');
        const allShows = await response.json();
        
        // Sort by rating and get top shows
        const sorted = allShows
            .filter(s => s.rating?.average > 0)
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        
        const movies = sorted.slice(page * 20, (page + 1) * 20).map(formatTVMazeShow);
        
        res.json({ results: movies, total_pages: Math.ceil(sorted.length / 20), source: 'tvmaze' });
    } catch (error) {
        console.error('Erreur movies:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des films' });
    }
});

app.get('/api/movies/trending', async (req, res) => {
    try {
        if (hasTMDBKey) {
            const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=fr-FR`);
            const data = await response.json();
            const movies = data.results?.map(m => formatTMDBItem(m, 'movie')) || [];
            return res.json({ results: movies, source: 'tmdb' });
        }

        const response = await fetch('https://api.tvmaze.com/shows');
        const allShows = await response.json();
        const sorted = allShows
            .filter(s => s.rating?.average > 0)
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        
        const trending = sorted.slice(0, 12).map(formatTVMazeShow);
        res.json({ results: trending, source: 'tvmaze' });
    } catch (error) {
        console.error('Erreur trending:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    try {
        if (hasTMDBKey) {
            const response = await fetch(`${TMDB_BASE_URL}/movie/${req.params.id}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=videos,credits,similar`);
            const data = await response.json();
            data.poster_url = data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null;
            data.backdrop_url = data.backdrop_path ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}` : null;
            
            if (data.videos?.results) {
                const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                data.trailer_url = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
            }
            if (data.similar?.results) {
                data.similar.results = data.similar.results.slice(0, 10).map(m => formatTMDBItem(m, 'movie'));
            }
            return res.json(data);
        }

        const response = await fetch(`https://api.tvmaze.com/shows/${req.params.id}`);
        if (!response.ok) return res.status(404).json({ error: 'Film non trouvé' });
        const show = await response.json();
        res.json(formatTVMazeShow(show));
    } catch (error) {
        console.error('Erreur movie detail:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/movies/search/:query', async (req, res) => {
    try {
        if (hasTMDBKey) {
            const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(req.params.query)}`);
            const data = await response.json();
            const movies = data.results?.map(m => formatTMDBItem(m, 'movie')) || [];
            return res.json({ results: movies, source: 'tmdb' });
        }

        const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(req.params.query)}`);
        const data = await response.json();
        const movies = data.map(item => formatTVMazeShow(item.show)).slice(0, 20);
        res.json({ results: movies, source: 'tvmaze' });
    } catch (error) {
        console.error('Erreur search movies:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== Routes Séries =====

app.get('/api/series/popular', async (req, res) => {
    try {
        if (hasTMDBKey) {
            const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${req.query.page || 1}`);
            const data = await response.json();
            const series = data.results?.map(s => formatTMDBItem(s, 'series')) || [];
            return res.json({ results: series, total_pages: data.total_pages, source: 'tmdb' });
        }

        const response = await fetch('https://api.tvmaze.com/shows');
        const allShows = await response.json();
        const sorted = allShows
            .filter(s => s.rating?.average > 0 && s.type === 'Scripted')
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        
        const series = sorted.slice(0, 20).map(formatTVMazeShow);
        res.json({ results: series, source: 'tvmaze' });
    } catch (error) {
        console.error('Erreur series:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/series/trending', async (req, res) => {
    try {
        if (hasTMDBKey) {
            const response = await fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&language=fr-FR`);
            const data = await response.json();
            const series = data.results?.map(s => formatTMDBItem(s, 'series')) || [];
            return res.json({ results: series, source: 'tmdb' });
        }

        const response = await fetch('https://api.tvmaze.com/shows');
        const allShows = await response.json();
        const sorted = allShows
            .filter(s => s.rating?.average > 0 && s.type === 'Scripted')
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        
        const series = sorted.slice(0, 12).map(formatTVMazeShow);
        res.json({ results: series, source: 'tvmaze' });
    } catch (error) {
        console.error('Erreur series trending:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/series/:id', async (req, res) => {
    try {
        if (hasTMDBKey) {
            const response = await fetch(`${TMDB_BASE_URL}/tv/${req.params.id}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=videos,credits,similar`);
            const data = await response.json();
            data.poster_url = data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null;
            data.backdrop_url = data.backdrop_path ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}` : null;
            
            if (data.videos?.results) {
                const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                data.trailer_url = trailer ? `https://api.youtube.com/embed/${trailer.key}` : null;
            }
            if (data.similar?.results) {
                data.similar.results = data.similar.results.slice(0, 10).map(s => formatTMDBItem(s, 'series'));
            }
            return res.json(data);
        }

        const response = await fetch(`https://api.tvmaze.com/shows/${req.params.id}`);
        if (!response.ok) return res.status(404).json({ error: 'Série non trouvée' });
        const show = await response.json();
        res.json(formatTVMazeShow(show));
    } catch (error) {
        console.error('Erreur series detail:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== Routes Animés (Jikan + Kitsu) =====

app.get('/api/anime/popular', async (req, res) => {
    try {
        // Try Jikan first (MyAnimeList data - higher quality)
        const jikanResponse = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=1&limit=20');
        if (jikanResponse.ok) {
            const jikanData = await jikanResponse.json();
            if (jikanData.data && jikanData.data.length > 0) {
                const anime = jikanData.data.map(formatJikanAnime);
                return res.json({ results: anime, source: 'jikan' });
            }
        }
    } catch (error) {
        console.log('Jikan unavailable, falling back to Kitsu');
    }

    try {
        // Fallback to Kitsu
        const response = await fetch(
            'https://kitsu.io/api/edge/anime?sort=-averageRating&page[limit]=20&page[offset]=0',
            { headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' } }
        );
        const data = await response.json();
        const anime = data.data?.map(formatKitsuAnime) || [];
        res.json({ results: anime, source: 'kitsu' });
    } catch (error) {
        console.error('Erreur anime:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des animés' });
    }
});

app.get('/api/anime/trending', async (req, res) => {
    try {
        const jikanResponse = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&page=1&limit=20');
        if (jikanResponse.ok) {
            const jikanData = await jikanResponse.json();
            if (jikanData.data && jikanData.data.length > 0) {
                const anime = jikanData.data.map(formatJikanAnime);
                return res.json({ results: anime, source: 'jikan' });
            }
        }
    } catch (error) {
        console.log('Jikan unavailable, falling back to Kitsu');
    }

    try {
        const response = await fetch(
            'https://kitsu.io/api/edge/anime?sort=-createdAt&page[limit]=20',
            { headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' } }
        );
        const data = await response.json();
        const anime = data.data?.map(formatKitsuAnime) || [];
        res.json({ results: anime, source: 'kitsu' });
    } catch (error) {
        console.error('Erreur anime trending:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/anime/search/:query', async (req, res) => {
    try {
        const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(req.params.query)}&limit=20`);
        if (jikanResponse.ok) {
            const jikanData = await jikanResponse.json();
            if (jikanData.data && jikanData.data.length > 0) {
                const anime = jikanData.data.map(formatJikanAnime);
                return res.json({ results: anime, source: 'jikan' });
            }
        }
    } catch (error) {
        console.log('Jikan unavailable for search, falling back to Kitsu');
    }

    try {
        const response = await fetch(
            `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(req.params.query)}&page[limit]=20`,
            { headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' } }
        );
        const data = await response.json();
        const anime = data.data?.map(formatKitsuAnime) || [];
        res.json({ results: anime, source: 'kitsu' });
    } catch (error) {
        console.error('Erreur anime search:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/anime/:id', async (req, res) => {
    try {
        // Check if it's a Jikan ID (MAL ID format)
        const response = await fetch(`https://api.jikan.moe/v4/anime/${req.params.id}/full`);
        if (response.ok) {
            const data = await response.json();
            if (data.data) {
                return res.json(formatJikanAnime(data.data));
            }
        }
    } catch (error) {
        console.log('Jikan unavailable for detail, falling back to Kitsu');
    }

    try {
        const response = await fetch(
            `https://kitsu.io/api/edge/anime/${req.params.id}`,
            { headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' } }
        );
        const data = await response.json();
        if (data.data) {
            return res.json(formatKitsuAnime(data.data));
        }
    } catch (error) {
        console.error('Erreur anime detail:', error);
    }
    
    res.status(404).json({ error: 'Anime non trouvé' });
});

// ===== Routes Genre =====

app.get('/api/genres/movie', async (req, res) => {
    if (hasTMDBKey) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=fr-FR`);
            const data = await response.json();
            return res.json(data);
        } catch (error) {
            console.error('Erreur TMDB genres:', error);
        }
    }
    res.json({ genres: [
        { id: 1, name: "Action" }, { id: 2, name: "Aventure" }, { id: 3, name: "Animation" },
        { id: 4, name: "Comédie" }, { id: 5, name: "Crime" }, { id: 6, name: "Drame" },
        { id: 7, name: "Fantastique" }, { id: 8, name: "Horreur" }, { id: 9, name: "Mystère" },
        { id: 10, name: "Romance" }, { id: 11, name: "Science-Fiction" }, { id: 12, name: "Thriller" }
    ]});
});

app.get('/api/genres/tv', async (req, res) => {
    if (hasTMDBKey) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=fr-FR`);
            const data = await response.json();
            return res.json(data);
        } catch (error) {
            console.error('Erreur TMDB TV genres:', error);
        }
    }
    res.json({ genres: [
        { id: 1, name: "Action & Aventure" }, { id: 2, name: "Animation" },
        { id: 3, name: "Comédie" }, { id: 4, name: "Crime" }, { id: 5, name: "Documentaire" },
        { id: 6, name: "Drame" }, { id: 7, name: "Famille" }, { id: 8, name: "Mystère" },
        { id: 9, name: "Science-Fiction" }, { id: 10, name: "Thriller" }
    ]});
});

// ===== Routes Favoris =====

app.post('/api/favorites', authMiddleware, (req, res) => {
    try {
        const { content_id, content_type, title, poster_url } = req.body;
        
        const existing = dbWrapper.prepare(
            'SELECT id FROM favorites WHERE user_id = ? AND content_id = ? AND content_type = ?'
        ).get(req.userId, content_id, content_type);
        
        if (existing) {
            return res.status(400).json({ error: 'Déjà dans les favoris' });
        }

        const result = dbWrapper.prepare(
            'INSERT INTO favorites (user_id, content_id, content_type, title, poster_url) VALUES (?, ?, ?, ?, ?)'
        ).run(req.userId, content_id, content_type, title, poster_url);

        res.status(201).json({ message: 'Ajouté aux favoris', id: result.lastInsertRowid });
    } catch (error) {
        console.error('Erreur favoris:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/favorites', authMiddleware, (req, res) => {
    try {
        const favorites = dbWrapper.prepare(
            'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
        ).all(req.userId);
        
        res.json({ favorites });
    } catch (error) {
        console.error('Erreur favoris:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.delete('/api/favorites/:id', authMiddleware, (req, res) => {
    try {
        dbWrapper.prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
        res.json({ message: 'Supprimé des favoris' });
    } catch (error) {
        console.error('Erreur favoris:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== Routes Historique =====

app.post('/api/history', authMiddleware, (req, res) => {
    try {
        const { content_id, content_type, title, poster_url } = req.body;
        
        const existing = dbWrapper.prepare(
            'SELECT id FROM history WHERE user_id = ? AND content_id = ? AND content_type = ?'
        ).get(req.userId, content_id, content_type);
        
        if (existing) {
            dbWrapper.prepare('UPDATE history SET watched_at = CURRENT_TIMESTAMP WHERE id = ?').run(existing.id);
        } else {
            dbWrapper.prepare(
                'INSERT INTO history (user_id, content_id, content_type, title, poster_url) VALUES (?, ?, ?, ?, ?)'
            ).run(req.userId, content_id, content_type, title, poster_url);
        }

        res.json({ message: 'Historique mis à jour' });
    } catch (error) {
        console.error('Erreur historique:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/history', authMiddleware, (req, res) => {
    try {
        const history = dbWrapper.prepare(
            'SELECT * FROM history WHERE user_id = ? ORDER BY watched_at DESC LIMIT 50'
        ).all(req.userId);
        
        res.json({ history });
    } catch (error) {
        console.error('Erreur historique:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== Routes Listes personnalisées =====

app.post('/api/lists', authMiddleware, (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Le nom est requis' });

        const result = dbWrapper.prepare('INSERT INTO custom_lists (user_id, name) VALUES (?, ?)').run(req.userId, name);
        res.status(201).json({ message: 'Liste créée', id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/lists', authMiddleware, (req, res) => {
    try {
        const lists = dbWrapper.prepare('SELECT * FROM custom_lists WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
        res.json({ lists });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/lists/:id/items', authMiddleware, (req, res) => {
    try {
        const { content_id, content_type, title, poster_url } = req.body;
        const result = dbWrapper.prepare(
            'INSERT INTO list_items (list_id, content_id, content_type, title, poster_url) VALUES (?, ?, ?, ?, ?)'
        ).run(req.params.id, content_id, content_type, title, poster_url);
        res.status(201).json({ message: 'Ajouté à la liste', id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/lists/:id', authMiddleware, (req, res) => {
    try {
        const list = dbWrapper.prepare('SELECT * FROM custom_lists WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
        if (!list) return res.status(404).json({ error: 'Liste non trouvée' });

        const items = dbWrapper.prepare('SELECT * FROM list_items WHERE list_id = ?').all(req.params.id);
        res.json({ list, items });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.delete('/api/lists/:id/items/:itemId', authMiddleware, (req, res) => {
    try {
        dbWrapper.prepare('DELETE FROM list_items WHERE id = ? AND list_id = ?').run(req.params.itemId, req.params.id);
        res.json({ message: 'Supprimé de la liste' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== Unified Search =====

app.get('/api/search/:query', async (req, res) => {
    const query = encodeURIComponent(req.params.query);
    const results = { movies: [], anime: [], series: [] };

    try {
        // Search movies/series on TVmaze
        const tvmazeResponse = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
        const tvmazeData = await tvmazeResponse.json();
        tvmazeData.forEach(item => {
            const formatted = formatTVMazeShow(item.show);
            if (item.show.type === 'Scripted') {
                results.series.push(formatted);
            } else {
                results.movies.push(formatted);
            }
        });
    } catch (error) {
        console.log('TVmaze search error');
    }

    try {
        // Search anime on Jikan
        const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`);
        if (jikanResponse.ok) {
            const jikanData = await jikanResponse.json();
            results.anime = jikanData.data?.map(formatJikanAnime) || [];
        }
    } catch (error) {
        console.log('Jikan search error');
    }

    res.json(results);
});

// ===== Servir le frontend =====
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== Démarrer le serveur =====
async function startServer() {
    await initDatabase();
    app.listen(PORT, () => {
        console.log(`🚀 StreamZone server running on http://localhost:${PORT}`);
        console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
        console.log(`📺 APIs: TVmaze (movies/series) + Jikan/Kitsu (anime)`);
        if (!hasTMDBKey) {
            console.log(`💡 Tip: Add TMDB_API_KEY to .env for even more content`);
        }
    });
}

startServer();
