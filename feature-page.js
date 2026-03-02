const featureHeader = document.querySelector('.site-header');

function syncTopbarOffset() {
    if (!featureHeader) {
        return;
    }
    document.documentElement.style.setProperty('--topbar-offset', `${featureHeader.offsetHeight}px`);
}

function getCleanPath(pathname) {
    const trimmed = pathname.replace(/\/+$/, '');
    return trimmed || '/';
}

function setActiveNavigation() {
    const currentPath = getCleanPath(window.location.pathname);
    document.querySelectorAll('.site-nav-link[data-path]').forEach((link) => {
        const targetPath = getCleanPath(link.dataset.path || '/');
        const isActive = targetPath === currentPath;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

async function copyText(text) {
    if (!text) {
        return false;
    }
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(input);
        return copied;
    }
}

function bindCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach((button) => {
        const originalText = button.textContent;
        button.addEventListener('click', async () => {
            const success = await copyText(button.dataset.copy || '');
            button.textContent = success ? '已复制' : '复制失败，请手动复制';
            setTimeout(() => {
                button.textContent = originalText;
            }, 1200);
        });
    });
}

syncTopbarOffset();
setActiveNavigation();
bindCopyButtons();
window.addEventListener('resize', syncTopbarOffset);

const yearNode = document.getElementById('featureCurrentYear');
if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
}
