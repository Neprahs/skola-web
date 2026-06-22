function t(key, fallback) {
    return window.RPS_I18N?.t(key) || fallback;
}

let adminArticles = [];
let isAuthenticated = false;
let editingArticleId = "";
let articleEditDraft = null;
let currentArticleLang = "sk";

function getArticleI18n() {
    return window.RPS_ARTICLE_I18N;
}

function getCurrentArticleLang() {
    return document.getElementById("article-lang")?.value || currentArticleLang || "sk";
}

function syncArticleFormToDraft() {
    if (!articleEditDraft) return;

    const i18n = getArticleI18n();
    const lang = getCurrentArticleLang();
    if (!i18n) return;

    const title = document.getElementById("article-title").value.trim();
    const excerpt = document.getElementById("article-excerpt").value.trim();
    const collected = typeof window.collectArticleSectionsFromEditor === "function"
        ? window.collectArticleSectionsFromEditor()
        : [];

    articleEditDraft.title = i18n.setFieldForLang(articleEditDraft.title, lang, title);
    articleEditDraft.excerpt = i18n.setFieldForLang(articleEditDraft.excerpt, lang, excerpt);
    articleEditDraft.sections = i18n.mergeSectionsFromLang(
        articleEditDraft.sections,
        collected,
        lang
    );
    articleEditDraft.image = document.getElementById("article-image").value.trim();
    articleEditDraft.date = document.getElementById("article-date").value;
    articleEditDraft.featured = document.getElementById("article-featured").checked;
    articleEditDraft.heroStyle = document.getElementById("article-hero-style")?.value || "large";
}

function loadArticleDraftToForm(lang = getCurrentArticleLang()) {
    if (!articleEditDraft) return;

    const i18n = getArticleI18n();
    if (!i18n) return;

    currentArticleLang = lang;
    const langSelect = document.getElementById("article-lang");
    if (langSelect) langSelect.value = lang;

    document.getElementById("article-title").value = i18n.getFieldForLang(articleEditDraft.title, lang);
    document.getElementById("article-excerpt").value = i18n.getFieldForLang(articleEditDraft.excerpt, lang);
    document.getElementById("article-image").value = articleEditDraft.image || "";
    document.getElementById("article-date").value = articleEditDraft.date || "";
    document.getElementById("article-featured").checked = Boolean(articleEditDraft.featured);
    updateImagePreview(articleEditDraft.image || "");

    if (typeof window.loadArticleSectionsIntoEditor === "function") {
        window.loadArticleSectionsIntoEditor({
            sections: i18n.expandSectionsForLang(articleEditDraft.sections, lang),
            heroStyle: articleEditDraft.heroStyle,
            content: [],
        });
    }
}

function buildArticleDraftFromRecord(article) {
    const i18n = getArticleI18n();
    if (!i18n) return null;

    const merged = i18n.applyTranslationOverlayToArticle(article);

    return {
        id: article.id,
        title: merged.title,
        excerpt: merged.excerpt,
        sections: merged.sections,
        image: article.image,
        date: article.date,
        featured: article.featured,
        heroStyle: article.heroStyle || "large",
    };
}

function createEmptyArticleDraft() {
    const i18n = getArticleI18n();
    const emptySection = [{ id: "section-1", type: "text", text: "" }];

    return {
        id: "",
        title: i18n?.toMultilingualField("") || { sk: "" },
        excerpt: i18n?.toMultilingualField("") || { sk: "" },
        sections: emptySection,
        image: "",
        date: new Date().toISOString().slice(0, 10),
        featured: false,
        heroStyle: "large",
    };
}

function handleArticleLangChange() {
    if (!articleEditDraft) return;
    syncArticleFormToDraft();
    loadArticleDraftToForm(getCurrentArticleLang());
}

function renderAdminList() {
    const list = document.getElementById("admin-article-list");
    if (!list) return;

    list.innerHTML = "";

    if (!adminArticles.length) {
        list.innerHTML = `<p class="empty-state">${escapeHtml(t("page.admin.list.empty", "No articles yet."))}</p>`;
        return;
    }

    sortArticlesByDate(adminArticles).forEach((article) => {
        const displayArticle = localizeArticle(article);
        const item = document.createElement("article");
        item.className = "admin-list-item";
        item.innerHTML = `
            <div>
                <h3>${escapeHtml(displayArticle.title)}</h3>
                <p>${formatArticleDate(article.date)} · ${article.featured ? escapeHtml(t("page.admin.list.featured", "Featured in carousel")) : escapeHtml(t("page.admin.list.newsOnly", "News only"))}</p>
            </div>
            <div class="admin-list-actions">
                <button type="button" class="btn-secondary" data-edit="${escapeHtml(article.id)}">${escapeHtml(t("page.admin.list.edit", "Edit"))}</button>
                <button type="button" class="btn-danger" data-delete="${escapeHtml(article.id)}">${escapeHtml(t("page.admin.list.delete", "Delete"))}</button>
            </div>
        `;
        list.appendChild(item);
    });

    list.querySelectorAll("[data-edit]").forEach((button) => {
        button.addEventListener("click", () => loadArticleIntoForm(button.dataset.edit));
    });

    list.querySelectorAll("[data-delete]").forEach((button) => {
        button.addEventListener("click", () => deleteArticle(button.dataset.delete));
    });
}

