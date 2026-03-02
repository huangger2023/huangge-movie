import { getAdminJwtSecret, getAdminPassword, issueAdminToken } from './_lib/admin-auth.mjs';
import { readJsonBody, sendJson } from './_lib/http.mjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method Not Allowed' });
        return;
    }

    const configuredPassword = getAdminPassword();
    const jwtSecret = getAdminJwtSecret();
    if (!configuredPassword || !jwtSecret) {
        sendJson(res, 500, { error: '后台未完成配置，请先设置环境变量。' });
        return;
    }

    const body = await readJsonBody(req);
    if (!body || typeof body.password !== 'string') {
        sendJson(res, 400, { error: '请求参数错误。' });
        return;
    }

    if (body.password !== configuredPassword) {
        sendJson(res, 401, { error: '密码错误。' });
        return;
    }

    const token = issueAdminToken();
    if (!token) {
        sendJson(res, 500, { error: '登录令牌生成失败。' });
        return;
    }

    sendJson(res, 200, {
        token,
        expiresIn: 60 * 60 * 24 * 7
    });
}

