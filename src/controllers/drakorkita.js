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

// UPDATE DETAIL ALL TYPE FUNCTION
const detailAllType = async (req, res) => {
    try {
        const { endpoint } = req.params;
        const baseUrl = URLHelper.getBaseUrl();
        const url = `${baseUrl}/detail/${endpoint}`;
        
        console.log('🔍 Fetching detail page:', url);
        
        // Special headers untuk detail page
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'Referer': `${baseUrl}/`,
            'Origin': baseUrl,
            'DNT': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Cookie': `PHPSESSID=${Math.random().toString(36).substring(2)}`
        };
        
        // Coba beberapa metode
        let axiosRequest;
        
        // Method 1: Direct dengan headers lengkap
        try {
            console.log('🔄 Method 1: Direct connection');
            axiosRequest = await require('axios').get(url, {
                headers,
                timeout: 15000,
                maxRedirects: 5,
                httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false })
            });
            console.log('✅ Direct connection success');
        } catch (directError) {
            console.log('❌ Direct failed:', directError.message);
            
            // Method 2: Pakai CORS proxy dengan referer yang benar
            try {
                console.log('🔄 Method 2: CORS Proxy');
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                axiosRequest = await require('axios').get(proxyUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': baseUrl,
                        'Origin': baseUrl
                    },
                    timeout: 15000
                });
                console.log('✅ CORS proxy success');
            } catch (proxyError) {
                console.log('❌ CORS proxy failed:', proxyError.message);
                
                // Method 3: Pakai api.allorigins.win
                try {
                    console.log('🔄 Method 3: AllOrigins');
                    const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                    const response = await require('axios').get(allOriginsUrl, {
                        timeout: 15000
                    });
                    
                    axiosRequest = {
                        data: response.data,
                        status: response.status,
                        headers: response.headers
                    };
                    console.log('✅ AllOrigins success');
                } catch (allOriginsError) {
                    console.log('❌ All methods failed');
                    throw allOriginsError;
                }
            }
        }
        
        const data = await scrapeDetailAllType({ endpoint }, axiosRequest);

        res.status(200).json({
            success: true,
            message: "success",
            data
        });

    } catch (e) {
        console.error('❌ detailAllType error:', e.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch detail data",
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

const getStreamUrl = async (req, res) => {
    try {
        const { endpoint, episode = 0, resolution = 0 } = req.query;
        
        if (!endpoint) {
            return res.status(400).json({
                success: false,
                error: 'Endpoint is required'
            });
        }

        // Get detail data dengan proxy
        const detailResponse = await makeRequest(`/detail/${endpoint}`);
        const cheerio = require('cheerio');
        const $ = cheerio.load(detailResponse.data);
        
        // Ambil movie_id dan tag
        const onclick = $("div.pagination > a").last().attr("onclick");
        const movieIdAndTag = onclick.substring(onclick.indexOf("(") + 1, onclick.indexOf(")"));
        const movieId = movieIdAndTag.split(",")[0].replace(/^'|'$/g, '');
        const tag = movieIdAndTag.split(",")[1].replace(/^'|'$/g, '');
        
        // Get episode list dengan proxy
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
        
        // Get video quality dengan proxy
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
        
        // Get video URL dengan proxy
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