import { get } from 'https';
import { isValidIP } from '../common/valid-ip.js';
import { refererCheck } from '../common/referer-check.js';

export default (req, res) => {
    // 限制只能从指定域名访问
    const referer = req.headers.referer;
    if (!refererCheck(referer)) {
        return res.status(403).json({ error: referer ? 'Access denied' : 'What are you doing?' });
    }

    // 从请求中获取 IP 地址
    const ipAddress = req.query.ip;
    if (!ipAddress) {
        return res.status(400).json({ error: 'No IP address provided' });
    }

    // 检查 IP 地址是否合法
    if (!isValidIP(ipAddress)) {
        return res.status(400).json({ error: 'Invalid IP address' });
    }

    // 检查 API Key 是否配置
    const apiKey = process.env.IPGEOLOCATION_API_KEY || '';
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const keys = apiKey.split(',').filter(k => k.trim());
    if (keys.length === 0) {
        return res.status(500).json({ error: 'No valid API key found' });
    }
    const key = keys[Math.floor(Math.random() * keys.length)];
    const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${key}&ip=${ipAddress}`;

    get(url, apiRes => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
            try {
                const originalJson = JSON.parse(data);
                const modifiedJson = modifyJsonForIPGeolocation(originalJson);
                res.json(modifiedJson);
            } catch (e) {
                res.status(500).json({ error: 'Error parsing JSON' });
            }
        });
    }).on('error', (e) => {
        res.status(500).json({ error: e.message });
    });
};

function modifyJsonForIPGeolocation(json) {
    return {
        ip: json.ip || 'N/A',
        city: json.city || 'N/A',
        region: json.state_prov || 'N/A',
        country: json.country_code2 || 'N/A',
        country_name: json.country_name || 'N/A',
        country_code: json.country_code2 || 'N/A',
        latitude: json.latitude || 'N/A',
        longitude: json.longitude || 'N/A',
        asn: json.isp && json.isp.includes('AS') ? json.isp.split(' ')[0] : (json.organization ? 'AS' + json.organization : 'N/A'),
        org: json.isp || json.organization || 'N/A',
        postal: json.zipcode || 'N/A',
        timezone: json.time_zone?.name || 'N/A'
    };
}
