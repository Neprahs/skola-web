let carouselTimer = null;
let carouselIndex = 0;
let homeInitPromise = null;
let lastFeaturedKey = "";
let lastLatestKey = "";

function articlesKey(list) {
    return list.map((article) => article.id).join("|");
}

function updateCarouselSlideText(slide, article) {
    if (!slide) return;
    slide.href = getArticleUrl(article.slug);
    slide.setAttribute("aria-label", `${t("common.readArticle", "Prečítať článok")}: ${article.title}`);

    const dateEl = slide.querySelector(".carousel-date");
    const titleEl = slide.querySelector(".carousel-title");
    const excerptEl = slide.querySelector(".carousel-excerpt");
    const linkEl = slide.querySelector(".carousel-link-text");

    if (dateEl) dateEl.textContent = formatArticleDate(article.date);
    if (titleEl) titleEl.textContent = article.title;
    if (excerptEl) excerptEl.textContent = article.excerpt;
    if (linkEl) linkEl.textContent = t("common.readArticleArrow", "Prečítať článok →");
}

function updateArticleCardText(card, article) {
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
}

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getCarouselSlideCount(track) {
    return track?.querySelectorAll(".carousel-slide").length || 0;
}

function showCarouselSlide(track, dots, index) {
    const slides = track?.querySelectorAll(".carousel-slide");
    const total = slides?.length || 0;
    if (!total) return;

    carouselIndex = ((index % total) + total) % total;
    track.style.transform = `translateX(-${carouselIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === carouselIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
    });

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
    if (carousel.dataset.controlsBound === "true") return;
    carousel.dataset.controlsBound = "true";

    carousel.addEventListener("click", (event) => {
        const prevBtn = event.target.closest(".carousel-prev");
        const nextBtn = event.target.closest(".carousel-next");
        const dot = event.target.closest(".carousel-dot");

        if (prevBtn || nextBtn || dot) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (prevBtn) {
            showCarouselSlide(track, dots, carouselIndex - 1);
            startCarouselAutoplay(track, dots);
            return;
        }

        if (nextBtn) {
            showCarouselSlide(track, dots, carouselIndex + 1);
            startCarouselAutoplay(track, dots);
            return;
        }

        if (dot) {
            const dotIndex = Number.parseInt(dot.dataset.index, 10);
            if (!Number.isNaN(dotIndex)) {
                showCarouselSlide(track, dots, dotIndex);
                startCarouselAutoplay(track, dots);
            }
        }
    });

    carousel.addEventListener("mouseenter", stopCarouselAutoplay);
    carousel.addEventListener("mouseleave", () => startCarouselAutoplay(track, dots));
    carousel.addEventListener("focusin", stopCarouselAutoplay);
    carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
            startCarouselAutoplay(track, dots);
        }
    });
}

function renderCarousel(carousel, featured) {
    const track = carousel.querySelector(".carousel-track");
    const dots = carousel.querySelector(".carousel-dots");
    if (!track || !dots) return;

    const key = articlesKey(featured);
    const existingSlides = track.querySelectorAll(".carousel-slide");
    const savedIndex = carouselIndex;

    if (key && key === lastFeaturedKey && existingSlides.length === featured.length) {
        featured.forEach((article, index) => updateCarouselSlideText(existingSlides[index], article));
        showCarouselSlide(track, dots, savedIndex);
        return;
    }

    lastFeaturedKey = key;
    stopCarouselAutoplay();
    carouselIndex = 0;
    track.innerHTML = "";
    dots.innerHTML = "";

    featured.forEach((article, index) => {
        const slide = buildCarouselSlide(article);
        track.appendChild(slide);

        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `carousel-dot${index === 0 ? " is-active" : ""}`;
        dot.dataset.index = String(index);
        dot.setAttribute("aria-label", `${t("a11y.carouselSlides", "Snímky karuselu")} ${index + 1}`);
        dot.setAttribute("aria-selected", String(index === 0));
        dots.appendChild(dot);
    });

    bindCarouselControls(carousel, track, dots);
    showCarouselSlide(track, dots, 0);
    startCarouselAutoplay(track, dots);
}

async function runHomePageInit() {
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
            lastFeaturedKey = "";
            renderArticlesEmptyState(carousel, "articles.noneFeatured", "Zatiaľ nie sú žiadne odporúčané články.");
        }
    }

    if (latestGrid) {
        if (!articles.length) {
            lastLatestKey = "";
            latestGrid.innerHTML = "";
            renderArticlesEmptyState(latestGrid, "articles.none", "Zatiaľ nie sú publikované žiadne články.");
            return;
        }

        const latest = articles.slice(0, 3);
        const key = articlesKey(latest);
        const existingCards = latestGrid.querySelectorAll(".article-card");

        if (key && key === lastLatestKey && existingCards.length === latest.length) {
            latest.forEach((article, index) => updateArticleCardText(existingCards[index], article));
        } else {
            lastLatestKey = key;
            latestGrid.innerHTML = "";
            latest.forEach((article) => {
                latestGrid.appendChild(buildArticleCard(article));
            });
        }
    }
}

function initHomePage() {
    if (!homeInitPromise) {
        homeInitPromise = runHomePageInit().finally(() => {
            homeInitPromise = null;
        });
    }
    return homeInitPromise;
}

document.addEventListener("DOMContentLoaded", initHomePage);
document.addEventListener("rps-language-change", initHomePage);
