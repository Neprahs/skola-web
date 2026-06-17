function t(key, fallback) {
    return window.RPS_I18N?.t(key) || fallback;
}

function buildArticleCard(article) {
    const card = document.createElement("a");
    card.href = getArticleUrl(article.slug);
    card.className = "article-card";

    const imageUrl = sanitizeImageUrl(article.image);
    const imageHtml = imageUrl
        ? `<img src="${imageUrl}" alt="" loading="lazy">`
        : `<div class="article-card-image-placeholder" aria-hidden="true"></div>`;

    card.innerHTML = `
        <div class="article-card-image">
            ${imageHtml}
        </div>
        <div class="article-card-body">
            <time datetime="${escapeHtml(article.date)}">${formatArticleDate(article.date)}</time>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.excerpt)}</p>
            <span class="article-card-link">${escapeHtml(t("common.readMore", "Čítať viac →"))}</span>
        </div>
    `;

    return card;
}

function buildCarouselSlide(article) {
    const slide = document.createElement("a");
    slide.href = getArticleUrl(article.slug);
    slide.className = "carousel-slide";
    slide.setAttribute("aria-label", `${t("common.readArticle", "Prečítať článok")}: ${article.title}`);

    const imageUrl = sanitizeImageUrl(article.image);
    const imageHtml = imageUrl
        ? `<img src="${imageUrl}" alt="" loading="lazy">`
        : `<div class="carousel-image-placeholder" aria-hidden="true"></div>`;

    slide.innerHTML = `
        ${imageHtml}
        <div class="carousel-overlay">
            <span class="carousel-date">${formatArticleDate(article.date)}</span>
            <h2 class="carousel-title">${escapeHtml(article.title)}</h2>
            <p class="carousel-excerpt">${escapeHtml(article.excerpt)}</p>
            <span class="carousel-link-text">${escapeHtml(t("common.readArticleArrow", "Prečítať článok →"))}</span>
        </div>
    `;

    return slide;
}

function renderArticlesEmptyState(container, messageKey, fallback) {
    if (!container) return;
    container.innerHTML = `<p class="empty-state">${escapeHtml(t(messageKey, fallback))}</p>`;
}
