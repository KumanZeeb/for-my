const axios = require('axios');

const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

class ProxyHelper {
    static async fetchWithProxy(url, retries = 3) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const proxyIndex = attempt % CORS_PROXIES.length;
                const proxyUrl = CORS_PROXIES[proxyIndex] + encodeURIComponent(url);
                
                console.log(`Attempt ${attempt + 1}: Using proxy ${CORS_PROXIES[proxyIndex]}`);
                
                const response = await axios.get(proxyUrl, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
                    }
                });
                
                return response;
            } catch (error) {
                console.log(`Proxy attempt ${attempt + 1} failed: ${error.message}`);
                
                if (attempt === retries - 1) {
                    throw error;
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    static async fetchDirect(url) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.google.com/',
            'DNT': '1',
            'Pragma': 'no-cache'
        };
        
        return await axios.get(url, {
            headers,
            timeout: 10000,
            maxRedirects: 5
        });
    }
    
    static async fetch(url, useProxyFirst = true) {
        try {
            if (useProxyFirst) {
                return await this.fetchWithProxy(url);
            } else {
                return await this.fetchDirect(url);
            }
        } catch (proxyError) {
            console.log('Primary method failed, trying fallback...');
            if (useProxyFirst) {
                return await this.fetchDirect(url);
            } else {
                return await this.fetchWithProxy(url);
            }
        }
    }
}

module.exports = ProxyHelper;