// src/controllers/drakorkita.js
const ProxyHelper = require('../utils/proxyHelper');
const URLHelper = require('../utils/urlHelper');
const {
    scrapeSeries,
    scrapeSeriesUpdated,
    scrapeMovie,
    scrapeNewMovie,
    scrapeOngoingSeries,
    scrapeCompletedSeries,
    scrapeGenres,
    scrapeDetailGenres,
    scrapeSearch,
    scrapeDetailAllType,
} = require('../scrapers/drakorkita');

// Helper untuk membuat request dengan proxy
const makeRequest = async (path, params = {}) => {
    const url = URLHelper.buildUrl(path, params);
    console.log('📡 Making request to:', url);
    
    try {
        return await ProxyHelper.fetch(url, true);
    } catch (error) {
        console.error('❌ All request methods failed:', error.message);
        throw error;
    }
};

// Helper khusus untuk detail page dengan Cloudflare Worker
const fetchWithCloudflareWorker = async (url) => {
    const axios = require('axios');
    
    // Cloudflare Worker URL (GANTI SETELAH DEPLOY CLOUDFLARE WORKER)
    const CLOUDFLARE_WORKER_URL = process.env.CF_WORKER_URL || null;
    
    if (!CLOUDFLARE_WORKER_URL) {
        throw new Error('Cloudflare Worker URL not configured');
    }
    
    const workerUrl = `${CLOUDFLARE_WORKER_URL}/?url=${encodeURIComponent(url)}`;
    
    console.log('☁️ Using Cloudflare Worker:', workerUrl);
    
    const response = await axios.get(workerUrl, {
        timeout: 25000,
        headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0'
        }
    });
    
    return response;
};

// SERIES ALL
const seriesAll = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const axiosRequest = await makeRequest('/all', {
            media_type: 'tv',
            page: page
        });

        const datas = await scrapeSeries(req, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            page: parseInt(page),
            ...datas
        });
    } catch (e) {
        console.error('❌ seriesAll error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data",
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

// SERIES UPDATED
const seriesUpdated = async (req, res) => {
    try {
        const axiosRequest = await makeRequest('/');

        const datas = await scrapeSeriesUpdated(req, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            datas
        });
    } catch (e) {
        console.error('❌ seriesUpdated error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data"
        });
    }
};

// MOVIE ALL
const movieAll = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const axiosRequest = await makeRequest('/all', {
            media_type: 'movie',
            page: page
        });

        const datas = await scrapeMovie(req, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            page: parseInt(page),
            ...datas
        });
    } catch (e) {
        console.error('❌ movieAll error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data"
        });
    }
};

// NEW MOVIE
const newMovie = async (req, res) => {
    try {
        const axiosRequest = await makeRequest('/');

        const datas = await scrapeNewMovie(req, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            datas
        });
    } catch (e) {
        console.error('❌ newMovie error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data"
        });
    }
};

// ONGOING SERIES
const ongoingSeries = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const axiosRequest = await makeRequest('/all', {
            status: 'returning',
            page: page
        });

        const datas = await scrapeOngoingSeries(req, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            page: parseInt(page),
            ...datas
        });
    } catch (e) {
        console.error('❌ ongoingSeries error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data"
        });
    }
};

// COMPLETED SERIES
const completedSeries = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const axiosRequest = await makeRequest('/all', {
            status: 'ended',
            page: page
        });

        const datas = await scrapeCompletedSeries(req, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            page: parseInt(page),
            ...datas
        });
    } catch (e) {
        console.error('❌ completedSeries error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data"
        });
    }
};

// GENRES
const genres = async (req, res) => {
    try {
        const axiosRequest = await makeRequest('/');

        const datas = await scrapeGenres(req, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            datas
        });
    } catch (e) {
        console.error('❌ genres error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data"
        });
    }
};

// DETAIL GENRES
const detailGenres = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const { endpoint } = req.params;
        const axiosRequest = await makeRequest('/all', {
            genre: endpoint,
            page: page
        });

        const datas = await scrapeDetailGenres({ page, endpoint }, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            page: parseInt(page),
            ...datas
        });
    } catch (e) {
        console.error('❌ detailGenres error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data"
        });
    }
};

// SEARCH ALL
const searchAll = async (req, res) => {
    try {
        const { s, page = 1 } = req.query;
        const axiosRequest = await makeRequest('/all', {
            q: s,
            page: page
        });

        const datas = await scrapeSearch(req, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            page: parseInt(page),
            keyword: s,
            ...datas
        });
    } catch (e) {
        console.error('❌ searchAll error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch data"
        });
    }
};

