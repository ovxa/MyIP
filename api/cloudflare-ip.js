import { get } from 'https';
import { isValidIP } from '../common/valid-ip.js';
import { refererCheck } from '../common/referer-check.js';

export default (req, res) => {
    // 限制只能从指定域名访问
    const referer = req.headers.referer;
    if (!refererCheck(referer)) {
        return res.status(403).json({ error: referer ? 'Access denied' : 'What are you doing?' });
    }

    // Cloudflare trace API 只能查询请求者自己的 IP
    // 如果请求查询其他 IP，返回不支持的提示
    const ipAddress = req.query.ip;
    if (ipAddress && !isValidIP(ipAddress)) {
        return res.status(400).json({ error: 'Invalid IP address' });
    }

    // 使用 Cloudflare trace API
    const url = 'https://1.1.1.1/cdn-cgi/trace';

    get(url, apiRes => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
            try {
                const traceData = parseCloudflareTrace(data);
                const modifiedJson = modifyJsonForCloudflare(traceData);
                res.json(modifiedJson);
            } catch (e) {
                res.status(500).json({ error: 'Error parsing trace data' });
            }
        });
    }).on('error', (e) => {
        res.status(500).json({ error: e.message });
    });
};

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

function modifyJsonForCloudflare(trace) {
    return {
        ip: trace.ip || 'N/A',
        city: 'N/A', // Cloudflare trace 不提供城市信息
        region: 'N/A', // Cloudflare trace 不提供地区信息
        country: trace.loc || 'N/A',
        country_name: trace.loc || 'N/A',
        country_code: trace.loc || 'N/A',
        latitude: 'N/A',
        longitude: 'N/A',
        asn: 'N/A',
        org: trace.colo ? `Cloudflare ${trace.colo}` : 'N/A',
        note: 'Cloudflare trace provides limited geolocation data'
    };
}
