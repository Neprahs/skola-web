const SK = {
    editTitle: "Upraviť stránku",
    pageLabel: "Stránka",
    langLabel: "Jazyk textov (ktorý jazyk upravujete)",
    langSk: "Slovenčina",
    langEn: "Angličtina",
    langCs: "Čeština",
    langDe: "Nemčina",
    langPl: "Poľština",
    langHu: "Maďarčina",
    langUk: "Ukrajinčina",
    noFields: "Na tejto stránke nie sú žiadne upraviteľné texty.",
    blocksTitle: "Vlastné sekcie (fotka + text)",
    blocksHelp: "Tieto sekcie sa zobrazia na konci vybranej stránky. Vyberte rozloženie (fotka vľavo/vpravo/hore) a veľkosť fotky.",
    addBlock: "+ Pridať sekciu",
    block: "Sekcia",
    remove: "Odstrániť",
    title: "Nadpis",
    text: "Text",
    photoOptional: "Fotka (voliteľné)",
    linkOptional: "Odkaz (voliteľné)",
    choosePhoto: "Vybrať foto",
    photoPlaceholder: "/uploads/foto.jpg",
    linkPlaceholder: "article.html?slug=... alebo clubs.html",
    layoutLabel: "Rozloženie",
    sizeLabel: "Veľkosť fotky",
    save: "Uložiť stránku",
    saving: "Ukladám zmeny…",
    saved: "✓ Stránka bola úspešne uložená.",
    loaded: "Stránky načítané. Upravte texty a stlačte „Uložiť stránku“.",
    loading: "Načítavam stránky…",
    uploadPhoto: "Nahrávam fotografiu…",
    photoUploaded: "Fotografia nahraná.",
    selectPage: "Najprv vyberte stránku zo zoznamu.",
    notReady: "Stránky ešte nie sú načítané. Počkajte chvíľu alebo obnovte stránku (Ctrl+F5).",
    notLoggedIn: "Nie ste prihlásený. Prihláste sa a skúste znova.",
    emptyBlock: "Vyplňte aspoň nadpis alebo text v novej sekcii, potom uložte.",
    demoPrefix: "Ukážka",
};

const LANG_NAMES = {
    sk: SK.langSk,
    en: SK.langEn,
    cs: SK.langCs,
    de: SK.langDe,
    pl: SK.langPl,
    hu: SK.langHu,
    uk: SK.langUk,
};

let contentManifest = null;
let contentStore = null;
let activeContentPageId = "";
let isSavingPage = false;

function collectTranslationKeys(prefixes, lang) {
    const dict = window.RPS_TRANSLATIONS?.[lang] || {};
    const keys = new Set();

    prefixes.forEach((prefix) => {
        Object.keys(dict).forEach((key) => {
            if (key.startsWith(prefix)) keys.add(key);
        });
    });

    return [...keys].sort();
}

function getFieldLabel(key) {
    const skDict = window.RPS_TRANSLATIONS?.sk || {};
    const skText = skDict[key];
    if (skText) {
        const short = String(skText).replace(/\s+/g, " ").trim();
        if (short.length <= 90) return short;
        return `${short.slice(0, 87)}…`;
    }

    return key
        .replace(/^page\./, "")
        .replace(/^demo\./, `${SK.demoPrefix} › `)
        .replace(/\./g, " › ");
}

function getPageDefinition(pageId) {
    return contentManifest?.pages?.find((page) => page.id === pageId) || null;
}

function getPageImages(pageId) {
    return (contentManifest?.images || []).filter((image) => image.page === pageId);
}

function isAdminDashboardOpen() {
    const dashboard = document.getElementById("admin-dashboard");
    return Boolean(dashboard && !dashboard.hidden);
}

function updateBlockImagePreview(row, url) {
    const placeholder = row.querySelector("[data-block-preview-placeholder]");
    let preview = row.querySelector("[data-block-preview]");

    if (!url) {
        preview?.remove();
        if (!placeholder) {
            const panel = row.querySelector(".admin-photo-panel--block");
            if (panel) {
                const empty = document.createElement("div");
                empty.className = "admin-image-preview admin-image-preview--empty";
                empty.dataset.blockPreviewPlaceholder = "true";
                empty.textContent = "Náhľad fotky";
                panel.appendChild(empty);
            }
        }
        return;
    }

    placeholder?.remove();

    if (!preview) {
        preview = document.createElement("img");
        preview.className = "admin-image-preview admin-image-preview--panel";
        preview.dataset.blockPreview = "true";
        preview.alt = "";
        row.querySelector(".admin-photo-panel--block")?.appendChild(preview);
    }

    preview.src = url;
    preview.classList.remove("admin-image-preview--empty");
}

function getBlocksForPage(pageId) {
    return contentStore?.blocks?.[pageId] || [];
}

