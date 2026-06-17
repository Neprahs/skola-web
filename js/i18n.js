(function () {
    const LANG_KEY = "rps-lang";
    const SUPPORTED_LANGS = ["sk", "en", "cs", "de", "pl", "hu", "uk"];
    const DEFAULT_LANG = "sk";

    const LANGUAGE_OPTIONS = [
        { code: "sk", label: "SK", name: "Slovenčina", flag: "images/flags/sk.svg" },
        { code: "en", label: "EN", name: "English", flag: "images/flags/gb.svg" },
        { code: "cs", label: "CS", name: "Čeština", flag: "images/flags/cz.svg" },
        { code: "de", label: "DE", name: "Deutsch", flag: "images/flags/de.svg" },
        { code: "pl", label: "PL", name: "Polski", flag: "images/flags/pl.svg" },
        { code: "hu", label: "HU", name: "Magyar", flag: "images/flags/hu.svg" },
        { code: "uk", label: "UA", name: "Українська", flag: "images/flags/ua.svg" },
    ];

    const LANG_LABELS = Object.fromEntries(LANGUAGE_OPTIONS.map((item) => [item.code, item.label]));

    function getLanguageMeta(lang) {
        return LANGUAGE_OPTIONS.find((item) => item.code === lang) || LANGUAGE_OPTIONS[0];
    }

    function getLanguageLabel(lang) {
        return getLanguageMeta(lang).label;
    }

    let currentLang = DEFAULT_LANG;
    let languageDocumentBound = false;

    function getStoredLang() {
        const stored = localStorage.getItem(LANG_KEY);
        return SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;
    }

    function t(key) {
        const dict = window.RPS_TRANSLATIONS?.[currentLang];
        if (dict && dict[key]) return dict[key];
        const fallback = window.RPS_TRANSLATIONS?.[DEFAULT_LANG];
        return fallback?.[key] || key;
    }

    function closeLanguageMenus() {
        document.querySelectorAll("[data-action='language-menu']").forEach((menu) => {
            menu.hidden = true;
        });
        document.querySelectorAll("[data-action='language-toggle']").forEach((button) => {
            button.setAttribute("aria-expanded", "false");
        });
    }

    function syncLanguageUI() {
        const meta = getLanguageMeta(currentLang);

        document.querySelectorAll("[data-language-label]").forEach((el) => {
            el.textContent = meta.label;
        });

        document.querySelectorAll("[data-language-flag]").forEach((el) => {
            el.src = meta.flag;
        });

        document.querySelectorAll(".language-option").forEach((button) => {
            const isActive = button.dataset.lang === currentLang;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });
    }

    function applyTranslations() {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.dataset.i18n;
            if (!key || el.dataset.i18nLock === "true") return;
            el.textContent = t(key);
        });

        document.querySelectorAll("[data-i18n-html]").forEach((el) => {
            const key = el.dataset.i18nHtml;
            if (!key) return;
            el.innerHTML = t(key);
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
            el.placeholder = t(el.dataset.i18nPlaceholder);
        });

        document.querySelectorAll("[data-i18n-title]").forEach((el) => {
            el.title = t(el.dataset.i18nTitle);
        });

        document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
            el.setAttribute("aria-label", t(el.dataset.i18nAria));
        });

        document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
            el.alt = t(el.dataset.i18nAlt);
        });

        const docTitleKey = document.documentElement.dataset.docTitle;
        if (docTitleKey) {
            document.title = t(docTitleKey);
        }

        syncLanguageUI();
        document.documentElement.lang = currentLang;
        document.dispatchEvent(new CustomEvent("rps-language-change", { detail: { lang: currentLang } }));
    }

    function setLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) return;
        currentLang = lang;
        localStorage.setItem(LANG_KEY, lang);
        applyTranslations();
    }

    function bindLanguageControls() {
        document.querySelectorAll("[data-action='language-toggle']").forEach((button) => {
            if (button.dataset.bound) return;
            button.dataset.bound = "true";

            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const menu = button.parentElement?.querySelector("[data-action='language-menu']");
                if (!menu) return;

                const willOpen = menu.hidden;
                closeLanguageMenus();

                if (willOpen) {
                    menu.hidden = false;
                    button.setAttribute("aria-expanded", "true");
                }
            });
        });

        document.querySelectorAll(".language-option").forEach((button) => {
            if (button.dataset.bound) return;
            button.dataset.bound = "true";

            button.addEventListener("click", (event) => {
                event.stopPropagation();
                setLanguage(button.dataset.lang);
                closeLanguageMenus();
            });
        });

        if (!languageDocumentBound) {
            languageDocumentBound = true;
            document.addEventListener("click", closeLanguageMenus);
            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    closeLanguageMenus();
                }
            });
        }
    }

    function init() {
        currentLang = getStoredLang();
        document.documentElement.lang = currentLang;
        bindLanguageControls();

        const boot = async () => {
            if (typeof window.loadSiteContentOverrides === "function") {
                try {
                    await window.loadSiteContentOverrides();
                } catch {
                    // Static preview without backend.
                }
            }

            applyTranslations();
            if (typeof window.refreshSiteContentOnPage === "function") {
                window.refreshSiteContentOnPage();
            }
        };

        boot();
    }

    window.RPS_I18N = {
        t,
        apply: applyTranslations,
        setLanguage,
        getLanguage: () => currentLang,
        supported: SUPPORTED_LANGS,
        languages: LANGUAGE_OPTIONS,
    };

    currentLang = getStoredLang();
    document.documentElement.lang = currentLang;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    document.addEventListener("rps-i18n-update", init);
})();
