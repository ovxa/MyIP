import dotenv from 'dotenv';
dotenv.config();

function refererCheck(referer) {
    const allowedDomains = ['localhost'];

    // 安全地处理环境变量，避免空字符串被添加到允许列表
    if (process.env.ALLOWED_DOMAINS) {
        const domains = process.env.ALLOWED_DOMAINS.split(',')
            .map(d => d.trim())
            .filter(d => d.length > 0);
        allowedDomains.push(...domains);
    }

    if (referer) {
        try {
            const domain = new URL(referer).hostname;
            return allowedDomains.includes(domain);
        } catch (error) {
            // 如果 URL 解析失败，返回 false
            console.error('Invalid referer URL:', error.message);
            return false;
        }
    }
    return false;  // 如果没有提供 referer，返回 false
}

export { refererCheck };
