function t(key, fallback) {
    return window.RPS_I18N?.t(key) || fallback;
}

function initNewsletter() {
    const form = document.querySelector(".footer-newsletter-form");
    if (!form || form.dataset.initialized) return;

    form.dataset.initialized = "true";

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');
        const existingMessage = form.parentElement.querySelector(".footer-newsletter-message");

        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement("p");
        message.className = "footer-newsletter-message";
        message.setAttribute("role", "status");

        if (!emailInput.value.trim()) {
            message.textContent = t("newsletter.error", "Please enter your email address.");
            message.classList.add("is-error");
        } else {
            message.textContent = t("newsletter.success", "Thanks for subscribing! We'll be in touch soon.");
            form.reset();
        }

        form.parentElement.appendChild(message);
    });
}

function highlightCurrentNav() {
    const currentPage = document.documentElement.dataset.page;
    if (!currentPage) return;

    document.querySelectorAll("[data-nav]").forEach((link) => {
        if (link.dataset.nav === currentPage) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");

            // Keep sidebar sections expanded for context, but don't auto-open header dropdowns.
            link.closest(".side-nav-group")?.setAttribute("open", "");
            link.closest(".side-nav-subgroup")?.setAttribute("open", "");
        }
    });
}

function initHeaderNav() {
    const headerSubnav = document.querySelector(".header-subnav");
    if (!headerSubnav || headerSubnav.dataset.initialized) return;

    headerSubnav.dataset.initialized = "true";

    headerSubnav.querySelectorAll(".header-group").forEach((group) => {
        group.addEventListener("toggle", () => {
            if (!group.open) return;

            headerSubnav.querySelectorAll(".header-group").forEach((other) => {
                if (other !== group) {
                    other.open = false;
                }
            });
        });
    });

    document.addEventListener("click", (event) => {
        if (event.target.closest(".header-subnav")) return;

        headerSubnav.querySelectorAll(".header-group").forEach((group) => {
            group.open = false;
        });
    });
}

function bootSiteScripts() {
    initNewsletter();
    initHeaderNav();
    highlightCurrentNav();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSiteScripts);
} else {
    bootSiteScripts();
}

document.addEventListener("rps-header-ready", bootSiteScripts);
