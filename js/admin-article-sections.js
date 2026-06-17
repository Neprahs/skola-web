const SECTION_SK = {
    heading: "Obsah článku",
    help: "Pridávajte odseky, fotky alebo kombinácie text + fotka. Vyberte rozloženie a veľkosť fotky.",
    addText: "+ Text",
    addSplit: "+ Text a fotka",
    addImage: "+ Fotka",
    section: "Časť",
    remove: "Odstrániť",
    type: "Typ",
    layout: "Rozloženie",
    size: "Veľkosť fotky",
    title: "Nadpis (voliteľné)",
    text: "Text",
    caption: "Popis pod fotkou",
    photo: "Fotka",
    choosePhoto: "Vybrať foto",
    heroStyle: "Úvodná fotka článku",
    empty: "Pridajte aspoň jednu časť s textom alebo fotkou.",
};

function createArticleSectionRow(section = {}, index = 0) {
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    const type = section.type || "text";
    const typeOptions = (layoutUi?.ARTICLE_SECTION_TYPES || []).map((item) => (
        `<option value="${layoutUi.layoutEscapeHtml(item.value)}"${item.value === type ? " selected" : ""}>${layoutUi.layoutEscapeHtml(item.label)}</option>`
    )).join("");

    const splitLayouts = (layoutUi?.BLOCK_LAYOUTS || []).filter((item) => (
        item.value === "image-left" || item.value === "image-right"
    ));
    const layoutSelect = layoutUi?.buildLayoutSelect("section-layout", section.layout || "image-right", splitLayouts) || "";
    const sizeSelect = layoutUi?.buildSizeSelect("section-size", section.imageSize || "medium") || "";

    const row = document.createElement("div");
    row.className = "admin-block-item admin-section-item";
    row.dataset.sectionId = section.id || `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    row.dataset.sectionType = type;

    row.innerHTML = `
        <div class="admin-block-item-header">
            <div class="admin-block-title-wrap">
                <span class="admin-block-badge">${index + 1}</span>
                <strong>${SECTION_SK.section} ${index + 1}</strong>
            </div>
            <button type="button" class="btn-danger" data-remove-section>${SECTION_SK.remove}</button>
        </div>
        <label class="admin-section-type-picker">
            <span>${SECTION_SK.type}</span>
            <select data-section-type class="admin-layout-select">${typeOptions}</select>
        </label>
        <div class="admin-section-fields" data-section-fields></div>
    `;

    const fieldsHost = row.querySelector("[data-section-fields]");
    fieldsHost.innerHTML = buildSectionFieldsHtml(type, section, layoutSelect, sizeSelect);
    bindSectionFieldInteractions(row);

    row.querySelector("[data-section-type]")?.addEventListener("change", (event) => {
        row.dataset.sectionType = event.target.value;
        const current = collectSectionFromRow(row);
        current.type = event.target.value;
        fieldsHost.innerHTML = buildSectionFieldsHtml(
            current.type,
            current,
            layoutUi?.buildLayoutSelect("section-layout", current.layout || "image-right", splitLayouts) || "",
            layoutUi?.buildSizeSelect("section-size", current.imageSize || "medium") || ""
        );
        bindSectionFieldInteractions(row);
    });

    row.querySelector("[data-remove-section]")?.addEventListener("click", () => {
        row.remove();
        renumberArticleSections();
        toggleArticleSectionsEmpty();
    });

    return row;
}

function bindSectionFieldInteractions(row) {
    bindSectionImageUpload(row);
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    const layoutSelect = row.querySelector("[data-section-layout]");
    const picker = row.querySelector(".admin-layout-picker");
    if (layoutSelect && picker) {
        layoutUi?.bindLayoutPreview(layoutSelect, picker);
    }
}

function buildSectionFieldsHtml(type, section, layoutSelect, sizeSelect) {
    const esc = window.RPS_CONTENT_LAYOUT?.layoutEscapeHtml || escapeHtml;
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    const layoutPreview = type === "split"
        ? layoutUi?.buildLayoutPreview(section.layout || "image-right") || ""
        : "";

    if (type === "text") {
        return `
            <div class="admin-block-fields">
                <label>
                    <span>${SECTION_SK.title}</span>
                    <input type="text" data-section-title value="${esc(section.title || "")}">
                </label>
                <label>
                    <span>${SECTION_SK.text}</span>
                    <textarea rows="5" data-section-text>${esc(section.text || "")}</textarea>
                </label>
            </div>
        `;
    }

    if (type === "image") {
        return `
            <div class="admin-layout-row">
                <label>
                    <span>${SECTION_SK.size}</span>
                    ${sizeSelect}
                </label>
            </div>
            <div class="admin-photo-panel">
                <span class="admin-field-label">${SECTION_SK.photo}</span>
                <div class="admin-image-row">
                    <input type="text" data-section-image value="${esc(section.image || "")}" placeholder="/uploads/foto.jpg">
                    <label class="btn-secondary admin-import-label">
                        <span>${SECTION_SK.choosePhoto}</span>
                        <input type="file" data-section-upload accept="image/jpeg,image/png,image/webp,image/gif" hidden>
                    </label>
                </div>
                ${section.image
                    ? `<img src="${esc(section.image)}" class="admin-image-preview admin-image-preview--panel" data-section-preview alt="">`
                    : `<div class="admin-image-preview admin-image-preview--empty" data-section-preview-placeholder>Náhľad fotky</div>`}
            </div>
            <label>
                <span>${SECTION_SK.caption}</span>
                <input type="text" data-section-caption value="${esc(section.caption || section.title || "")}">
            </label>
        `;
    }

    return `
        <div class="admin-layout-picker">
            <div class="admin-layout-row">
                <label>
                    <span>${SECTION_SK.layout}</span>
                    ${layoutSelect}
                </label>
                <label>
                    <span>${SECTION_SK.size}</span>
                    ${sizeSelect}
                </label>
            </div>
            ${layoutPreview}
        </div>
        <div class="admin-block-content-grid">
            <div class="admin-block-fields">
                <label>
                    <span>${SECTION_SK.title}</span>
                    <input type="text" data-section-title value="${esc(section.title || "")}">
                </label>
                <label>
                    <span>${SECTION_SK.text}</span>
                    <textarea rows="5" data-section-text>${esc(section.text || "")}</textarea>
                </label>
            </div>
            <div class="admin-photo-panel admin-photo-panel--block">
                <span class="admin-field-label">${SECTION_SK.photo}</span>
                <div class="admin-image-row">
                    <input type="text" data-section-image value="${esc(section.image || "")}" placeholder="/uploads/foto.jpg">
                    <label class="btn-secondary admin-import-label">
                        <span>${SECTION_SK.choosePhoto}</span>
                        <input type="file" data-section-upload accept="image/jpeg,image/png,image/webp,image/gif" hidden>
                    </label>
                </div>
                ${section.image
                    ? `<img src="${esc(section.image)}" class="admin-image-preview admin-image-preview--panel" data-section-preview alt="">`
                    : `<div class="admin-image-preview admin-image-preview--empty" data-section-preview-placeholder>Náhľad fotky</div>`}
            </div>
        </div>
    `;
}

function bindSectionImageUpload(row) {
    row.querySelector("[data-section-upload]")?.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            showAdminMessage("Nahrávam fotografiu…");
            const result = await uploadArticleImage(file);
            const imageInput = row.querySelector("[data-section-image]");
            if (imageInput) imageInput.value = result.url;

            let preview = row.querySelector("[data-section-preview]");
            row.querySelector("[data-section-preview-placeholder]")?.remove();
            if (!preview) {
                preview = document.createElement("img");
                preview.className = "admin-image-preview admin-image-preview--panel";
                preview.dataset.sectionPreview = "true";
                preview.alt = "";
                row.querySelector(".admin-photo-panel")?.appendChild(preview);
            }
            if (preview) {
                preview.src = result.url;
                preview.classList.remove("admin-image-preview--empty");
            }

            showAdminMessage("Fotografia nahraná.");
        } catch (error) {
            showAdminMessage(error.message, true);
        }

        event.target.value = "";
    });
}

function collectSectionFromRow(row) {
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    const type = row.querySelector("[data-section-type]")?.value || row.dataset.sectionType || "text";

    const base = {
        id: row.dataset.sectionId,
        type,
        title: row.querySelector("[data-section-title]")?.value.trim() || "",
        text: row.querySelector("[data-section-text]")?.value.trim() || "",
        image: row.querySelector("[data-section-image]")?.value.trim() || "",
        caption: row.querySelector("[data-section-caption]")?.value.trim() || "",
        layout: layoutUi?.normalizeLayout(row.querySelector("[data-section-layout]")?.value, "image-right") || "image-right",
        imageSize: layoutUi?.normalizeImageSize(row.querySelector("[data-section-size]")?.value, "medium") || "medium",
    };

    if (type === "image") {
        return {
            id: base.id,
            type,
            image: base.image,
            imageSize: base.imageSize,
            caption: base.caption,
        };
    }

    if (type === "split") {
        return {
            id: base.id,
            type,
            title: base.title,
            text: base.text,
            image: base.image,
            layout: base.layout,
            imageSize: base.imageSize,
        };
    }

    return {
        id: base.id,
        type: "text",
        title: base.title,
        text: base.text,
    };
}

function collectArticleSectionsFromEditor() {
    return [...document.querySelectorAll(".admin-section-item")]
        .map(collectSectionFromRow)
        .filter((section) => {
            if (section.type === "image") return Boolean(section.image);
            if (section.type === "split") return section.text || section.image || section.title;
            return section.text || section.title;
        });
}

function toggleArticleSectionsEmpty() {
    const host = document.getElementById("article-sections");
    const empty = document.getElementById("article-sections-empty");
    if (!host || !empty) return;
    const hasSections = host.children.length > 0;
    empty.hidden = hasSections;
    host.hidden = !hasSections;
}

function renderArticleSectionsEditor(sections = []) {
    const host = document.getElementById("article-sections");
    if (!host) return;

    host.innerHTML = "";
    sections.forEach((section, index) => {
        host.appendChild(createArticleSectionRow(section, index));
    });
    toggleArticleSectionsEmpty();
}

function renumberArticleSections() {
    document.querySelectorAll(".admin-section-item").forEach((row, index) => {
        const badge = row.querySelector(".admin-block-badge");
        const title = row.querySelector(".admin-block-title-wrap strong");
        if (badge) badge.textContent = String(index + 1);
        if (title) title.textContent = `${SECTION_SK.section} ${index + 1}`;
    });
}

function addArticleSection(type = "text") {
    const host = document.getElementById("article-sections");
    if (!host) return;

    const section = { type, id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    if (type === "split") {
        section.layout = "image-right";
        section.imageSize = "medium";
    }
    if (type === "image") {
        section.imageSize = "large";
    }

    host.appendChild(createArticleSectionRow(section, host.children.length));
    toggleArticleSectionsEmpty();
}

function bindArticleSectionsAdmin() {
    document.getElementById("add-section-text")?.addEventListener("click", () => addArticleSection("text"));
    document.getElementById("add-section-split")?.addEventListener("click", () => addArticleSection("split"));
    document.getElementById("add-section-image")?.addEventListener("click", () => addArticleSection("image"));

    const heroSelect = document.getElementById("article-hero-style");
    if (heroSelect && window.RPS_CONTENT_LAYOUT?.HERO_STYLES) {
        heroSelect.innerHTML = window.RPS_CONTENT_LAYOUT.HERO_STYLES
            .map((item) => `<option value="${item.value}">${item.label}</option>`)
            .join("");
    }
}

function loadArticleSectionsIntoEditor(article) {
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    let sections = article.sections;

    if (!sections?.length && article.content?.length) {
        sections = layoutUi?.contentToSections(article.content) || [];
    }

    if (!sections?.length) {
        sections = [{ id: "section-1", type: "text", text: "" }];
    }

    renderArticleSectionsEditor(sections);

    const heroSelect = document.getElementById("article-hero-style");
    if (heroSelect) {
        heroSelect.value = article.heroStyle || "large";
    }
}

function resetArticleSectionsEditor() {
    renderArticleSectionsEditor([{ id: "section-1", type: "text", text: "" }]);
    const heroSelect = document.getElementById("article-hero-style");
    if (heroSelect) heroSelect.value = "large";
}

document.addEventListener("DOMContentLoaded", bindArticleSectionsAdmin);
window.loadArticleSectionsIntoEditor = loadArticleSectionsIntoEditor;
window.resetArticleSectionsEditor = resetArticleSectionsEditor;
window.collectArticleSectionsFromEditor = collectArticleSectionsFromEditor;