function syncAdminFormTitle() {
    const formTitle = document.getElementById("form-title");
    if (!formTitle) return;

    formTitle.textContent = editingArticleId
        ? t("page.admin.form.editTitle", "Edit article")
        : t("page.admin.form.addTitle", "Add new article");
}

function loadArticleIntoForm(id) {
    const article = adminArticles.find((item) => item.id === id);
    if (!article) return;

    editingArticleId = article.id;
    articleEditDraft = buildArticleDraftFromRecord(article);
    document.getElementById("article-id").value = article.id;
    loadArticleDraftToForm("sk");
    document.getElementById("cancel-edit").hidden = false;
    syncAdminFormTitle();
    window.scrollTo({ top: document.getElementById("admin-article-form").offsetTop - 20, behavior: "smooth" });
}

function resetForm() {
    document.getElementById("admin-article-form").reset();
    document.getElementById("article-id").value = "";
    editingArticleId = "";
    articleEditDraft = createEmptyArticleDraft();
    currentArticleLang = "sk";
    document.getElementById("cancel-edit").hidden = true;
    syncAdminFormTitle();
    updateImagePreview("");
    loadArticleDraftToForm("sk");
}

function updateImagePreview(url) {
    const preview = document.getElementById("image-preview");
    if (!preview) return;

    if (url) {
        preview.src = url;
        preview.hidden = false;
    } else {
        preview.removeAttribute("src");
        preview.hidden = true;
    }
}

async function deleteArticle(id) {
    if (!confirm(t("page.admin.confirm.delete", "Delete this article?"))) return;

    try {
        await deleteArticleById(id);
        adminArticles = adminArticles.filter((article) => article.id !== id);
        renderAdminList();
        showAdminMessage(t("page.admin.msg.deleted", "Article deleted."));
    } catch (error) {
        showAdminMessage(error.message, true);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const i18n = getArticleI18n();
    if (!articleEditDraft || !i18n) return;

    syncArticleFormToDraft();

    const lang = "sk";
    const title = i18n.getFieldForLang(articleEditDraft.title, lang);
    const excerpt = i18n.getFieldForLang(articleEditDraft.excerpt, lang);
    const image = articleEditDraft.image?.trim();
    const date = articleEditDraft.date;
    const featured = articleEditDraft.featured;
    const heroStyle = articleEditDraft.heroStyle || "large";
    const sections = articleEditDraft.sections;
    const content = i18n.buildMultilingualContentMap(sections);
    const skContent = content.sk || i18n.buildMultilingualContent(sections, "sk");

    if (!title || !excerpt || !image || !date || !sections.length || !skContent.length) {
        showAdminMessage(
            !skContent.length
                ? "Vyplňte text alebo pridajte fotku v častiach článku (aspoň v slovenčine)."
                : "Vyplňte všetky povinné polia aspoň v slovenčine.",
            true
        );
        return;
    }

    const payload = {
        title: articleEditDraft.title,
        excerpt: articleEditDraft.excerpt,
        image,
        date,
        featured,
        content,
        sections,
        heroStyle,
    };

    try {
        const idField = document.getElementById("article-id");
        if (idField.value) {
            const updated = await updateArticle(idField.value, payload);
            adminArticles = adminArticles.map((item) => (item.id === updated.id ? updated : item));
            showAdminMessage("Článok bol uložený.");
        } else {
            const created = await createArticle(payload);
            adminArticles.push(created);
            showAdminMessage("Článok bol pridaný.");
        }

        renderAdminList();
        resetForm();
    } catch (error) {
        showAdminMessage(error.message, true);
    }
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        showAdminMessage(t("page.admin.msg.imageType", "Použite JPG, PNG, WebP alebo GIF."), true);
        event.target.value = "";
        return;
    }

    try {
        showAdminMessage(t("page.admin.msg.uploading", "Nahrávam fotografiu..."));
        const result = await uploadArticleImage(file);
        document.getElementById("article-image").value = result.url;
        updateImagePreview(result.url);
        showAdminMessage(t("page.admin.msg.uploaded", "Fotografia nahraná. Teraz vyplňte text a uložte článok."));
    } catch (error) {
        showAdminMessage(error.message, true);
    }

    event.target.value = "";
}

