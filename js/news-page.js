async function initNewsPage() {
    const grid = document.getElementById("news-grid");
    if (!grid) return;

    let articles = [];
    try {
        articles = sortArticlesByDate(localizeArticles(await loadArticles()));
    } catch {
        renderArticlesEmptyState(grid, "articles.loadError", "Články sa momentálne nepodarilo načítať.");
        return;
    }

    grid.innerHTML = "";

    if (!articles.length) {
        renderArticlesEmptyState(grid, "articles.none", "Zatiaľ nie sú publikované žiadne články.");
        return;
    }

    articles.forEach((article) => {
        grid.appendChild(buildArticleCard(article));
    });
}

document.addEventListener("DOMContentLoaded", initNewsPage);
document.addEventListener("rps-language-change", initNewsPage);