function renderPageFieldEditor(pageDef, lang) {
    const fieldsHost = document.getElementById("page-fields");
    if (!fieldsHost) return;

    const dict = window.RPS_TRANSLATIONS?.[lang] || {};
    const overrides = contentStore?.overrides?.[lang] || {};
    const keys = collectTranslationKeys(pageDef.prefixes, lang);

    fieldsHost.innerHTML = "";

    if (!keys.length) {
        fieldsHost.innerHTML = `<div class="admin-blocks-empty admin-blocks-empty--compact"><p>${escapeHtml(SK.noFields)}</p></div>`;
        return;
    }

    keys.forEach((key) => {
        const value = overrides[key] ?? dict[key] ?? "";
        const isLong = String(value).length > 120 || String(value).includes("\n");

        const label = document.createElement("label");
        label.innerHTML = `
            <span>${escapeHtml(getFieldLabel(key))}</span>
            ${isLong
                ? `<textarea data-field-key="${escapeHtml(key)}" rows="4">${escapeHtml(String(value))}</textarea>`
                : `<input type="text" data-field-key="${escapeHtml(key)}" value="${escapeHtml(String(value))}">`}
        `;
        fieldsHost.appendChild(label);
    });
}

function renderPageImageEditor(pageId) {
    const imagesHost = document.getElementById("page-images");
    const imagesCard = document.getElementById("page-images-card");
    if (!imagesHost) return;

    const images = getPageImages(pageId);
    imagesHost.innerHTML = "";

    if (!images.length) {
        imagesHost.hidden = true;
        if (imagesCard) imagesCard.hidden = true;
        return;
    }

    imagesHost.hidden = false;
    if (imagesCard) imagesCard.hidden = false;

    images.forEach((imageDef) => {
        const current = contentStore?.images?.[imageDef.key] || imageDef.default || "";
        const row = document.createElement("div");
        row.className = "admin-photo-panel";
        row.innerHTML = `
            <span class="admin-field-label">${escapeHtml(imageDef.label)}</span>
            <div class="admin-image-row">
                <input type="text" data-image-key="${escapeHtml(imageDef.key)}" value="${escapeHtml(current)}">
                <label class="btn-secondary admin-import-label">
                    <span>${escapeHtml(SK.choosePhoto)}</span>
                    <input type="file" data-image-upload="${escapeHtml(imageDef.key)}" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
                </label>
            </div>
            ${current ? `<img src="${escapeHtml(current)}" class="admin-image-preview admin-image-preview--panel" alt="">` : `<div class="admin-image-preview admin-image-preview--empty">Náhľad fotky</div>`}
        `;
        imagesHost.appendChild(row);
    });

    imagesHost.querySelectorAll("[data-image-upload]").forEach((input) => {
        input.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            const key = event.target.dataset.imageUpload;
            if (!file || !key) return;

            try {
                showAdminMessage(SK.uploadPhoto);
                const result = await uploadArticleImage(file);
                const textInput = imagesHost.querySelector(`[data-image-key="${key}"]`);
                if (textInput) textInput.value = result.url;
                const preview = textInput?.closest(".admin-photo-panel")?.querySelector(".admin-image-preview");
                if (preview) {
                    preview.src = result.url;
                    preview.classList.remove("admin-image-preview--empty");
                } else if (textInput) {
                    const img = document.createElement("img");
                    img.src = result.url;
                    img.className = "admin-image-preview admin-image-preview--panel";
                    img.alt = "";
                    textInput.closest(".admin-image-row")?.insertAdjacentElement("afterend", img);
                }
                showAdminMessage(SK.photoUploaded);
            } catch (error) {
                showAdminMessage(error.message, true);
            }

            event.target.value = "";
        });
    });
}

function toggleBlocksEmptyState() {
    const blocksHost = document.getElementById("page-blocks");
    const empty = document.getElementById("page-blocks-empty");
    if (!blocksHost || !empty) return;
    const hasBlocks = blocksHost.children.length > 0;
    empty.hidden = hasBlocks;
    blocksHost.hidden = !hasBlocks;
}

function renderBlocksEditor(pageId) {
    const blocksHost = document.getElementById("page-blocks");
    if (!blocksHost) return;

    const blocks = getBlocksForPage(pageId);
    blocksHost.innerHTML = "";

    blocks.forEach((block, index) => {
        blocksHost.appendChild(createBlockEditorRow(block, index));
    });

    toggleBlocksEmptyState();
}

