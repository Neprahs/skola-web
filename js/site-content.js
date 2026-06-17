let siteContentCache = null;

function contentEscapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function contentSanitizeImageUrl(url) {
    if (!url) return "";
    const value = String(url).trim();
    if (value.startsWith("/") || value.startsWith("./") || value.startsWith("uploads/")) {
        return contentEscapeHtml(value);
    }
    try {
        const parsed = new URL(value, window.location.href);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            return contentEscapeHtml(parsed.href);
        }
    } catch {
        return "";
    }
    return "";
}

async function fetchSiteContent() {
    if (siteContentCache) return siteContentCache;

    try {
        const response = await fetch("/api/content", { cache: "no-store" });
        if (!response.ok) throw new Error("Content unavailable");
        siteContentCache = await response.json();
    } catch {
        siteContentCache = await fetchStaticSiteContent();
    }

    return siteContentCache;
}

async function fetchStaticSiteContent() {
    try {
        const response = await fetch("data/site-content.json", { cache: "no-store" });
        if (!response.ok) throw new Error("No static content");
        return await response.json();
    } catch {
        return { overrides: {}, images: {}, blocks: {} };
    }
}

function applyContentOverrides(store) {
    window.RPS_SITE_CONTENT = store;

    Object.entries(store.overrides || {}).forEach(([lang, fields]) => {
        if (!window.RPS_TRANSLATIONS?.[lang]) return;
        Object.assign(window.RPS_TRANSLATIONS[lang], fields);
    });
}

function applyContentImages(store) {
    const images = store.images || {};

    document.querySelectorAll("[data-content-image]").forEach((img) => {
        const key = img.dataset.contentImage;
        const url = images[key] || img.dataset.contentDefault || img.getAttribute("src");
        if (url) img.src = url;
    });
}

function renderPageBlocks(store) {
    const blocksByPage = store.blocks || {};
    const pageId = document.body.dataset.page || document.documentElement.dataset.page;
    if (!pageId) return;

    const renderBlock = window.RPS_CONTENT_LAYOUT?.renderContentBlock;
    if (!renderBlock) return;

    document.querySelectorAll(`[data-page-blocks="${pageId}"]`).forEach((container) => {
        const blocks = blocksByPage[pageId] || [];
        container.innerHTML = "";

        if (!blocks.length) {
            container.hidden = true;
            return;
        }

        container.hidden = false;
        const stack = document.createElement("div");
        stack.className = "content-blocks-stack";

        blocks.forEach((block) => {
            stack.appendChild(renderBlock(block));
        });

        container.appendChild(stack);
    });
}

async function loadSiteContentOverrides() {
    const store = await fetchSiteContent();
    applyContentOverrides(store);
    return store;
}

function refreshSiteContentOnPage() {
    const store = window.RPS_SITE_CONTENT;
    if (!store) return;

    applyContentImages(store);
    renderPageBlocks(store);
}

window.loadSiteContentOverrides = loadSiteContentOverrides;
window.refreshSiteContentOnPage = refreshSiteContentOnPage;

document.addEventListener("rps-language-change", () => {
    if (window.RPS_I18N?.apply) {
        window.RPS_I18N.apply();
    }
    refreshSiteContentOnPage();
});
