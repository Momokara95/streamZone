// ===== StreamZone API Client =====
// TMDB via Netlify Edge Function proxy + Jikan/Kitsu direct

const TMDB_IMG = 'https://image.tmdb.org/t/p';

// Use Netlify Edge Function as proxy (same domain, no CORS issues)
async function tmdbFetch(endpoint) {
    const r = await fetch(`/api/tmdb${endpoint}`);
    return r.json();
}

// ===== Movies (TMDB) =====

const moviesAPI = {
    async getPopular(page = 1) {
        const d = await tmdbFetch(`/movie/popular?language=fr-FR&page=${page}`);
        return { results: (d.results || []).map(formatTMDB), total_pages: d.total_pages, source: 'tmdb' };
    },

    async getTrending() {
        const d = await tmdbFetch(`/trending/movie/week?language=fr-FR`);
        return { results: (d.results || []).map(formatTMDB), source: 'tmdb' };
    },

    async getById(id) {
        const d = await tmdbFetch(`/movie/${id}?language=fr-FR&append_to_response=videos,similar,watch_providers`);
        d.poster_url = d.poster_path ? `${TMDB_IMG}/w500${d.poster_path}` : null;
        d.backdrop_url = d.backdrop_path ? `${TMDB_IMG}/original${d.backdrop_path}` : null;
        if (d.videos?.results) {
            const trailer = d.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            d.trailer_url = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
        }
        if (d.similar?.results) d.similar.results = d.similar.results.slice(0, 10).map(formatTMDB);
        return d;
    },

    async search(query) {
        const d = await tmdbFetch(`/search/movie?language=fr-FR&query=${encodeURIComponent(query)}`);
        return { results: (d.results || []).map(formatTMDB), source: 'tmdb' };
    }
};

// ===== Series (TMDB) =====

const seriesAPI = {
    async getPopular(page = 1) {
        const d = await tmdbFetch(`/tv/popular?language=fr-FR&page=${page}`);
        return { results: (d.results || []).map(formatTMDB), total_pages: d.total_pages, source: 'tmdb' };
    },

    async getTrending() {
        const d = await tmdbFetch(`/trending/tv/week?language=fr-FR`);
        return { results: (d.results || []).map(formatTMDB), source: 'tmdb' };
    },

    async getById(id) {
        const d = await tmdbFetch(`/tv/${id}?language=fr-FR&append_to_response=videos,similar,watch_providers`);
        d.poster_url = d.poster_path ? `${TMDB_IMG}/w500${d.poster_path}` : null;
        d.backdrop_url = d.backdrop_path ? `${TMDB_IMG}/original${d.backdrop_path}` : null;
        if (d.videos?.results) {
            const trailer = d.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            d.trailer_url = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
        }
        if (d.similar?.results) d.similar.results = d.similar.results.slice(0, 10).map(formatTMDB);
        return d;
    },

    async search(query) {
        const d = await tmdbFetch(`/search/tv?language=fr-FR&query=${encodeURIComponent(query)}`);
        return { results: (d.results || []).map(formatTMDB), source: 'tmdb' };
    }
};

// ===== Anime (Jikan + Kitsu - CORS OK) =====

const animeAPI = {
    async getPopular() {
        try {
            const r = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=1&limit=20');
            if (r.ok) { const d = await r.json(); if (d.data?.length) return { results: d.data.map(formatJikan), source: 'jikan' }; }
        } catch (e) {}
        const r = await fetch('https://kitsu.io/api/edge/anime?sort=-averageRating&page[limit]=20', { headers: { 'Accept': 'application/vnd.api+json' } });
        const d = await r.json();
        return { results: (d.data || []).map(formatKitsu), source: 'kitsu' };
    },

    async getTrending() {
        try {
            const r = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&page=1&limit=20');
            if (r.ok) { const d = await r.json(); if (d.data?.length) return { results: d.data.map(formatJikan), source: 'jikan' }; }
        } catch (e) {}
        const r = await fetch('https://kitsu.io/api/edge/anime?sort=-createdAt&page[limit]=20', { headers: { 'Accept': 'application/vnd.api+json' } });
        const d = await r.json();
        return { results: (d.data || []).map(formatKitsu), source: 'kitsu' };
    },

    async getById(id) {
        try {
            const r = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
            if (r.ok) { const d = await r.json(); if (d.data) return formatJikan(d.data); }
        } catch (e) {}
        const r = await fetch(`https://kitsu.io/api/edge/anime/${id}`, { headers: { 'Accept': 'application/vnd.api+json' } });
        const d = await r.json();
        if (d.data) return formatKitsu(d.data);
        throw new Error('Not found');
    },

    async search(query) {
        try {
            const r = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`);
            if (r.ok) { const d = await r.json(); if (d.data?.length) return { results: d.data.map(formatJikan), source: 'jikan' }; }
        } catch (e) {}
        const r = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20`, { headers: { 'Accept': 'application/vnd.api+json' } });
        const d = await r.json();
        return { results: (d.data || []).map(formatKitsu), source: 'kitsu' };
    }
};

