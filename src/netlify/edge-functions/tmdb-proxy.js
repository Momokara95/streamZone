// Netlify Edge Function: TMDB CORS Proxy
// Proxies TMDB API calls and adds CORS headers

const TMDB_KEY = 'a338bf8def1610e820ab4626aefc8ffa';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export default async (request) => {
    const url = new URL(request.url);
    // Extract the TMDB path from /api/tmdb/...
    const tmdbPath = url.pathname.replace('/api/tmdb', '');
    const tmdbUrl = `${TMDB_BASE}${tmdbPath}?api_key=${TMDB_KEY}&${url.searchParams.toString().replace(/api_key=[^&]*&?/, '')}`;

    try {
        const response = await fetch(tmdbUrl);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Proxy error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
};

export const config = { path: "/api/tmdb/*" };
