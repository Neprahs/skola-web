const BLOCK_LAYOUTS = [
    { value: "card", label: "Fotka hore, text dole" },
    { value: "image-left", label: "Foto vľavo, text vpravo" },
    { value: "image-right", label: "Text vľavo, foto vpravo" },
    { value: "banner", label: "Široká fotka nad textom" },
    { value: "text-only", label: "Len text (bez fotky)" },
];

const IMAGE_SIZES = [
    { value: "small", label: "Malá" },
    { value: "medium", label: "Stredná" },
    { value: "large", label: "Veľká" },
    { value: "full", label: "Na celú šírku" },
];

const HERO_STYLES = [
    { value: "large", label: "Veľká (predvolené)" },
    { value: "medium", label: "Stredná" },
    { value: "small", label: "Malá" },
    { value: "none", label: "Skryť úvodnú fotku" },
];

const ARTICLE_SECTION_TYPES = [
    { value: "text", label: "Textový odsek" },
    { value: "split", label: "Text + fotka (vedľa seba)" },
    { value: "image", label: "Samostatná fotka" },
];

function layoutEscapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function layoutSanitizeImageUrl(url) {
    if (!url) return "";
    const value = String(url).trim();
    if (value.startsWith("/") || value.startsWith("./") || value.startsWith("uploads/")) {
        return layoutEscapeHtml(value);
    }
    try {
        const parsed = new URL(value, window.location.href);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            return layoutEscapeHtml(parsed.href);
        }
    } catch {
        return "";
    }
    return "";
}

function normalizeLayout(value, fallback = "card") {
    return BLOCK_LAYOUTS.some((item) => item.value === value) ? value : fallback;
}

function normalizeImageSize(value, fallback = "medium") {
    return IMAGE_SIZES.some((item) => item.value === value) ? value : fallback;
}

function buildBlockClasses(block) {
    const layout = normalizeLayout(block.layout);
    const size = normalizeImageSize(block.imageSize);
    const classes = ["content-block"];

    if (layout === "card") {
        classes.push("content-block--card", `content-block--img-${size}`);
    } else if (layout === "banner") {
        classes.push("content-block--banner", `content-block--img-${size}`);
    } else if (layout === "text-only") {
        classes.push("content-block--text-only");
    } else {
        classes.push("content-block--split", `content-block--${layout}`, `content-block--img-${size}`);
    }

    if (block.link) classes.push("content-block--link");
    return classes.join(" ");
}

function buildBlockBodyHtml(block) {
    const title = block.title ? `<h3>${layoutEscapeHtml(block.title)}</h3>` : "";
    const text = block.text ? `<p>${layoutEscapeHtml(block.text)}</p>` : "";
    return `${title}${text}`;
}

function buildBlockImageHtml(block, extraClass = "") {
    const imageUrl = layoutSanitizeImageUrl(block.image);
    if (!imageUrl) return "";
    const cls = extraClass ? ` class="${extraClass}"` : "";
    return `<figure class="content-block-image"><img src="${imageUrl}" alt="" loading="lazy"${cls}></figure>`;
}

function renderContentBlock(block) {
    const layout = normalizeLayout(block.layout);
    const tag = block.link ? "a" : "article";
    const el = document.createElement(tag);
    el.className = buildBlockClasses(block);

    if (block.link) {
        el.href = block.link;
    }

    const bodyHtml = buildBlockBodyHtml(block);
    const imageHtml = layout === "text-only" ? "" : buildBlockImageHtml(block);

    if (layout === "card" || layout === "banner") {
        el.innerHTML = `${imageHtml}<div class="content-block-body">${bodyHtml}</div>`;
    } else if (layout === "text-only") {
        el.innerHTML = `<div class="content-block-body">${bodyHtml}</div>`;
    } else {
        el.innerHTML = `${imageHtml}<div class="content-block-body">${bodyHtml}</div>`;
    }

    return el;
}

