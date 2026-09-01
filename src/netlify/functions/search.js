// Netlify Function: Unified Search
// Handles: /api/search/:query
// Searches across all APIs: TVmaze (movies/series) + Jikan/Kitsu (anime)

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path.replace('/api/search', '');
    const query = decodeURIComponent(path.replace('/', ''));

    if (!query) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Query required' }) };
    }

    const results = { movies: [], anime: [], series: [] };

    // Search TVmaze (movies + series)
    try {
        const tvmazeResponse = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
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

    // Search Jikan (anime)
    try {
        const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
        if (jikanResponse.ok) {
            const jikanData = await jikanResponse.json();
            results.anime = jikanData.data?.map(formatJikanAnime) || [];
        }
    } catch (error) {
        console.log('Jikan search error');
    }

    return { statusCode: 200, headers, body: JSON.stringify(results) };
};

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
        genres: show.genres || [],
        source: 'tvmaze'
    };
}

function formatJikanAnime(anime) {
    const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || `https://via.placeholder.com/500x750?text=${encodeURIComponent(anime.title)}`;
    return {
        id: anime.mal_id,
        title: anime.title || anime.title_english,
        title_jp: anime.title_japanese,
        overview: anime.synopsis || 'Pas de synopsis disponible',
        poster_url: image,
        vote_average: anime.score || 0,
        release_date: anime.aired?.from?.split('T')[0] || anime.year || 'N/A',
        genres: anime.genres?.map(g => g.name) || [],
        episodeCount: anime.episodes || 0,
        source: 'jikan'
    };
}
