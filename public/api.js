// ===== StreamZone API Client =====
// Direct client-side API calls - no backend needed!

// ===== Movies & Series (TVmaze - no key needed) =====

const moviesAPI = {
    async getPopular(page = 1) {
        const response = await fetch('https://api.tvmaze.com/shows');
        const allShows = await response.json();
        const sorted = allShows
            .filter(s => s.rating?.average > 0)
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        const movies = sorted.slice((page - 1) * 20, page * 20).map(formatTVMaze);
        return { results: movies, total_pages: Math.ceil(sorted.length / 20), source: 'tvmaze' };
    },

    async getTrending() {
        const response = await fetch('https://api.tvmaze.com/shows');
        const allShows = await response.json();
        const sorted = allShows
            .filter(s => s.rating?.average > 0)
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        return { results: sorted.slice(0, 12).map(formatTVMaze), source: 'tvmaze' };
    },

    async getById(id) {
        const response = await fetch(`https://api.tvmaze.com/shows/${id}`);
        if (!response.ok) throw new Error('Not found');
        return formatTVMaze(await response.json());
    },

    async search(query) {
        const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return { results: data.map(item => formatTVMaze(item.show)).slice(0, 20), source: 'tvmaze' };
    }
};

const seriesAPI = {
    async getPopular(page = 1) {
        const response = await fetch('https://api.tvmaze.com/shows');
        const allShows = await response.json();
        const sorted = allShows
            .filter(s => s.rating?.average > 0 && s.type === 'Scripted')
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        const series = sorted.slice((page - 1) * 20, page * 20).map(formatTVMaze);
        return { results: series, total_pages: Math.ceil(sorted.length / 20), source: 'tvmaze' };
    },

    async getTrending() {
        const response = await fetch('https://api.tvmaze.com/shows');
        const allShows = await response.json();
        const sorted = allShows
            .filter(s => s.rating?.average > 0 && s.type === 'Scripted')
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        return { results: sorted.slice(0, 12).map(formatTVMaze), source: 'tvmaze' };
    },

    async getById(id) {
        const response = await fetch(`https://api.tvmaze.com/shows/${id}`);
        if (!response.ok) throw new Error('Not found');
        return formatTVMaze(await response.json());
    },

    async search(query) {
        const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return { results: data.map(item => formatTVMaze(item.show)).slice(0, 20), source: 'tvmaze' };
    }
};

// ===== Anime (Jikan - MyAnimeList - no key needed) =====

const animeAPI = {
    async getPopular() {
        try {
            const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=1&limit=20');
            if (response.ok) {
                const data = await response.json();
                if (data.data?.length > 0) {
                    return { results: data.data.map(formatJikan), source: 'jikan' };
                }
            }
        } catch (e) { console.log('Jikan unavailable'); }

        // Kitsu fallback
        const response = await fetch('https://kitsu.io/api/edge/anime?sort=-averageRating&page[limit]=20', {
            headers: { 'Accept': 'application/vnd.api+json' }
        });
        const data = await response.json();
        return { results: (data.data || []).map(formatKitsu), source: 'kitsu' };
    },

    async getTrending() {
        try {
            const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&page=1&limit=20');
            if (response.ok) {
                const data = await response.json();
                if (data.data?.length > 0) {
                    return { results: data.data.map(formatJikan), source: 'jikan' };
                }
            }
        } catch (e) { console.log('Jikan unavailable'); }

        const response = await fetch('https://kitsu.io/api/edge/anime?sort=-createdAt&page[limit]=20', {
            headers: { 'Accept': 'application/vnd.api+json' }
        });
        const data = await response.json();
        return { results: (data.data || []).map(formatKitsu), source: 'kitsu' };
    },

    async getById(id) {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
            if (response.ok) {
                const data = await response.json();
                if (data.data) return formatJikan(data.data);
            }
        } catch (e) { console.log('Jikan unavailable'); }

        const response = await fetch(`https://kitsu.io/api/edge/anime/${id}`, {
            headers: { 'Accept': 'application/vnd.api+json' }
        });
        const data = await response.json();
        if (data.data) return formatKitsu(data.data);
        throw new Error('Not found');
    },

    async search(query) {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`);
            if (response.ok) {
                const data = await response.json();
                if (data.data?.length > 0) {
                    return { results: data.data.map(formatJikan), source: 'jikan' };
                }
            }
        } catch (e) { console.log('Jikan unavailable'); }

        const response = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20`, {
            headers: { 'Accept': 'application/vnd.api+json' }
        });
        const data = await response.json();
        return { results: (data.data || []).map(formatKitsu), source: 'kitsu' };
    }
};