function createBlockEditorRow(block = {}, index = 0) {
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    const layoutSelect = layoutUi?.buildLayoutSelect("block-layout", block.layout || "card") || "";
    const sizeSelect = layoutUi?.buildSizeSelect("block-size", block.imageSize || "medium") || "";
    const layoutPreview = layoutUi?.buildLayoutPreview(block.layout || "card") || "";

    const row = document.createElement("div");
    row.className = "admin-block-item";
    row.dataset.blockId = block.id || `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    row.innerHTML = `
        <div class="admin-block-item-header">
            <div class="admin-block-title-wrap">
                <span class="admin-block-badge">${index + 1}</span>
                <strong>${escapeHtml(SK.block)} ${index + 1}</strong>
            </div>
            <button type="button" class="btn-danger" data-remove-block>${escapeHtml(SK.remove)}</button>
        </div>
        <div class="admin-layout-picker">
            <div class="admin-layout-row">
                <label>
                    <span>${escapeHtml(SK.layoutLabel)}</span>
                    ${layoutSelect}
                </label>
                <label>
                    <span>${escapeHtml(SK.sizeLabel)}</span>
                    ${sizeSelect}
                </label>
            </div>
            ${layoutPreview}
        </div>
        <div class="admin-block-content-grid">
            <div class="admin-block-fields">
                <label>
                    <span>${escapeHtml(SK.title)}</span>
                    <input type="text" data-block-title value="${escapeHtml(block.title || "")}">
                </label>
                <label>
                    <span>${escapeHtml(SK.text)}</span>
                    <textarea rows="4" data-block-text>${escapeHtml(block.text || "")}</textarea>
                </label>
                <label>
                    <span>${escapeHtml(SK.linkOptional)}</span>
                    <input type="text" data-block-link value="${escapeHtml(block.link || "")}" placeholder="${escapeHtml(SK.linkPlaceholder)}">
                </label>
            </div>
            <div class="admin-photo-panel admin-photo-panel--block">
                <span class="admin-field-label">${escapeHtml(SK.photoOptional)}</span>
                <div class="admin-image-row">
                    <input type="text" data-block-image value="${escapeHtml(block.image || "")}" placeholder="${escapeHtml(SK.photoPlaceholder)}">
                    <label class="btn-secondary admin-import-label">
                        <span>${escapeHtml(SK.choosePhoto)}</span>
                        <input type="file" data-block-upload accept="image/jpeg,image/png,image/webp,image/gif" hidden>
                    </label>
                </div>
                ${block.image
                    ? `<img src="${escapeHtml(block.image)}" class="admin-image-preview admin-image-preview--panel" data-block-preview alt="">`
                    : `<div class="admin-image-preview admin-image-preview--empty" data-block-preview-placeholder>Náhľad fotky</div>`}
            </div>
        </div>
    `;

    const layoutSelectEl = row.querySelector("[data-block-layout]");
    layoutUi?.bindLayoutPreview(layoutSelectEl, row.querySelector(".admin-layout-picker"));

    row.querySelector("[data-remove-block]")?.addEventListener("click", () => {
        row.remove();
        renumberBlockItems();
        toggleBlocksEmptyState();
    });

    row.querySelector("[data-block-upload]")?.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            showAdminMessage(SK.uploadPhoto);
            const result = await uploadArticleImage(file);
            const imageInput = row.querySelector("[data-block-image]");
            if (imageInput) imageInput.value = result.url;
            updateBlockImagePreview(row, result.url);
            showAdminMessage(SK.photoUploaded);
        } catch (error) {
            showAdminMessage(error.message, true);
        }

        event.target.value = "";
    });

    return row;
}

function renumberBlockItems() {
    document.querySelectorAll("#page-blocks .admin-block-item").forEach((row, index) => {
        const badge = row.querySelector(".admin-block-badge");
        const title = row.querySelector(".admin-block-title-wrap strong");
        if (badge) badge.textContent = String(index + 1);
        if (title) title.textContent = `${SK.block} ${index + 1}`;
    });
}

function collectBlocksFromEditor() {
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    return [...document.querySelectorAll(".admin-block-item")].map((row) => ({
        id: row.dataset.blockId || `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        layout: layoutUi?.normalizeLayout(row.querySelector("[data-block-layout]")?.value, "card") || "card",
        imageSize: layoutUi?.normalizeImageSize(row.querySelector("[data-block-size]")?.value, "medium") || "medium",
        title: row.querySelector("[data-block-title]")?.value.trim() || "",
        text: row.querySelector("[data-block-text]")?.value.trim() || "",
        image: row.querySelector("[data-block-image]")?.value.trim() || "",
        link: row.querySelector("[data-block-link]")?.value.trim() || "",
    })).filter((block) => block.title || block.text || block.image || block.link);
}

function renderPageEditor(pageId) {
    const pageDef = getPageDefinition(pageId);
    if (!pageDef) return;

    activeContentPageId = pageId;
    const lang = document.getElementById("page-lang")?.value || "sk";

    renderPageFieldEditor(pageDef, lang);
    renderPageImageEditor(pageId);
    renderBlocksEditor(pageId);
}

