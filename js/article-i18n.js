(function () {
    const ARTICLE_LANGS = ["sk", "en", "cs", "de", "pl", "hu", "uk"];

    const LANG_LABELS = {
        sk: "Slovenčina",
        en: "English",
        cs: "Čeština",
        de: "Deutsch",
        pl: "Polski",
        hu: "Magyar",
        uk: "Українська",
    };

    function isMultilingualField(value) {
        return Boolean(
            value
            && typeof value === "object"
            && !Array.isArray(value)
            && ARTICLE_LANGS.some((lang) => Object.prototype.hasOwnProperty.call(value, lang))
        );
    }

    function toMultilingualField(value, fallbackLang = "sk") {
        if (isMultilingualField(value)) return { ...value };
        if (typeof value === "string") return { [fallbackLang]: value };
        return { [fallbackLang]: "" };
    }

    function getFieldForLang(value, lang, fallbackLang = "sk") {
        if (isMultilingualField(value)) {
            return value[lang] || value[fallbackLang] || value.en || "";
        }
        if (typeof value === "string") return lang === fallbackLang ? value : "";
        return "";
    }

    function setFieldForLang(value, lang, text) {
        const next = toMultilingualField(value);
        next[lang] = text;
        return next;
    }

    function expandSectionsForLang(sections, lang) {
        if (!Array.isArray(sections)) return [];

        return sections.map((section) => ({
            ...section,
            title: getFieldForLang(section.title, lang),
            text: getFieldForLang(section.text, lang),
            caption: getFieldForLang(section.caption, lang),
        }));
    }

    function mergeSectionsFromLang(sections, collected, lang) {
        const base = Array.isArray(sections) ? sections : [];

        return collected.map((item, index) => {
            const existing = base[index] || {
                id: item.id,
                type: item.type,
            };

            const merged = {
                ...existing,
                id: item.id || existing.id,
                type: item.type || existing.type,
                image: item.image || existing.image || "",
                layout: item.layout || existing.layout,
                imageSize: item.imageSize || existing.imageSize,
                title: setFieldForLang(existing.title, lang, item.title || ""),
                text: setFieldForLang(existing.text, lang, item.text || ""),
                caption: setFieldForLang(existing.caption, lang, item.caption || item.title || ""),
            };

            if (merged.type === "image") {
                delete merged.title;
                delete merged.text;
            }

            if (merged.type === "text") {
                delete merged.image;
                delete merged.caption;
                delete merged.layout;
                delete merged.imageSize;
            }

            return merged;
        });
    }

    function buildMultilingualContent(sections, lang) {
        const layoutUi = window.RPS_CONTENT_LAYOUT;
        const localized = expandSectionsForLang(sections, lang);
        return layoutUi?.sectionsToContent(localized) || [];
    }

    function buildMultilingualContentMap(sections) {
        const content = {};
        ARTICLE_LANGS.forEach((lang) => {
            const paragraphs = buildMultilingualContent(sections, lang);
            if (paragraphs.length) content[lang] = paragraphs;
        });
        return content;
    }

    function normalizeArticleForStorage(article, lang) {
        const layoutUi = window.RPS_CONTENT_LAYOUT;
        let sections = Array.isArray(article.sections) ? article.sections : [];

        if (!sections.length) {
            const contentValue = article.content;
            const skContent = Array.isArray(contentValue)
                ? contentValue
                : contentValue?.sk || [];
            sections = layoutUi?.contentToSections(skContent) || [];
        }

        ARTICLE_LANGS.forEach((code) => {
            if (code === lang) return;
            const overlay = window.RPS_ARTICLE_TRANSLATIONS?.[article.id]?.[code];
            if (!overlay) return;

            sections = mergeSectionsFromLang(
                sections,
                layoutUi?.contentToSections(overlay.content || []) || [{ id: `legacy-${code}`, type: "text", text: "" }],
                code
            );

            if (overlay.title) {
                sections.forEach((section, index) => {
                    if (index === 0 && section.type === "text") {
                        section.title = setFieldForLang(section.title, code, "");
                    }
                });
            }
        });

        return {
            title: setFieldForLang(
                toMultilingualField(article.title),
                lang,
                getFieldForLang(article.title, lang)
            ),
            excerpt: setFieldForLang(
                toMultilingualField(article.excerpt),
                lang,
                getFieldForLang(article.excerpt, lang)
            ),
            sections: mergeSectionsFromLang(
                sections,
                expandSectionsForLang(sections, lang),
                lang
            ),
        };
    }

    function applyTranslationOverlayToArticle(article) {
        const title = toMultilingualField(article.title);
        const excerpt = toMultilingualField(article.excerpt);
        const layoutUi = window.RPS_CONTENT_LAYOUT;

        let sections = Array.isArray(article.sections) ? JSON.parse(JSON.stringify(article.sections)) : [];
        if (!sections.length) {
            const contentValue = article.content;
            const skContent = Array.isArray(contentValue) ? contentValue : contentValue?.sk || [];
            sections = layoutUi?.contentToSections(skContent) || [];
        }

        sections = sections.map((section) => ({
            ...section,
            title: toMultilingualField(section.title),
            text: toMultilingualField(section.text),
            caption: toMultilingualField(section.caption),
        }));

        if (typeof article.title === "string") title.sk = article.title;
        if (typeof article.excerpt === "string") excerpt.sk = article.excerpt;

        ARTICLE_LANGS.forEach((lang) => {
            if (lang === "sk") return;

            const overlay = window.RPS_ARTICLE_TRANSLATIONS?.[article.id]?.[lang];
            if (!overlay) return;

            if (overlay.title) title[lang] = overlay.title;
            if (overlay.excerpt) excerpt[lang] = overlay.excerpt;

            if (overlay.content?.length) {
                const overlaySections = layoutUi?.contentToSections(overlay.content) || [];
                sections = mergeSectionsFromLang(sections, overlaySections, lang);
            }
        });

        return { title, excerpt, sections };
    }

    window.RPS_ARTICLE_I18N = {
        ARTICLE_LANGS,
        LANG_LABELS,
        isMultilingualField,
        toMultilingualField,
        getFieldForLang,
        setFieldForLang,
        expandSectionsForLang,
        mergeSectionsFromLang,
        buildMultilingualContentMap,
        normalizeArticleForStorage,
        applyTranslationOverlayToArticle,
    };
})();
