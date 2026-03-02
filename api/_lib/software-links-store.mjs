import { list, put } from '@vercel/blob';

const LINKS_PATH = 'config/software-links.json';

export const DEFAULT_SOFTWARE_LINKS = [
    {
        title: '本地克隆 TTS',
        url: 'https://pan.baidu.com/s/1zQmTY9hTHSmxfUv7AFgf1A?pwd=wutx',
        code: 'wutx',
        note: '支持试用，满意后再购买。'
    },
    {
        title: '智能画面匹配模块',
        url: 'https://pan.baidu.com/s/1muCFWnTqTEElVBrARYu7Tw?pwd=i3ir',
        code: 'i3ir',
        note: '支持试用，满意后再购买。'
    },
    {
        title: '新软件入口（可自行修改）',
        url: 'https://pan.baidu.com/s/xxxx?pwd=xxxx',
        code: 'xxxx',
        note: '将此项替换为你新增的软件网盘链接。'
    }
];

function isLikelyCorruptedText(value) {
    if (typeof value !== 'string') {
        return false;
    }

    const input = value.trim();
    if (!input) {
        return false;
    }
    if (input.includes('\uFFFD')) {
        return true;
    }

    const compact = input.replace(/\s+/g, '');
    const questionMarks = (compact.match(/[?？]/g) || []).length;
    return questionMarks >= 2 && questionMarks / compact.length >= 0.45;
}

function isLikelyCorruptedCode(value) {
    if (typeof value !== 'string') {
        return false;
    }

    const input = value.trim();
    if (!input) {
        return false;
    }
    if (input.includes('\uFFFD')) {
        return true;
    }

    const questionMarks = (input.match(/[?？]/g) || []).length;
    return questionMarks >= 1 && questionMarks / input.length >= 0.4;
}

function isLikelyCorruptedUrl(value) {
    if (typeof value !== 'string') {
        return false;
    }

    const input = value.trim();
    if (!input) {
        return false;
    }

    return input.includes('\uFFFD');
}

function pickFallbackLink(index, fallbackLinks = DEFAULT_SOFTWARE_LINKS) {
    if (!Array.isArray(fallbackLinks)) {
        return {};
    }
    return fallbackLinks[index] || {};
}

function normalizeLinkItem(item, index, fallbackLinks = DEFAULT_SOFTWARE_LINKS) {
    const source = item || {};
    const fallback = pickFallbackLink(index, fallbackLinks);

    const sourceTitle = typeof source.title === 'string' ? source.title.trim() : '';
    const sourceUrl = typeof source.url === 'string' ? source.url.trim() : '';
    const sourceCode = typeof source.code === 'string' ? source.code.trim() : '';
    const sourceNote = typeof source.note === 'string' ? source.note.trim() : '';

    const fallbackTitle = typeof fallback.title === 'string' ? fallback.title.trim() : '';
    const fallbackUrl = typeof fallback.url === 'string' ? fallback.url.trim() : '';
    const fallbackCode = typeof fallback.code === 'string' ? fallback.code.trim() : '';
    const fallbackNote = typeof fallback.note === 'string' ? fallback.note.trim() : '';

    const title = isLikelyCorruptedText(sourceTitle) ? fallbackTitle : sourceTitle;
    const url = isLikelyCorruptedUrl(sourceUrl) ? fallbackUrl : sourceUrl;
    const code = isLikelyCorruptedCode(sourceCode) ? fallbackCode : sourceCode;
    const note = isLikelyCorruptedText(sourceNote) ? fallbackNote : sourceNote;

    return {
        title: title || fallbackTitle || `软件入口 ${index + 1}`,
        url: url || fallbackUrl || '',
        code: code || fallbackCode || '',
        note: note || fallbackNote || ''
    };
}

export function normalizeLinks(links, fallbackLinks = DEFAULT_SOFTWARE_LINKS) {
    return (Array.isArray(links) ? links : []).map((item, index) => normalizeLinkItem(item, index, fallbackLinks));
}

function withDefaultsIfEmpty(links, fallbackLinks = DEFAULT_SOFTWARE_LINKS) {
    const normalized = normalizeLinks(links, fallbackLinks);
    return normalized.length ? normalized : normalizeLinks(fallbackLinks, DEFAULT_SOFTWARE_LINKS);
}

export async function readSoftwareLinksFromCloud() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return withDefaultsIfEmpty(DEFAULT_SOFTWARE_LINKS);
    }

    try {
        const { blobs } = await list({ prefix: LINKS_PATH, limit: 20 });
        const target = blobs.find((item) => item.pathname === LINKS_PATH) || blobs[0];
        if (!target) {
            return withDefaultsIfEmpty(DEFAULT_SOFTWARE_LINKS);
        }

        const res = await fetch(target.url, { cache: 'no-store' });
        if (!res.ok) {
            return withDefaultsIfEmpty(DEFAULT_SOFTWARE_LINKS);
        }

        const payload = await res.json();
        return withDefaultsIfEmpty(payload.links);
    } catch (error) {
        return withDefaultsIfEmpty(DEFAULT_SOFTWARE_LINKS);
    }
}

export async function writeSoftwareLinksToCloud(links) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error('云端存储未配置（BLOB_READ_WRITE_TOKEN 缺失）');
    }

    const normalized = withDefaultsIfEmpty(links);
    const payload = {
        links: normalized,
        updatedAt: new Date().toISOString()
    };

    await put(LINKS_PATH, JSON.stringify(payload), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true
    });

    return normalized;
}