function applyPagesAdminLabels() {
    const addBtn = document.getElementById("add-block-btn");
    if (addBtn) addBtn.textContent = SK.addBlock;

    const saveBtn = document.getElementById("page-save-btn");
    if (saveBtn) saveBtn.textContent = SK.save;

    const langSelect = document.getElementById("page-lang");
    if (langSelect) {
        [...langSelect.options].forEach((option) => {
            option.textContent = LANG_NAMES[option.value] || option.value;
        });
    }
}

async function loadPagesAdminData() {
    applyPagesAdminLabels();
    showAdminMessage(SK.loading);

    try {
        const [manifest, store] = await Promise.all([
            loadContentManifest(),
            loadSiteContentStore(),
        ]);

        contentManifest = manifest;
        contentStore = store;

        const select = document.getElementById("page-select");
        if (!select) return;

        select.innerHTML = "";
        (manifest.pages || []).forEach((page) => {
            const option = document.createElement("option");
            option.value = page.id;
            option.textContent = page.label;
            select.appendChild(option);
        });

        if (!manifest.pages?.length) {
            showAdminMessage("Zoznam stránok sa nepodarilo načítať.", true);
            return;
        }

        const initialPage = activeContentPageId || manifest.pages[0].id;
        select.value = initialPage;
        renderPageEditor(initialPage);
        showAdminMessage(SK.loaded);
    } catch (error) {
        showAdminMessage(error.message, true);
        throw error;
    }
}

function setSaveButtonState(saving) {
    const saveBtn = document.getElementById("page-save-btn");
    if (!saveBtn) return;

    saveBtn.disabled = saving;
    saveBtn.textContent = saving ? SK.saving : SK.save;
}

async function saveCurrentPageContent() {
    if (isSavingPage) return;

    if (!isAdminDashboardOpen()) {
        showAdminMessage(SK.notLoggedIn, true);
        return;
    }

    if (!contentManifest?.pages?.length) {
        showAdminMessage(SK.notReady, true);
        return;
    }

    const pageId = activeContentPageId || document.getElementById("page-select")?.value;
    if (!pageId) {
        showAdminMessage(SK.selectPage, true);
        return;
    }

    activeContentPageId = pageId;
    const lang = document.getElementById("page-lang")?.value || "sk";
    const fields = {};
    const images = {};

    document.querySelectorAll("#page-editor-form [data-field-key]").forEach((el) => {
        fields[el.dataset.fieldKey] = el.value.trim();
    });

    document.querySelectorAll("#page-editor-form [data-image-key]").forEach((el) => {
        images[el.dataset.imageKey] = el.value.trim();
    });

    const blocks = collectBlocksFromEditor();

    try {
        const authenticated = await checkAdminAuth();
        if (!authenticated) {
            showAdminMessage(SK.notLoggedIn, true);
            return;
        }

        isSavingPage = true;
        setSaveButtonState(true);
        showAdminMessage(SK.saving);

        const result = await savePageContent(pageId, { lang, fields, images, blocks });
        contentStore = result.store;
        renderPageEditor(pageId);
        showAdminMessage(SK.saved);
    } catch (error) {
        showAdminMessage(error.message, true);
    } finally {
        isSavingPage = false;
        setSaveButtonState(false);
    }
}

function bindPagesAdmin() {
    applyPagesAdminLabels();

    document.getElementById("page-select")?.addEventListener("change", (event) => {
        renderPageEditor(event.target.value);
    });

    document.getElementById("page-lang")?.addEventListener("change", () => {
        if (activeContentPageId) renderPageEditor(activeContentPageId);
    });

    document.getElementById("page-editor-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        saveCurrentPageContent();
    });

    document.getElementById("add-block-btn")?.addEventListener("click", () => {
        const blocksHost = document.getElementById("page-blocks");
        if (!blocksHost) return;
        blocksHost.appendChild(createBlockEditorRow({}, blocksHost.children.length));
        toggleBlocksEmptyState();
    });

    document.querySelectorAll("[data-admin-tab]").forEach((button) => {
        button.addEventListener("click", () => {
            const tab = button.dataset.adminTab;
            document.querySelectorAll("[data-admin-tab]").forEach((item) => {
                item.classList.toggle("is-active", item.dataset.adminTab === tab);
            });
            document.getElementById("admin-tab-articles")?.toggleAttribute("hidden", tab !== "articles");
            document.getElementById("admin-tab-pages")?.toggleAttribute("hidden", tab !== "pages");

            if (tab === "pages") {
                applyPagesAdminLabels();
                if (isAdminDashboardOpen()) {
                    loadPagesAdminData().catch(() => {});
                }
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", bindPagesAdmin);
window.loadPagesAdminData = loadPagesAdminData;
