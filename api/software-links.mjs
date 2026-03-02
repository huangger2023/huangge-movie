import { extractBearerToken, verifyAdminToken } from './_lib/admin-auth.mjs';
import { readJsonBody, sendJson } from './_lib/http.mjs';
import { readSoftwareLinksFromCloud, writeSoftwareLinksToCloud } from './_lib/software-links-store.mjs';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const links = await readSoftwareLinksFromCloud();
        sendJson(res, 200, { links });
        return;
    }

    if (req.method === 'PUT') {
        const token = extractBearerToken(req);
        if (!verifyAdminToken(token)) {
            sendJson(res, 401, { error: '登录已失效，请重新登录。' });
            return;
        }

        const body = await readJsonBody(req);
        if (!body || !Array.isArray(body.links)) {
            sendJson(res, 400, { error: '链接数据格式错误。' });
            return;
        }

        try {
            const links = await writeSoftwareLinksToCloud(body.links);
            sendJson(res, 200, { links });
        } catch (error) {
            sendJson(res, 500, { error: '保存失败，请检查云端存储配置。' });
        }
        return;
    }

    sendJson(res, 405, { error: 'Method Not Allowed' });
}

