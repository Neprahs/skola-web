(function () {
    const header = document.getElementById("site-header");
    if (!header) return;

    const edupageLogo = `
<a href="https://rudnik.edupage.org/" target="_blank" rel="noopener noreferrer" class="edupage-link" data-i18n-aria="a11y.edupageLogin">
    <img src="images/edupage-logo.png" alt="EduPage" class="edupage-logo" width="45" height="45">
</a>`;

    const villageEmblem = `
<a href="https://www.rudnik.sk/" target="_blank" rel="noopener noreferrer" class="side-nav-village-link" data-i18n-aria="a11y.villageWebsite">
    <img src="images/rudnik-erb.png" alt="" class="side-nav-village-logo" width="45" height="45">
</a>`;

    function buildLanguageSwitcher() {
        const languages = window.RPS_I18N?.languages || [
            { code: "sk", label: "SK", name: "Slovenčina", flag: "images/flags/sk.svg" },
        ];
        const defaultLang = languages[0];

        const options = languages
            .map(
                ({ code, label, name, flag }) => `
            <button type="button" class="language-option" data-lang="${code}" role="option">
                <img src="${flag}" alt="" class="language-flag" width="20" height="14" decoding="async">
                <span class="language-option-text">${label} — ${name}</span>
            </button>`
            )
            .join("");

        return `
    <div class="language-switcher">
        <button type="button" class="accessibility-btn language-toggle" data-action="language-toggle" data-i18n-aria="a11y.language" aria-haspopup="listbox" aria-expanded="false">
            <img src="${defaultLang.flag}" alt="" class="language-flag" data-language-flag width="20" height="14" decoding="async">
            <span class="language-toggle-label" data-language-label>${defaultLang.label}</span>
            <span class="language-toggle-chevron" aria-hidden="true">▾</span>
        </button>
        <div class="language-menu" data-action="language-menu" role="listbox" hidden>
            ${options}
        </div>
    </div>`;
    }

    const accessibilityToolbar = `
<div class="accessibility-toolbar" data-i18n-aria="a11y.displaySettings">
    <div class="font-size-controls" role="group" data-i18n-aria="a11y.textSize">
        <button type="button" class="accessibility-btn" data-action="font-decrease" data-i18n-aria="a11y.smallerText">A−</button>
        <span class="font-size-label" data-font-size-label>100%</span>
        <button type="button" class="accessibility-btn" data-action="font-increase" data-i18n-aria="a11y.largerText">A+</button>
    </div>
    ${buildLanguageSwitcher()}
    <button type="button" class="accessibility-btn accessibility-btn-theme" data-action="theme-toggle" data-i18n-aria="a11y.themeLight" aria-pressed="false">
        <span class="theme-icon-sun" aria-hidden="true">☀</span>
        <span class="theme-icon-moon" aria-hidden="true">☾</span>
    </button>
</div>`;

    function menuLink(prefix, href, { nav, i18n, text, top = false, external = false } = {}) {
        const classes = [`${prefix}-link`];
        if (top) classes.push(`${prefix}-link-top`);
        if (external) classes.push(`${prefix}-link-external`);

        const attrs = [
            `href="${href}"`,
            `class="${classes.join(" ")}"`,
            nav ? `data-nav="${nav}"` : "",
            i18n ? `data-i18n="${i18n}"` : "",
            external ? 'target="_blank" rel="noopener noreferrer"' : "",
        ]
            .filter(Boolean)
            .join(" ");

        return `<a ${attrs}>${text}</a>`;
    }

    function buildSiteMenu(prefix, { includeNewsTop = false } = {}) {
        const l = (href, options) => menuLink(prefix, href, options);

        const newsTopLink = includeNewsTop
            ? l("news.html", { nav: "news", i18n: "nav.news", text: "Novinky", top: true })
            : "";

        return `
        ${l("index.html", { nav: "home", i18n: "nav.home", text: "Domov", top: true })}
        ${newsTopLink}

        <details class="${prefix}-group">
            <summary data-i18n="side.aboutSchool">O škole</summary>
            <div class="${prefix}-group-body">
                <details class="${prefix}-subgroup">
                    <summary data-i18n="side.basicInfo">Základné informácie</summary>
                    <div class="${prefix}-subgroup-body">
                        ${l("about.html", { nav: "about", i18n: "side.schoolProfile", text: "Profil školy" })}
                        ${l("partners.html", { nav: "partners", i18n: "side.partners", text: "Partneri" })}
                        ${l("projects.html", { nav: "projects", i18n: "side.projects", text: "Projekty" })}
                    </div>
                </details>

                <details class="${prefix}-subgroup">
                    <summary data-i18n="side.administration">Administratíva</summary>
                    <div class="${prefix}-subgroup-body">
                        ${l("school-board.html", { nav: "school-board", i18n: "side.schoolBoard", text: "Rada školy" })}
                        ${l("school-rules.html", { nav: "school-rules", i18n: "side.schoolRules", text: "Školský poriadok" })}
                        ${l("forms.html", { nav: "forms", i18n: "side.forms", text: "Tlačivá" })}
                        ${l("contracts.html", { nav: "contracts", i18n: "side.contracts", text: "Zmluvy a faktúry" })}
                    </div>
                </details>

                <details class="${prefix}-subgroup">
                    <summary data-i18n="side.admissions">Prijímačky</summary>
                    <div class="${prefix}-subgroup-body">
                        ${l("admissions.html#why-us", { nav: "admissions", i18n: "side.whyStudy", text: "Prečo študovať u nás?" })}
                        ${l("admissions.html#criteria", { nav: "admissions", i18n: "side.criteria", text: "Kritériá" })}
                        ${l("https://rudnik.edupage.org/prijimacky/", { i18n: "side.onlineApplication", text: "Elektronická prihláška", external: true })}
                    </div>
                </details>
            </div>
        </details>

        <details class="${prefix}-group">
            <summary data-i18n="side.studentsParents">Žiaci a rodičia</summary>
            <div class="${prefix}-group-body">
                ${l("https://rudnik.edupage.org/", { i18n: "side.edupagePortal", text: "EduPage portál", external: true })}

                <details class="${prefix}-subgroup">
                    <summary data-i18n="side.schoolLife">Život na škole</summary>
                    <div class="${prefix}-subgroup-body">
                        ${l("news.html", { nav: "news", i18n: "side.photoAlbum", text: "Fotoalbum" })}
                        ${l("library.html", { nav: "library", i18n: "side.library", text: "Knižnica" })}
                        ${l("clubs.html", { nav: "clubs", i18n: "side.clubs", text: "Krúžky" })}
                        ${l("teachers.html", { nav: "teachers", i18n: "side.teachers", text: "Učitelia" })}
                        ${l("guidance.html", { nav: "guidance", i18n: "side.guidance", text: "Výchovný poradca" })}
                        ${l("psychologist.html", { nav: "psychologist", i18n: "side.psychologist", text: "Školský psychológ" })}
                    </div>
                </details>
            </div>
        </details>

        ${l("contact.html", { nav: "contact", i18n: "nav.contact", text: "Kontakt", top: true })}
        ${l("privacy.html", { nav: "privacy", i18n: "side.privacy", text: "Ochrana súkromia", top: true })}
        `;
    }

    header.innerHTML = `
<header class="site-header">
    <div class="header-top">
        <div class="header-left">
            <a href="index.html" class="header-logo">
                <img src="images/rudnik-erb.png" alt="" class="header-logo-emblem" width="48" height="48">
                <span class="header-logo-text" data-i18n="school.name">Základná škola Rudník</span>
            </a>
        </div>

        <div class="header-actions">
            ${accessibilityToolbar}
            ${edupageLogo}
        </div>
    </div>

    <div class="header-rule" aria-hidden="true"></div>

    <nav class="header-subnav" id="site-nav" data-i18n-aria="a11y.mainNav">
        <div class="header-menu">
            ${buildSiteMenu("header", { includeNewsTop: false })}
        </div>
    </nav>
</header>`;

    document.getElementById("side-nav-toggle")?.remove();
    document.getElementById("side-nav-overlay")?.remove();
    document.getElementById("side-nav")?.remove();

    const toggle = document.createElement("button");
    toggle.className = "side-nav-toggle";
    toggle.type = "button";
    toggle.id = "side-nav-toggle";
    toggle.setAttribute("data-i18n-aria", "a11y.openMenu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "side-nav");
    toggle.innerHTML = "<span></span><span></span><span></span>";

    const overlay = document.createElement("div");
    overlay.className = "side-nav-overlay";
    overlay.id = "side-nav-overlay";
    overlay.hidden = true;

    const sideNav = document.createElement("aside");
    sideNav.className = "side-nav";
    sideNav.id = "side-nav";
    sideNav.setAttribute("data-i18n-aria", "a11y.sideNav");
    sideNav.setAttribute("aria-hidden", "true");
    sideNav.innerHTML = `
    <div class="side-nav-header">
        <div class="side-nav-brand">
            <span class="side-nav-title" data-i18n="side.menu">Menu</span>
            <span class="side-nav-subtitle" data-i18n="school.name">Základná škola Rudník</span>
        </div>
        <button type="button" class="side-nav-close" id="side-nav-close" data-i18n-aria="a11y.closeMenu">×</button>
    </div>

    <div class="side-nav-accessibility">
        ${accessibilityToolbar}
    </div>

    <nav class="side-nav-menu" data-i18n-aria="a11y.mainMenu">
        ${buildSiteMenu("side-nav", { includeNewsTop: true })}
    </nav>

    <div class="side-nav-actions">
        ${edupageLogo}
        ${villageEmblem}
    </div>`;

    document.body.appendChild(toggle);
    document.body.appendChild(overlay);
    document.body.appendChild(sideNav);

    bindSideNavPanel();

    document.dispatchEvent(new CustomEvent("rps-accessibility-update"));
    document.dispatchEvent(new CustomEvent("rps-i18n-update"));
    document.dispatchEvent(new CustomEvent("rps-header-ready"));

    function bindSideNavPanel() {
        const toggle = document.getElementById("side-nav-toggle");
        const closeBtn = document.getElementById("side-nav-close");
        const panel = document.getElementById("side-nav");
        const backdrop = document.getElementById("side-nav-overlay");

        if (!toggle || !panel || !backdrop || panel.dataset.bound === "true") return;
        panel.dataset.bound = "true";

        function labelForOpen(isOpen) {
            if (window.RPS_I18N?.t) {
                return window.RPS_I18N.t(isOpen ? "a11y.closeMenu" : "a11y.openMenu");
            }
            return isOpen ? "Close navigation menu" : "Open navigation menu";
        }

        function openPanel() {
            backdrop.hidden = false;
            void panel.offsetWidth;
            panel.classList.add("is-open");
            backdrop.classList.add("is-visible");
            toggle.setAttribute("aria-expanded", "true");
            toggle.setAttribute("aria-label", labelForOpen(true));
            panel.setAttribute("aria-hidden", "false");
            document.body.classList.add("side-nav-open");
        }

        function closePanel() {
            panel.classList.remove("is-open");
            backdrop.classList.remove("is-visible");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", labelForOpen(false));
            panel.setAttribute("aria-hidden", "true");
            document.body.classList.remove("side-nav-open");

            window.setTimeout(() => {
                if (!panel.classList.contains("is-open")) {
                    backdrop.hidden = true;
                }
            }, 300);
        }

        toggle.addEventListener("click", () => {
            if (panel.classList.contains("is-open")) {
                closePanel();
            } else {
                openPanel();
            }
        });

        closeBtn?.addEventListener("click", closePanel);
        backdrop.addEventListener("click", closePanel);

        panel.querySelectorAll("a.side-nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                if (!link.classList.contains("side-nav-link-external")) {
                    closePanel();
                }
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && panel.classList.contains("is-open")) {
                closePanel();
            }
        });

        document.addEventListener("rps-language-change", () => {
            const isOpen = panel.classList.contains("is-open");
            toggle.setAttribute("aria-label", labelForOpen(isOpen));
        });
    }
})();