// ===== Search (Unified) =====

const searchAPI = {
    async searchAll(query) {
        const results = { movies: [], series: [], anime: [] };
        try {
            const [moviesD, seriesD] = await Promise.all([
                tmdbFetch(`/search/movie?language=fr-FR&query=${encodeURIComponent(query)}`),
                tmdbFetch(`/search/tv?language=fr-FR&query=${encodeURIComponent(query)}`)
            ]);
            results.movies = (moviesD.results || []).slice(0, 10).map(formatTMDB);
            results.series = (seriesD.results || []).slice(0, 10).map(formatTMDB);
        } catch (e) { console.log('TMDB search error', e); }
        try {
            const r = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
            if (r.ok) { const d = await r.json(); results.anime = (d.data || []).map(formatJikan); }
        } catch (e) { console.log('Jikan search error'); }
        return results;
    }
};

// ===== Favorites (localStorage) =====

const favoritesAPI = {
    add(contentId, contentType, title, posterUrl) {
        const fav = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (fav.find(f => f.content_id === String(contentId) && f.content_type === contentType)) return false;
        fav.push({ content_id: String(contentId), content_type: contentType, title, poster_url: posterUrl, created_at: new Date().toISOString() });
        localStorage.setItem('favorites', JSON.stringify(fav));
        return true;
    },
    getAll() { return JSON.parse(localStorage.getItem('favorites') || '[]'); },
    remove(contentId, contentType) {
        const fav = JSON.parse(localStorage.getItem('favorites') || '[]');
        localStorage.setItem('favorites', JSON.stringify(fav.filter(f => !(f.content_id === String(contentId) && f.content_type === contentType))));
    },
    isFavorite(contentId, contentType) {
        return JSON.parse(localStorage.getItem('favorites') || '[]').some(f => f.content_id === String(contentId) && f.content_type === contentType);
    }
};

// ===== History (localStorage) =====

const historyAPI = {
    add(contentId, contentType, title, posterUrl) {
        let h = JSON.parse(localStorage.getItem('history') || '[]');
        h = h.filter(i => !(i.content_id === String(contentId) && i.content_type === contentType));
        h.unshift({ content_id: String(contentId), content_type: contentType, title, poster_url: posterUrl, watched_at: new Date().toISOString() });
        localStorage.setItem('history', JSON.stringify(h.slice(0, 50)));
    },
    getAll() { return JSON.parse(localStorage.getItem('history') || '[]'); }
};

// ===== Formatters =====

function formatTMDB(item) {
    const name = item.title || item.name || 'Untitled';
    return {
        id: item.id,
        title: name,
        name: name,
        overview: item.overview || 'Pas de description disponible',
        poster_url: item.poster_path ? `${TMDB_IMG}/w500${item.poster_path}` : `https://via.placeholder.com/500x750?text=${encodeURIComponent(name)}`,
        backdrop_url: item.backdrop_path ? `${TMDB_IMG}/original${item.backdrop_path}` : null,
        vote_average: item.vote_average || 0,
        release_date: item.release_date || item.first_air_date || 'N/A',
        first_air_date: item.first_air_date || 'N/A',
        genres: item.genres?.map(g => g.name) || [],
        genre_ids: item.genre_ids || [],
        status: item.status || 'N/A',
        source: 'tmdb'
    };
}

function formatJikan(anime) {
    const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || `https://via.placeholder.com/500x750?text=${encodeURIComponent(anime.title)}`;
    return {
        id: anime.mal_id,
        title: anime.title || anime.title_english,
        title_jp: anime.title_japanese,
        overview: anime.synopsis || 'Pas de synopsis disponible',
        poster_url: img,
        backdrop_url: anime.trailer?.images?.maximum_image_url || null,
        vote_average: anime.score || 0,
        release_date: anime.aired?.from?.split('T')[0] || anime.year || 'N/A',
        genres: anime.genres?.map(g => g.name) || [],
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

function formatKitsu(item) {
    return {
        id: item.id,
        title: item.attributes.canonicalTitle || item.attributes.titles.en_jp,
        title_jp: item.attributes.titles.ja_jp,
        overview: item.attributes.synopsis,
        vote_average: item.attributes.averageRating || 0,
        release_date: item.attributes.startDate || 'N/A',
        status: item.attributes.status,
        episodeCount: item.attributes.episodeCount,
        poster_url: item.attributes.posterImage?.original || item.attributes.posterImage?.large,
        trailer_url: item.attributes.youtubeVideoId ? `https://www.youtube.com/watch?v=${item.attributes.youtubeVideoId}` : null,
        source: 'kitsu'
    };
}

// ===== Export =====

window.API = {
    movies: moviesAPI,
    series: seriesAPI,
    anime: animeAPI,
    search: searchAPI,
    favorites: favoritesAPI,
    history: historyAPI
};
