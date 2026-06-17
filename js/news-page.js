let lastNewsKey = "";
let newsInitPromise = null;

async function runNewsPageInit() {
    const grid = document.getElementById("news-grid");
    if (!grid) return;

    let articles = [];
    try {
        articles = sortArticlesByDate(localizeArticles(await loadArticles()));
    } catch {
        lastNewsKey = "";
        renderArticlesEmptyState(grid, "articles.loadError", "Články sa momentálne nepodarilo načítať.");
        return;
    }

    if (!articles.length) {
        lastNewsKey = "";
        grid.innerHTML = "";
        renderArticlesEmptyState(grid, "articles.none", "Zatiaľ nie sú publikované žiadne články.");
        return;
    }

    const key = articles.map((article) => article.id).join("|");
    const existingCards = grid.querySelectorAll(".article-card");

    if (key === lastNewsKey && existingCards.length === articles.length) {
        articles.forEach((article, index) => {
            const card = existingCards[index];
            if (!card) return;
            card.href = getArticleUrl(article.slug);
            const timeEl = card.querySelector("time");
            const titleEl = card.querySelector("h3");
            const excerptEl = card.querySelector("p");
            const linkEl = card.querySelector(".article-card-link");
            if (timeEl) {
                timeEl.setAttribute("datetime", article.date);
                timeEl.textContent = formatArticleDate(article.date);
            }
            if (titleEl) titleEl.textContent = article.title;
            if (excerptEl) excerptEl.textContent = article.excerpt;
            if (linkEl) linkEl.textContent = t("common.readMore", "Čítať viac →");
        });
        return;
    }

    lastNewsKey = key;
    grid.innerHTML = "";
    articles.forEach((article) => {
        grid.appendChild(buildArticleCard(article));
    });
}

function initNewsPage() {
    if (!newsInitPromise) {
        newsInitPromise = runNewsPageInit().finally(() => {
            newsInitPromise = null;
        });
    }
    return newsInitPromise;
}

document.addEventListener("DOMContentLoaded", initNewsPage);
document.addEventListener("rps-language-change", initNewsPage);
