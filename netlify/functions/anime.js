// Netlify Function: Anime API
// Handles: /api/anime/popular, /api/anime/trending, /api/anime/:id, /api/anime/search/:query
// Uses Jikan (MyAnimeList) + Kitsu as fallback - NO API KEY NEEDED

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path.replace('/api/anime', '');

    try {
        if (path === '/popular' || path === '') {
            return await getPopularAnime(headers);
        }
        
        if (path === '/trending') {
            return await getTrendingAnime(headers);
        }
        
        if (path.startsWith('/search/')) {
            const query = decodeURIComponent(path.replace('/search/', ''));
            return await searchAnime(query, headers);
        }
        
        const id = path.replace('/', '');
        if (id) {
            return await getAnimeById(id, headers);
        }

        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    } catch (error) {
        console.error('Anime API Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
    }
};

async function getPopularAnime(headers) {
    // Try Jikan first
    try {
        const jikanResponse = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=1&limit=20');
        if (jikanResponse.ok) {
            const jikanData = await jikanResponse.json();
            if (jikanData.data && jikanData.data.length > 0) {
                const anime = jikanData.data.map(formatJikanAnime);
                return { statusCode: 200, headers, body: JSON.stringify({ results: anime, source: 'jikan' }) };
            }
        }
    } catch (error) {
        console.log('Jikan unavailable, falling back to Kitsu');
    }

    // Fallback to Kitsu
    try {
        const response = await fetch('https://kitsu.io/api/edge/anime?sort=-averageRating&page[limit]=20&page[offset]=0', {
            headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' }
        });
        const data = await response.json();
        const anime = data.data?.map(formatKitsuAnime) || [];
        return { statusCode: 200, headers, body: JSON.stringify({ results: anime, source: 'kitsu' }) };
    } catch (error) {
        console.error('Kitsu error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Anime API unavailable' }) };
    }
}

async function getTrendingAnime(headers) {
    try {
        const jikanResponse = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&page=1&limit=20');
        if (jikanResponse.ok) {
            const jikanData = await jikanResponse.json();
            if (jikanData.data && jikanData.data.length > 0) {
                const anime = jikanData.data.map(formatJikanAnime);
                return { statusCode: 200, headers, body: JSON.stringify({ results: anime, source: 'jikan' }) };
            }
        }
    } catch (error) {
        console.log('Jikan unavailable, falling back to Kitsu');
    }

    try {
        const response = await fetch('https://kitsu.io/api/edge/anime?sort=-createdAt&page[limit]=20', {
            headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' }
        });
        const data = await response.json();
        const anime = data.data?.map(formatKitsuAnime) || [];
        return { statusCode: 200, headers, body: JSON.stringify({ results: anime, source: 'kitsu' }) };
    } catch (error) {
        console.error('Kitsu error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Anime API unavailable' }) };
    }
}

async function searchAnime(query, headers) {
    try {
        const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`);
        if (jikanResponse.ok) {
            const jikanData = await jikanResponse.json();
            if (jikanData.data && jikanData.data.length > 0) {
                const anime = jikanData.data.map(formatJikanAnime);
                return { statusCode: 200, headers, body: JSON.stringify({ results: anime, source: 'jikan' }) };
            }
        }
    } catch (error) {
        console.log('Jikan unavailable for search, falling back to Kitsu');
    }

    try {
        const response = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20`, {
            headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' }
        });
        const data = await response.json();
        const anime = data.data?.map(formatKitsuAnime) || [];
        return { statusCode: 200, headers, body: JSON.stringify({ results: anime, source: 'kitsu' }) };
    } catch (error) {
        console.error('Kitsu search error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Anime search unavailable' }) };
    }
}

async function getAnimeById(id, headers) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
        if (response.ok) {
            const data = await response.json();
            if (data.data) {
                return { statusCode: 200, headers, body: JSON.stringify(formatJikanAnime(data.data)) };
            }
        }
    } catch (error) {
        console.log('Jikan unavailable for detail, falling back to Kitsu');
    }

    try {
        const response = await fetch(`https://kitsu.io/api/edge/anime/${id}`, {
            headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' }
        });
        const data = await response.json();
        if (data.data) {
            return { statusCode: 200, headers, body: JSON.stringify(formatKitsuAnime(data.data)) };
        }
    } catch (error) {
        console.error('Kitsu detail error:', error);
    }
    
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Anime not found' }) };
}

function formatJikanAnime(anime) {
    const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || `https://via.placeholder.com/500x750?text=${encodeURIComponent(anime.title)}`;
    return {
        id: anime.mal_id,
        title: anime.title || anime.title_english,
        title_jp: anime.title_japanese,
        overview: anime.synopsis || 'Pas de synopsis disponible',
        poster_url: image,
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