async function handleLogin(event) {
    event.preventDefault();

    const password = document.getElementById("admin-password").value;

    try {
        await loginAdmin(password);
        await showAdminDashboard();
        showAdminMessage(t("page.admin.msg.loggedIn", "Logged in successfully."));
    } catch (error) {
        showAdminMessage(error.message, true);
    }
}

async function handleLogout() {
    try {
        await logoutAdmin();
        showLoginScreen();
    } catch (error) {
        showAdminMessage(error.message, true);
    }
}

function showLoginScreen() {
    isAuthenticated = false;
    document.getElementById("admin-login").hidden = false;
    document.getElementById("admin-dashboard").hidden = true;
}

async function showAdminDashboard() {
    isAuthenticated = true;
    document.getElementById("admin-login").hidden = true;
    document.getElementById("admin-dashboard").hidden = false;
    adminArticles = await loadArticles();
    renderAdminList();

    if (typeof window.loadPagesAdminData === "function") {
        window.loadPagesAdminData().catch(() => {});
    }
}

function showAdminMessage(text, isError = false) {
    const message = document.getElementById("admin-message");
    if (!message) return;
    message.textContent = text;
    message.className = `admin-message${isError ? " is-error" : ""}`;
}

function getAdminEnvironment() {
    const host = window.location.hostname;
    if (["localhost", "127.0.0.1"].includes(host)) return "local";
    if (host.includes("onrender.com")) return "render";
    return "static";
}

function updateStaffGuide() {
    const body = document.getElementById("admin-staff-guide-body");
    if (!body) return;

    const env = getAdminEnvironment();

    if (env === "render") {
        body.innerHTML = `
            <ol>
                <li>Prihláste sa heslom, ktoré nastavil správca webu.</li>
                <li>Upravte obsah v záložkách <strong>Novinky</strong> alebo <strong>Stránky</strong>.</li>
                <li>Kliknite <strong>Uložiť</strong> — zmeny sa okamžite zobrazia na webe.</li>
            </ol>
            <p class="admin-staff-guide-note">Toto je online verzia — funguje z akéhokoľvek počítača. Verejný web aj admin sú na tejto adrese.</p>
        `;
        return;
    }

    if (env === "local") {
        body.innerHTML = `
            <ol>
                <li>Spustite súbor <code>SPUSTIT-ADMIN.bat</code> (nechajte okno otvorené).</li>
                <li>Otvorte <code>http://localhost:3000/admin</code>.</li>
                <li>Prihláste sa heslom (predvolené: <code>rschool2026</code>).</li>
                <li>Upravte obsah a kliknite <strong>Uložiť</strong>.</li>
            </ol>
            <p class="admin-staff-guide-note">Pre online úpravy bez počítača nasaďte backend na Render.</p>
        `;
        return;
    }

    body.innerHTML = `
        <p class="admin-staff-guide-note">Na tejto adrese (Vercel) admin nefunguje — chýba server. Použite online adresu z Render alebo spustite <code>SPUSTIT-ADMIN.bat</code> na školskom PC.</p>
    `;
}

function updateBackendNotice() {
    const note = document.getElementById("admin-backend-note");
    if (!note) return;
    note.hidden = getAdminEnvironment() !== "static";
}

async function initAdminPage() {
    updateStaffGuide();
    updateBackendNotice();
    document.getElementById("login-form")?.addEventListener("submit", handleLogin);
    document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
    document.getElementById("admin-article-form")?.addEventListener("submit", handleFormSubmit);
    document.getElementById("cancel-edit")?.addEventListener("click", resetForm);
    document.getElementById("article-lang")?.addEventListener("change", handleArticleLangChange);
    document.getElementById("image-upload")?.addEventListener("change", handleImageUpload);
    document.getElementById("article-image")?.addEventListener("input", (event) => {
        updateImagePreview(event.target.value.trim());
    });

    syncAdminFormTitle();
    articleEditDraft = createEmptyArticleDraft();
    loadArticleDraftToForm("sk");

    try {
        const authenticated = await checkAdminAuth();
        if (authenticated) {
            await showAdminDashboard();
        } else {
            showLoginScreen();
        }
    } catch {
        showLoginScreen();
        showAdminMessage(
            getAdminEnvironment() === "static"
                ? "Na live webe (Vercel) admin nefunguje — nasaďte backend na Render alebo spustite SPUSTIT-ADMIN.bat."
                : "Nepodarilo sa spojiť so serverom. Skontrolujte, či beží backend.",
            true
        );
    }
}

function refreshAdminPage() {
    if (isAuthenticated) {
        renderAdminList();
        syncAdminFormTitle();
    }
}

document.addEventListener("DOMContentLoaded", initAdminPage);
document.addEventListener("rps-language-change", refreshAdminPage);
