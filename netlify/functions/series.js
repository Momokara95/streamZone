// Netlify Function: Series API
// Handles: /api/series/popular, /api/series/trending, /api/series/:id

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path.replace('/api/series', '');
    const hasTMDBKey = TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE' && TMDB_API_KEY.length > 10;

    try {
        if (path === '/popular' || path === '') {
            return await getPopularSeries(event, headers, hasTMDBKey);
        }
        
        if (path === '/trending') {
            return await getTrendingSeries(headers, hasTMDBKey);
        }
        
        const id = path.replace('/', '');
        if (id) {
            return await getSeriesById(id, headers, hasTMDBKey);
        }

        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    } catch (error) {
        console.error('Series API Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
    }
};

async function getPopularSeries(event, headers, hasTMDBKey) {
    if (hasTMDBKey) {
        try {
            const params = new URLSearchParams(event.queryStringParameters || {});
            const page = params.get('page') || 1;
            const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`);
            const data = await response.json();
            const series = data.results?.map(s => formatTMDBItem(s)) || [];
            return { statusCode: 200, headers, body: JSON.stringify({ results: series, total_pages: data.total_pages, source: 'tmdb' }) };
        } catch (e) { console.log('TMDB error, using TVmaze'); }
    }

    const response = await fetch('https://api.tvmaze.com/shows');
    const allShows = await response.json();
    const sorted = allShows.filter(s => s.rating?.average > 0 && s.type === 'Scripted').sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    const series = sorted.slice(0, 20).map(formatTVMazeShow);
    return { statusCode: 200, headers, body: JSON.stringify({ results: series, source: 'tvmaze' }) };
}

async function getTrendingSeries(headers, hasTMDBKey) {
    if (hasTMDBKey) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&language=fr-FR`);
            const data = await response.json();
            const series = data.results?.map(s => formatTMDBItem(s)) || [];
            return { statusCode: 200, headers, body: JSON.stringify({ results: series, source: 'tmdb' }) };
        } catch (e) { console.log('TMDB error, using TVmaze'); }
    }

    const response = await fetch('https://api.tvmaze.com/shows');
    const allShows = await response.json();
    const sorted = allShows.filter(s => s.rating?.average > 0 && s.type === 'Scripted').sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    const series = sorted.slice(0, 12).map(formatTVMazeShow);
    return { statusCode: 200, headers, body: JSON.stringify({ results: series, source: 'tvmaze' }) };
}

async function getSeriesById(id, headers, hasTMDBKey) {
    if (hasTMDBKey) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=videos,credits,similar`);
            const data = await response.json();
            data.poster_url = data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null;
            data.backdrop_url = data.backdrop_path ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}` : null;
            if (data.videos?.results) {
                const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                data.trailer_url = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
            }
            if (data.similar?.results) {
                data.similar.results = data.similar.results.slice(0, 10).map(s => formatTMDBItem(s));
            }
            return { statusCode: 200, headers, body: JSON.stringify(data) };
        } catch (e) { console.log('TMDB error, using TVmaze'); }
    }

    const response = await fetch(`https://api.tvmaze.com/shows/${id}`);
    if (!response.ok) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    const show = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(formatTVMazeShow(show)) };
}

function formatTVMazeShow(show) {
    const image = show.image?.original || show.image?.medium || `https://via.placeholder.com/500x750?text=${encodeURIComponent(show.name)}`;
    return {
        id: show.id,
        title: show.name,
        name: show.name,
        overview: show.summary?.replace(/<[^>]*>/g, '') || 'Pas de description disponible',
        poster_url: image,
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
        source: 'tvmaze'
    };
}

function formatTMDBItem(item) {
    return {
        ...item,
        poster_url: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : `https://via.placeholder.com/500x750?text=${encodeURIComponent(item.title || item.name)}`,
        backdrop_url: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
        source: 'tmdb'
    };
}
