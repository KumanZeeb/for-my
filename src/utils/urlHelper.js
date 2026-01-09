class URLHelper {
    static getBaseUrl() {
        const url = process.env.DRAKORKITA_URL || 'https://drakorindo5.kita.mom';
        return url.replace(/\/$/, '');
    }
    
    static buildUrl(path, params = {}) {
        const baseUrl = this.getBaseUrl();
        const url = new URL(path, baseUrl);
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        return url.toString();
    }
}

module.exports = URLHelper;