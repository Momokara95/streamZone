// ===== StreamZone API Client =====
// For Netlify Functions deployment

const API_BASE = '/.netlify/functions';

// ===== Fonctions utilitaires =====

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===== Movies API =====

const moviesAPI = {
    async getPopular(page = 1) {
        return fetchAPI(`/movies/popular?page=${page}`);
    },

    async getTrending() {
        return fetchAPI('/movies/trending');
    },

    async getById(id) {
        return fetchAPI(`/movies/${id}`);
    },

    async search(query) {
        return fetchAPI(`/movies/search/${encodeURIComponent(query)}`);
    }
};

// ===== Series API =====

const seriesAPI = {
    async getPopular(page = 1) {
        return fetchAPI(`/series/popular?page=${page}`);
    },

    async getTrending() {
        return fetchAPI('/series/trending');
    },

    async getById(id) {
        return fetchAPI(`/series/${id}`);
    }
};

// ===== Anime API =====

const animeAPI = {
    async getPopular() {
        return fetchAPI('/anime/popular');
    },

    async getTrending() {
        return fetchAPI('/anime/trending');
    },

    async getById(id) {
        return fetchAPI(`/anime/${id}`);
    },

    async search(query) {
        return fetchAPI(`/anime/search/${encodeURIComponent(query)}`);
    }
};

// ===== Search API (Unified) =====

const searchAPI = {
    async searchAll(query) {
        return fetchAPI(`/search/${encodeURIComponent(query)}`);
    }
};

// ===== Favorites API (localStorage - no auth needed for now) =====

const favoritesAPI = {
    add(contentId, contentType, title, posterUrl) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const exists = favorites.find(f => f.content_id === contentId && f.content_type === contentType);
        if (!exists) {
            favorites.push({ content_id: contentId, content_type: contentType, title, poster_url: posterUrl, created_at: new Date().toISOString() });
            localStorage.setItem('favorites', JSON.stringify(favorites));
            return true;
        }
        return false;
    },

    getAll() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    },

    remove(contentId, contentType) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const filtered = favorites.filter(f => !(f.content_id === contentId && f.content_type === contentType));
        localStorage.setItem('favorites', JSON.stringify(filtered));
    },

    isFavorite(contentId, contentType) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites.some(f => f.content_id === contentId && f.content_type === contentType);
    }
};

// ===== History API (localStorage) =====

const historyAPI = {
    add(contentId, contentType, title, posterUrl) {
        let history = JSON.parse(localStorage.getItem('history') || '[]');
        // Remove if exists
        history = history.filter(h => !(h.content_id === contentId && h.content_type === contentType));
        // Add to beginning
        history.unshift({ content_id: contentId, content_type: contentType, title, poster_url: posterUrl, watched_at: new Date().toISOString() });
        // Keep only last 50
        history = history.slice(0, 50);
        localStorage.setItem('history', JSON.stringify(history));
    },

    getAll() {
        return JSON.parse(localStorage.getItem('history') || '[]');
    },

    clear() {
        localStorage.setItem('history', JSON.stringify([]));
    }
};

// ===== Export =====

window.API = {
    movies: moviesAPI,
    series: seriesAPI,
    anime: animeAPI,
    search: searchAPI,
    favorites: favoritesAPI,
    history: historyAPI
};
