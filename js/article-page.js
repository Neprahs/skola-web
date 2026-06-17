function t(key, fallback) {
    return window.RPS_I18N?.t(key) || fallback;
}

async function initArticlePage() {
    const container = document.getElementById("article-content");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        container.innerHTML = `<p class="empty-state">Článok sa nenašiel. <a href="news.html">Späť na novinky</a></p>`;
        return;
    }

    const article = await loadArticleBySlug(slug);

    if (!article) {
        container.innerHTML = `<p class="empty-state">Článok sa nenašiel. <a href="news.html">Späť na novinky</a></p>`;
        return;
    }

    document.title = `${article.title} — ${t("school.name", "Základná škola Rudník")}`;

    const breadcrumbCurrent = document.getElementById("article-breadcrumb-current");
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = article.title;

    const heroTitle = document.getElementById("article-hero-title");
    if (heroTitle) heroTitle.textContent = article.title;

    const heroDate = document.getElementById("article-hero-date");
    if (heroDate) {
        heroDate.textContent = formatArticleDate(article.date);
        heroDate.setAttribute("datetime", article.date);
    }

    const heroSection = document.querySelector(".article-hero");
    const heroStyle = article.heroStyle || "large";
    if (heroSection) {
        heroSection.className = `article-hero article-hero--${heroStyle}`;
        heroSection.hidden = heroStyle === "none";
    }

    const heroImage = document.getElementById("article-hero-image");
    if (heroImage) {
        if (heroStyle === "none") {
            heroImage.removeAttribute("src");
            heroImage.alt = "";
        } else {
            heroImage.src = article.image;
            heroImage.alt = article.title;
        }
    }

    const body = document.getElementById("article-body");
    if (!body) return;

    body.innerHTML = "";
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    const sections = article.sections?.length
        ? article.sections
        : layoutUi?.contentToSections(article.content) || [];

    if (layoutUi?.renderArticleSection) {
        sections.forEach((section) => {
            body.appendChild(layoutUi.renderArticleSection(section));
        });
        return;
    }

    body.innerHTML = article.content
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("");
}

document.addEventListener("DOMContentLoaded", initArticlePage);
document.addEventListener("rps-language-change", initArticlePage);
