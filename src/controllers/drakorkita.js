// Cloudflare Worker - drakor-proxy
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Decode URL
  const decodedUrl = decodeURIComponent(targetUrl);

  // Headers untuk bypass Cloudflare protection
  const headers = new Headers({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://drakorindo5.kita.mom/',
    'Origin': 'https://drakorindo5.kita.mom',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'DNT': '1',
    'Cookie': 'PHPSESSID=' + Math.random().toString(36).substring(2)
  });

  try {
    // Fetch dari target URL
    const response = await fetch(decodedUrl, {
      headers: headers,
      cf: {
        // Cloudflare settings
        cacheTtl: 300,
        cacheEverything: false,
        polish: 'off',
        // Bypass cache untuk dynamic content
        cacheKey: decodedUrl + '?' + Date.now()
      }
    });

    // Get response text
    const html = await response.text();

    // Return response
    return new Response(html, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      url: decodedUrl 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}