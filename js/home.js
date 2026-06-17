let carouselTimer = null;
let carouselIndex = 0;
let carouselBound = false;

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getCarouselSlideCount(track) {
    return track?.querySelectorAll(".carousel-slide").length || 0;
}

function showCarouselSlide(track, dots, index) {
    const total = getCarouselSlideCount(track);
    if (!total) return;

    carouselIndex = ((index % total) + total) % total;
    track.style.transform = `translateX(-${carouselIndex * 100}%)`;

    dots.querySelectorAll(".carousel-dot").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === carouselIndex);
        dot.setAttribute("aria-selected", String(dotIndex === carouselIndex));
    });
}

function startCarouselAutoplay(track, dots) {
    if (prefersReducedMotion()) return;

    stopCarouselAutoplay();
    carouselTimer = setInterval(() => {
        showCarouselSlide(track, dots, carouselIndex + 1);
    }, 5000);
}

function stopCarouselAutoplay() {
    if (carouselTimer) {
        clearInterval(carouselTimer);
        carouselTimer = null;
    }
}

function bindCarouselControls(carousel, track, dots) {
    if (carouselBound) return;

    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");

    prevBtn?.addEventListener("click", () => {
        showCarouselSlide(track, dots, carouselIndex - 1);
        startCarouselAutoplay(track, dots);
    });

    nextBtn?.addEventListener("click", () => {
        showCarouselSlide(track, dots, carouselIndex + 1);
        startCarouselAutoplay(track, dots);
    });

    carousel.addEventListener("mouseenter", stopCarouselAutoplay);
    carousel.addEventListener("mouseleave", () => startCarouselAutoplay(track, dots));

    carouselBound = true;
}

function renderCarousel(carousel, featured) {
    const track = carousel.querySelector(".carousel-track");
    const dots = carousel.querySelector(".carousel-dots");
    if (!track || !dots) return;

    stopCarouselAutoplay();
    carouselIndex = 0;
    track.innerHTML = "";
    dots.innerHTML = "";

    featured.forEach((article, index) => {
        track.appendChild(buildCarouselSlide(article));

        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `carousel-dot${index === 0 ? " is-active" : ""}`;
        dot.setAttribute("aria-label", `Slide ${index + 1}`);
        dot.setAttribute("aria-selected", String(index === 0));
        dot.addEventListener("click", () => {
            showCarouselSlide(track, dots, index);
            startCarouselAutoplay(track, dots);
        });
        dots.appendChild(dot);
    });

    bindCarouselControls(carousel, track, dots);
    showCarouselSlide(track, dots, 0);
    startCarouselAutoplay(track, dots);
}


async function initHomePage() {
    const carousel = document.getElementById("hero-carousel");
    const latestGrid = document.getElementById("latest-articles");
    if (!carousel && !latestGrid) return;

    let articles = [];
    try {
        articles = sortArticlesByDate(localizeArticles(await loadArticles()));
    } catch {
        renderArticlesEmptyState(carousel, "articles.loadError", "Články sa momentálne nepodarilo načítať.");
        renderArticlesEmptyState(latestGrid, "articles.loadError", "Články sa momentálne nepodarilo načítať.");
        return;
    }

    const featured = sortArticlesByDate(articles.filter((article) => article.featured));

    if (carousel) {
        if (featured.length) {
            renderCarousel(carousel, featured);
        } else {
            stopCarouselAutoplay();
            renderArticlesEmptyState(carousel, "articles.noneFeatured", "Zatiaľ nie sú žiadne odporúčané články.");
        }
    }

    if (latestGrid) {
        latestGrid.innerHTML = "";

        if (!articles.length) {
            renderArticlesEmptyState(latestGrid, "articles.none", "Zatiaľ nie sú publikované žiadne články.");
            return;
        }

        articles.slice(0, 3).forEach((article) => {
            latestGrid.appendChild(buildArticleCard(article));
        });
    }
}

document.addEventListener("DOMContentLoaded", initHomePage);
document.addEventListener("rps-language-change", initHomePage);