// DETAIL ALL TYPE (DENGAN CLOUDFLARE WORKER FALLBACK)
const detailAllType = async (req, res) => {
    try {
        const { endpoint } = req.params;
        const baseUrl = URLHelper.getBaseUrl();
        const targetUrl = `${baseUrl}/detail/${endpoint}`;
        
        console.log('🔍 Fetching detail page:', targetUrl);
        
        let axiosRequest;
        
        // CLOUDFLARE WORKER METHOD (jika ada config)
        if (process.env.CF_WORKER_URL) {
            try {
                console.log('☁️ Trying Cloudflare Worker...');
                const response = await fetchWithCloudflareWorker(targetUrl);
                
                axiosRequest = {
                    data: response.data,
                    status: response.status,
                    headers: response.headers
                };
                
                console.log(`✅ Cloudflare Worker success: ${response.status}`);
                
            } catch (cfError) {
                console.log('❌ Cloudflare Worker failed:', cfError.message);
                // Fallback ke standard proxy
                console.log('🔄 Falling back to standard proxy...');
                axiosRequest = await makeRequest(`/detail/${endpoint}`);
            }
        } else {
            // STANDARD PROXY METHOD
            console.log('🔄 Using standard proxy (no Cloudflare Worker config)');
            axiosRequest = await makeRequest(`/detail/${endpoint}`);
        }
        
        const data = await scrapeDetailAllType({ endpoint }, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            data
        });

    } catch (e) {
        console.error('❌ detailAllType error:', e.message);
        
        // Berikan response yang informatif
        if (e.message.includes('status code 500') || e.message.includes('timeout')) {
            res.status(503).json({
                success: false,
                message: "Detail page currently unavailable",
                reason: "The site may be blocking automated requests from Vercel",
                suggestion: "Try setting up a Cloudflare Worker proxy or use different hosting",
                working_endpoints: [
                    "/api/series",
                    "/api/movie", 
                    "/api/search?q=keyword",
                    "/api/genres",
                    "/api/series/ongoing",
                    "/api/series/completed"
                ]
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to fetch detail data",
                error: process.env.NODE_ENV === 'development' ? e.message : undefined
            });
        }
    }
};

// GET STREAM URL
const getStreamUrl = async (req, res) => {
    try {
        const { endpoint, episode = 0, resolution = 0 } = req.query;
        
        if (!endpoint) {
            return res.status(400).json({
                success: false,
                error: 'Endpoint is required'
            });
        }

        // Get detail data
        let detailResponse;
        try {
            detailResponse = await makeRequest(`/detail/${endpoint}`);
        } catch (detailError) {
            console.log('❌ Detail fetch failed, trying alternative...');
            
            // Jika ada Cloudflare Worker, coba pakai itu
            if (process.env.CF_WORKER_URL) {
                try {
                    const baseUrl = URLHelper.getBaseUrl();
                    const targetUrl = `${baseUrl}/detail/${endpoint}`;
                    const cfResponse = await fetchWithCloudflareWorker(targetUrl);
                    detailResponse = {
                        data: cfResponse.data,
                        status: cfResponse.status
                    };
                } catch (cfError) {
                    throw new Error(`Both methods failed: ${detailError.message}, ${cfError.message}`);
                }
            } else {
                throw detailError;
            }
        }
        
        const cheerio = require('cheerio');
        const $ = cheerio.load(detailResponse.data);
        
        // Ambil movie_id dan tag
        const onclick = $("div.pagination > a").last().attr("onclick");
        const movieIdAndTag = onclick.substring(onclick.indexOf("(") + 1, onclick.indexOf(")"));
        const movieId = movieIdAndTag.split(",")[0].replace(/^'|'$/g, '');
        const tag = movieIdAndTag.split(",")[1].replace(/^'|'$/g, '');
        
        // Get episode list
        const episodeResponse = await makeRequest('/api/episode.php', {
            movie_id: movieId,
            tag: tag
        });
        
        const episodeData = episodeResponse.data;
        const $eps = cheerio.load(episodeData.episode_lists || '');
        const episodes = $eps("p > a").get();
        
        // Pilih episode
        const selectedEpisode = episodes[episode];
        const epsWrap = $(selectedEpisode).attr('onclick');
        const epsIdAndTag = epsWrap.substring(epsWrap.indexOf("(") + 1, epsWrap.indexOf(")"));
        const epsId = epsIdAndTag.split(",")[0].replace(/^'|'$/g, '');
        const epsTag = epsIdAndTag.split(",")[1].replace(/^'|'$/g, '');
        
        // Get video quality
        const serverResponse = await makeRequest('/api/server.php', {
            episode_id: epsId,
            tag: epsTag
        });
        
        const serverData = serverResponse.data;
        const qua = serverData.data?.qua;
        const server_id = serverData.data?.server_id;
        
        if (!qua || !server_id) {
            throw new Error('Failed to get video quality data');
        }
        
        // Get video URL
        const videoResponse = await makeRequest('/api/video.php', {
            id: epsId,
            qua: qua,
            server_id: server_id,
            tag: epsTag
        });
        
        const videoData = videoResponse.data;
        const file = videoData.file;
        
        if (!file) {
            throw new Error('No video file found');
        }
        
        // Parse video URLs
        const videoUrls = file.split(",");
        const selectedResolution = videoUrls[resolution] || videoUrls[0];
        
        // Extract video URL
        const videoUrl = selectedResolution.substring(
            selectedResolution.indexOf("https"), 
            selectedResolution.length
        ).replace(/['"]/g, '').trim();
        
        res.status(200).json({
            success: true,
            data: {
                episode: parseInt(episode) + 1,
                resolution: resolution,
                video_url: videoUrl,
                headers: {
                    referer: process.env.DRAKORKITA_URL,
                    origin: process.env.DRAKORKITA_URL
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error in getStreamUrl:', error.message);
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to get stream URL'
        });
    }
};

// EKSPOR SEMUA FUNCTION
module.exports = {
    seriesAll,
    seriesUpdated,
    movieAll,
    newMovie,
    ongoingSeries,
    completedSeries,
    genres,
    detailGenres,
    searchAll,
    detailAllType,
    getStreamUrl
};