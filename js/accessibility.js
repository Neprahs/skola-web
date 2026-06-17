(function () {
    const THEME_KEY = "rps-theme";
    const FONT_SCALE_KEY = "rps-font-scale";
    const FONT_STEPS = [0.85, 0.925, 1, 1.075, 1.15, 1.225];
    const DEFAULT_FONT_INDEX = 2;

    function getFontIndex(scale) {
        const index = FONT_STEPS.indexOf(scale);
        return index === -1 ? DEFAULT_FONT_INDEX : index;
    }

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(THEME_KEY, theme);
        syncThemeButtons(theme);
    }

    function applyFontScale(scale) {
        document.documentElement.style.setProperty("--font-scale", String(scale));
        localStorage.setItem(FONT_SCALE_KEY, String(scale));
        syncFontLabels(scale);
        syncFontButtons(scale);
    }

    function t(key, fallback) {
        return window.RPS_I18N?.t(key) || fallback;
    }

    function syncThemeButtons(theme) {
        const isDark = theme === "dark";
        document.querySelectorAll('[data-action="theme-toggle"]').forEach((button) => {
            button.setAttribute(
                "aria-label",
                isDark ? t("a11y.themeDark", "Switch to light mode") : t("a11y.themeLight", "Switch to dark mode")
            );
            button.setAttribute("aria-pressed", String(isDark));
            button.classList.toggle("is-dark", isDark);
        });
    }

    function syncA11yLabels() {
        const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
        syncThemeButtons(theme);
        document.querySelectorAll('[data-action="font-decrease"]').forEach((button) => {
            button.setAttribute("aria-label", t("a11y.smallerText", "Smaller text"));
        });
        document.querySelectorAll('[data-action="font-increase"]').forEach((button) => {
            button.setAttribute("aria-label", t("a11y.largerText", "Larger text"));
        });
    }

    function syncFontLabels(scale) {
        const label = `${Math.round(scale * 100)}%`;
        document.querySelectorAll("[data-font-size-label]").forEach((el) => {
            el.textContent = label;
        });
    }

    function syncFontButtons(scale) {
        const index = getFontIndex(scale);
        document.querySelectorAll('[data-action="font-decrease"]').forEach((button) => {
            button.disabled = index <= 0;
        });
        document.querySelectorAll('[data-action="font-increase"]').forEach((button) => {
            button.disabled = index >= FONT_STEPS.length - 1;
        });
    }

    function initPreferences() {
        const storedTheme = localStorage.getItem(THEME_KEY);
        const theme = storedTheme === "dark" ? "dark" : "light";
        const storedScale = Number.parseFloat(localStorage.getItem(FONT_SCALE_KEY));
        const scale = FONT_STEPS.includes(storedScale) ? storedScale : FONT_STEPS[DEFAULT_FONT_INDEX];

        applyTheme(theme);
        applyFontScale(scale);
    }

    function bindControls() {
        document.querySelectorAll('[data-action="theme-toggle"]').forEach((button) => {
            if (button.dataset.bound) return;
            button.dataset.bound = "true";
            button.addEventListener("click", () => {
                const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
                applyTheme(nextTheme);
            });
        });

        document.querySelectorAll('[data-action="font-decrease"]').forEach((button) => {
            if (button.dataset.bound) return;
            button.dataset.bound = "true";
            button.addEventListener("click", () => {
                const current = Number.parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue("--font-scale")
                );
                const index = getFontIndex(current);
                if (index > 0) applyFontScale(FONT_STEPS[index - 1]);
            });
        });

        document.querySelectorAll('[data-action="font-increase"]').forEach((button) => {
            if (button.dataset.bound) return;
            button.dataset.bound = "true";
            button.addEventListener("click", () => {
                const current = Number.parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue("--font-scale")
                );
                const index = getFontIndex(current);
                if (index < FONT_STEPS.length - 1) applyFontScale(FONT_STEPS[index + 1]);
            });
        });

        const currentScale = Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--font-scale")
        ) || FONT_STEPS[DEFAULT_FONT_INDEX];
        syncA11yLabels();
        syncFontLabels(currentScale);
        syncFontButtons(currentScale);
    }

    initPreferences();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindControls);
    } else {
        bindControls();
    }

    document.addEventListener("rps-accessibility-update", bindControls);
    document.addEventListener("rps-language-change", syncA11yLabels);
})();
