const API_BASE = "/api";

const LOCALE_MAP = {
    sk: "sk-SK",
    en: "en-GB",
    cs: "cs-CZ",
    de: "de-DE",
    pl: "pl-PL",
    hu: "hu-HU",
    uk: "uk-UA",
};

const SLUG_DIACRITICS = {
    á: "a", ä: "a", č: "c", ď: "d", é: "e", í: "i", ĺ: "l", ľ: "l", ň: "n",
    ó: "o", ô: "o", ŕ: "r", š: "s", ť: "t", ú: "u", ý: "y", ž: "z",
    ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ś: "s", ź: "z", ż: "z",
    ö: "o", ü: "u", ő: "o", ű: "u", і: "i", ї: "i", є: "e", ґ: "g",
};

const API_ERROR_SK = {
    "Authentication required.": "Musíte byť prihlásený. Odhláste sa a prihláste znova.",
    "Incorrect password.": "Nesprávne heslo.",
    "Editable pages manifest not found.": "Zoznam stránok sa nepodarilo načítať.",
    "Language is required.": "Chýba jazyk úpravy.",
    "No image uploaded.": "Nevybrali ste žiadnu fotografiu.",
    "Only image files are allowed.": "Povolené sú len obrázky (JPG, PNG, WebP, GIF).",
    "Internal server error.": "Chyba servera. Skúste to znova.",
};

function translateApiError(message, status) {
    if (message && API_ERROR_SK[message]) return API_ERROR_SK[message];

    if (status === 404) {
        return "Server nenašiel požadovanú službu. Spustite server: cd server → npm start";
    }
    if (status === 401) {
        return "Prihlásenie vypršalo. Odhláste sa a prihláste znova.";
    }
    if (status === 400) {
        return message || "Neplatné údaje. Skontrolujte vyplnené polia.";
    }
    if (status >= 500) {
        return "Chyba servera. Skúste to znova o chvíľu.";
    }

    return message || "Požiadavka zlyhala. Skontrolujte, či beží server na localhost:3000.";
}

async function apiFetch(url, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE}${url}`, {
            credentials: "same-origin",
            ...options,
            headers: {
                ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
                ...options.headers,
            },
        });
    } catch {
        throw new Error("Nepodarilo sa spojiť so serverom. Otvorte http://localhost:3000/admin.html");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(translateApiError(data.error, response.status));
    }

    return data;
}

async function loadArticlesFromStatic() {
    const response = await fetch("data/articles.json", { cache: "no-store" });
    if (!response.ok) {
        throw new Error("Static articles unavailable.");
    }

    const data = await response.json();
    return data.articles || [];
}

async function loadArticles() {
    try {
        const data = await apiFetch("/articles");
        return data.articles || [];
    } catch {
        return loadArticlesFromStatic();
    }
}

async function loadArticleBySlug(slug) {
    try {
        const article = await apiFetch(`/articles/${encodeURIComponent(slug)}`);
        return localizeArticle(article);
    } catch {
        const articles = await loadArticlesFromStatic();
        const article = getArticleBySlug(articles, slug);
        return article ? localizeArticle(article) : null;
    }
}

async function checkAdminAuth() {
    const data = await apiFetch("/auth/check");
    return data.authenticated;
}

async function loginAdmin(password) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
    });
}

async function logoutAdmin() {
    return apiFetch("/auth/logout", { method: "POST" });
}

async function createArticle(article) {
    return apiFetch("/articles", {
        method: "POST",
        body: JSON.stringify(article),
    });
}

async function updateArticle(id, article) {
    return apiFetch(`/articles/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(article),
    });
}

async function deleteArticleById(id) {
    return apiFetch(`/articles/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
}

async function uploadArticleImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    return apiFetch("/upload", {
        method: "POST",
        body: formData,
    });
}

async function loadContentManifest() {
    return apiFetch("/content/manifest");
}

async function loadSiteContentStore() {
    return apiFetch("/content");
}

async function savePageContent(pageId, payload) {
    return apiFetch(`/content/page/${encodeURIComponent(pageId)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

function getFeaturedArticles(articles) {
    return sortArticlesByDate(articles.filter((article) => article.featured));
}

function getArticleBySlug(articles, slug) {
    return articles.find((article) => article.slug === slug);
}

function sortArticlesByDate(articles) {
    return [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getActiveLanguage() {
    return window.RPS_I18N?.getLanguage?.() || "sk";
}

function getArticleLocale() {
    return LOCALE_MAP[getActiveLanguage()] || "sk-SK";
}

function localizeField(value, lang) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "object") {
        return value[lang] || value.sk || value.en || Object.values(value)[0] || "";
    }
    return String(value);
}

function localizeSection(section, lang) {
    if (!section || typeof section !== "object") return section;

    return {
        ...section,
        title: localizeField(section.title, lang),
        text: localizeField(section.text, lang),
        caption: localizeField(section.caption, lang),
    };
}

function getArticleTranslationOverlay(articleId, lang) {
    if (!articleId || lang === "sk") return null;
    return window.RPS_ARTICLE_TRANSLATIONS?.[articleId]?.[lang] || null;
}

function localizeArticle(article, lang = getActiveLanguage()) {
    const overlay = getArticleTranslationOverlay(article.id, lang);
    let title = localizeField(article.title, lang);
    let excerpt = localizeField(article.excerpt, lang);
    let content = localizeField(article.content, lang);

    if (!Array.isArray(content)) {
        content = [];
    }

    if (overlay) {
        if (overlay.title) title = overlay.title;
        if (overlay.excerpt) excerpt = overlay.excerpt;
        if (Array.isArray(overlay.content)) content = overlay.content;
    }

    const sections = Array.isArray(article.sections)
        ? article.sections.map((section) => localizeSection(section, lang))
        : article.sections;

    return {
        ...article,
        title,
        excerpt,
        content,
        sections,
    };
}

function localizeArticles(articles, lang = getActiveLanguage()) {
    return articles.map((article) => localizeArticle(article, lang));
}

function formatArticleDate(dateString) {
    return new Date(dateString).toLocaleDateString(getArticleLocale(), {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getArticleUrl(slug) {
    return `article.html?slug=${encodeURIComponent(slug)}`;
}

function normalizeSlugText(text) {
    return String(text)
        .toLowerCase()
        .split("")
        .map((char) => SLUG_DIACRITICS[char] ?? char)
        .join("");
}

function createSlug(title) {
    return normalizeSlugText(title)
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function sanitizeImageUrl(url) {
    if (!url) return "";

    const value = String(url).trim();
    if (value.startsWith("/") || value.startsWith("./") || value.startsWith("uploads/")) {
        return escapeHtml(value);
    }

    try {
        const parsed = new URL(value, window.location.href);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            return escapeHtml(parsed.pathname.startsWith("/uploads/")
                ? parsed.pathname
                : parsed.href);
        }
    } catch {
        return "";
    }

    return "";
}
