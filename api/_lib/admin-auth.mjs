import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function toBase64Url(input) {
    return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input) {
    return Buffer.from(input, 'base64url').toString('utf8');
}

function signPayload(payload, secret) {
    return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeCompare(a, b) {
    const left = Buffer.from(a, 'utf8');
    const right = Buffer.from(b, 'utf8');
    if (left.length !== right.length) {
        return false;
    }
    return timingSafeEqual(left, right);
}

export function getAdminPassword() {
    return (process.env.SOFTWARE_ADMIN_PASSWORD || '').trim();
}

export function getAdminJwtSecret() {
    return (process.env.SOFTWARE_ADMIN_JWT_SECRET || '').trim();
}

export function issueAdminToken() {
    const secret = getAdminJwtSecret();
    if (!secret) {
        return '';
    }

    const now = Math.floor(Date.now() / 1000);
    const payloadObj = {
        iat: now,
        exp: now + TOKEN_TTL_SECONDS
    };
    const payload = toBase64Url(JSON.stringify(payloadObj));
    const signature = signPayload(payload, secret);
    return `${payload}.${signature}`;
}

export function verifyAdminToken(token) {
    const secret = getAdminJwtSecret();
    if (!secret || typeof token !== 'string' || !token.includes('.')) {
        return false;
    }

    const [payload, signature] = token.split('.');
    if (!payload || !signature) {
        return false;
    }

    const expected = signPayload(payload, secret);
    if (!safeCompare(expected, signature)) {
        return false;
    }

    try {
        const payloadObj = JSON.parse(fromBase64Url(payload));
        const now = Math.floor(Date.now() / 1000);
        return typeof payloadObj.exp === 'number' && payloadObj.exp > now;
    } catch (error) {
        return false;
    }
}

export function extractBearerToken(req) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return '';
    }
    return authHeader.slice('Bearer '.length).trim();
}
