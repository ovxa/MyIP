// 前端直接调用 IP Geolocation APIs
// 用于 GitHub Pages 等纯静态托管环境

/**
 * 调用 IPGeolocation.io API
 * @param {string} ip - IP 地址
 * @param {string} apiKey - API Key
 * @returns {Promise<object>} - 标准化的 IP 信息
 */
export async function fetchIPGeolocationIO(ip, apiKey) {
    if (!apiKey) {
        throw new Error('API key is required for IPGeolocation.io');
    }

    try {
        const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 标准化数据格式
        return {
            ip: data.ip || 'N/A',
            city: data.city || 'N/A',
            region: data.state_prov || 'N/A',
            country: data.country_code2 || 'N/A',
            country_name: data.country_name || 'N/A',
            country_code: data.country_code2 || 'N/A',
            latitude: data.latitude || 'N/A',
            longitude: data.longitude || 'N/A',
            asn: data.isp && data.isp.includes('AS') ? data.isp.split(' ')[0] : (data.organization ? 'AS' + data.organization : 'N/A'),
            org: data.isp || data.organization || 'N/A',
            isp: data.isp || 'N/A',
            postal: data.zipcode || 'N/A',
            timezone: data.time_zone?.name || 'N/A'
        };
    } catch (error) {
        console.error('IPGeolocation.io API error:', error);
        throw error;
    }
}

/**
 * 调用 Cloudflare Trace API
 * @returns {Promise<object>} - 标准化的 IP 信息
 */
export async function fetchCloudflareTrace() {
    try {
        const url = 'https://1.1.1.1/cdn-cgi/trace';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        const data = parseCloudflareTrace(text);

        // 标准化数据格式
        return {
            ip: data.ip || 'N/A',
            city: 'N/A', // Cloudflare trace 不提供城市信息
            region: 'N/A',
            country: data.loc || 'N/A',
            country_name: data.loc || 'N/A',
            country_code: data.loc || 'N/A',
            latitude: 'N/A',
            longitude: 'N/A',
            asn: 'N/A',
            org: data.colo ? `Cloudflare ${data.colo}` : 'N/A',
            isp: data.colo ? `Cloudflare ${data.colo}` : 'N/A',
            note: 'Cloudflare trace provides limited geolocation data'
        };
    } catch (error) {
        console.error('Cloudflare trace API error:', error);
        throw error;
    }
}

/**
 * 解析 Cloudflare trace 文本格式
 * @param {string} text - trace 响应文本
 * @returns {object} - 解析后的数据对象
 */
function parseCloudflareTrace(text) {
    const data = {};
    const lines = text.trim().split('\n');
    lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            data[key.trim()] = value.trim();
        }
    });
    return data;
}

/**
 * 根据数据源 ID 调用相应的 API
 * @param {number} sourceId - 数据源 ID (0: IPGeolocation.io, 1: Cloudflare)
 * @param {string} ip - IP 地址
 * @param {string} apiKey - API Key (仅 IPGeolocation.io 需要)
 * @returns {Promise<object>} - 标准化的 IP 信息
 */
export async function fetchIPData(sourceId, ip, apiKey = '') {
    switch (sourceId) {
        case 0: // IPGeolocation.io
            return await fetchIPGeolocationIO(ip, apiKey);
        case 1: // Cloudflare
            return await fetchCloudflareTrace();
        default:
            throw new Error(`Unknown source ID: ${sourceId}`);
    }
}