function renderArticleSection(section) {
    const type = section.type || "text";
    const article = document.createElement("div");
    article.className = "article-section";

    if (type === "text") {
        article.classList.add("article-section--text");
        const text = section.text || section.title || "";
        if (section.title) {
            article.innerHTML = `<h2>${layoutEscapeHtml(section.title)}</h2><p>${layoutEscapeHtml(section.text || "")}</p>`;
        } else {
            article.innerHTML = `<p>${layoutEscapeHtml(text)}</p>`;
        }
        return article;
    }

    if (type === "image") {
        const size = normalizeImageSize(section.imageSize, "large");
        article.classList.add("article-section--image", `article-section--img-${size}`);
        const imageUrl = layoutSanitizeImageUrl(section.image);
        const caption = section.caption || section.title || "";
        article.innerHTML = `
            ${imageUrl ? `<figure class="article-section-figure"><img src="${imageUrl}" alt="" loading="lazy"></figure>` : ""}
            ${caption ? `<figcaption>${layoutEscapeHtml(caption)}</figcaption>` : ""}
        `;
        return article;
    }

    if (type === "split") {
        const layout = normalizeLayout(section.layout, "image-right");
        const size = normalizeImageSize(section.imageSize);
        article.classList.add("content-block", "content-block--split", `content-block--${layout}`, `content-block--img-${size}`);
        const imageHtml = buildBlockImageHtml(section);
        const title = section.title ? `<h2>${layoutEscapeHtml(section.title)}</h2>` : "";
        const text = section.text ? `<p>${layoutEscapeHtml(section.text)}</p>` : "";
        article.innerHTML = `${imageHtml}<div class="content-block-body">${title}${text}</div>`;
        return article;
    }

    article.innerHTML = `<p>${layoutEscapeHtml(section.text || "")}</p>`;
    return article;
}

function sectionsToContent(sections) {
    return (sections || [])
        .map((section) => {
            if (section.type === "image") return section.caption || "";
            return [section.title, section.text].filter(Boolean).join("\n\n");
        })
        .map((text) => text.trim())
        .filter(Boolean);
}

function contentToSections(content) {
    return (content || []).map((text, index) => ({
        id: `section-${index + 1}`,
        type: "text",
        text: String(text),
    }));
}

function buildLayoutSelect(name, value, options = BLOCK_LAYOUTS) {
    const selected = normalizeLayout(value, options[0]?.value);
    const opts = options
        .map((item) => `<option value="${layoutEscapeHtml(item.value)}"${item.value === selected ? " selected" : ""}>${layoutEscapeHtml(item.label)}</option>`)
        .join("");
    return `<select data-${name} class="admin-layout-select">${opts}</select>`;
}

function buildSizeSelect(name, value) {
    const selected = normalizeImageSize(value);
    const opts = IMAGE_SIZES
        .map((item) => `<option value="${layoutEscapeHtml(item.value)}"${item.value === selected ? " selected" : ""}>${layoutEscapeHtml(item.label)}</option>`)
        .join("");
    return `<select data-${name} class="admin-layout-select">${opts}</select>`;
}

function buildLayoutPreview(layout = "card") {
    const value = normalizeLayout(layout);
    return `<div class="admin-layout-preview" data-layout-preview="${layoutEscapeHtml(value)}" aria-hidden="true">
        <span class="admin-layout-preview-img"></span>
        <span class="admin-layout-preview-text"></span>
    </div>`;
}

function updateLayoutPreview(container, layout) {
    const preview = container?.querySelector("[data-layout-preview]");
    if (!preview) return;
    preview.dataset.layoutPreview = normalizeLayout(layout);
}

function bindLayoutPreview(select, container) {
    if (!select || !container) return;
    const sync = () => updateLayoutPreview(container, select.value);
    select.addEventListener("change", sync);
    sync();
}

window.RPS_CONTENT_LAYOUT = {
    BLOCK_LAYOUTS,
    IMAGE_SIZES,
    HERO_STYLES,
    ARTICLE_SECTION_TYPES,
    normalizeLayout,
    normalizeImageSize,
    renderContentBlock,
    renderArticleSection,
    sectionsToContent,
    contentToSections,
    buildLayoutSelect,
    buildSizeSelect,
    buildLayoutPreview,
    updateLayoutPreview,
    bindLayoutPreview,
    layoutEscapeHtml,
};