// ===== Search (Unified) =====

const searchAPI = {
    async searchAll(query) {
        const results = { movies: [], anime: [], series: [] };

        try {
            const tvmaze = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
            const tvmazeData = await tvmaze.json();
            tvmazeData.forEach(item => {
                const formatted = formatTVMaze(item.show);
                if (item.show.type === 'Scripted') results.series.push(formatted);
                else results.movies.push(formatted);
            });
        } catch (e) { console.log('TVmaze search error'); }

        try {
            const jikan = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
            if (jikan.ok) {
                const jikanData = await jikan.json();
                results.anime = (jikanData.data || []).map(formatJikan);
            }
        } catch (e) { console.log('Jikan search error'); }

        return results;
    }
};

// ===== Favorites (localStorage) =====

const favoritesAPI = {
    add(contentId, contentType, title, posterUrl) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (favorites.find(f => f.content_id === String(contentId) && f.content_type === contentType)) return false;
        favorites.push({ content_id: String(contentId), content_type: contentType, title, poster_url: posterUrl, created_at: new Date().toISOString() });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        return true;
    },
    getAll() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    },
    remove(contentId, contentType) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        localStorage.setItem('favorites', JSON.stringify(
            favorites.filter(f => !(f.content_id === String(contentId) && f.content_type === contentType))
        ));
    },
    isFavorite(contentId, contentType) {
        return JSON.parse(localStorage.getItem('favorites') || '[]')
            .some(f => f.content_id === String(contentId) && f.content_type === contentType);
    }
};

// ===== History (localStorage) =====

const historyAPI = {
    add(contentId, contentType, title, posterUrl) {
        let history = JSON.parse(localStorage.getItem('history') || '[]');
        history = history.filter(h => !(h.content_id === String(contentId) && h.content_type === contentType));
        history.unshift({ content_id: String(contentId), content_type: contentType, title, poster_url: posterUrl, watched_at: new Date().toISOString() });
        localStorage.setItem('history', JSON.stringify(history.slice(0, 50)));
    },
    getAll() {
        return JSON.parse(localStorage.getItem('history') || '[]');
    }
};

// ===== Formatters =====

function formatTVMaze(show) {
    const img = show.image?.original || show.image?.medium || `https://via.placeholder.com/500x750?text=${encodeURIComponent(show.name)}`;
    return {
        id: show.id,
        title: show.name,
        name: show.name,
        overview: show.summary?.replace(/<[^>]*>/g, '') || 'Pas de description disponible',
        poster_url: img,
        backdrop_url: show.image?.original || null,
        vote_average: show.rating?.average || 0,
        release_date: show.premiered || 'N/A',
        first_air_date: show.premiered || 'N/A',
        genres: show.genres || [],
        genre_ids: [],
        status: show.status || 'Running',
        language: show.language || 'English',
        network: show.network?.name || show.webChannel?.name || 'N/A',
        trailer_url: show.officialSite || show.url || null,
        source: 'tvmaze'
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
        episodeLength: item.attributes.episodeLength,
        ageRating: item.attributes.ageRating,
        poster_url: item.attributes.posterImage?.original || item.attributes.posterImage?.large,
        cover_url: item.attributes.coverImage?.original,
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
