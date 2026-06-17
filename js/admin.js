function t(key, fallback) {
    return window.RPS_I18N?.t(key) || fallback;
}

let adminArticles = [];
let isAuthenticated = false;
let editingArticleId = "";

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
    const displayArticle = localizeArticle(article);

    document.getElementById("article-id").value = article.id;
    document.getElementById("article-title").value = displayArticle.title;
    document.getElementById("article-excerpt").value = displayArticle.excerpt;
    document.getElementById("article-image").value = article.image;
    document.getElementById("article-date").value = article.date;
    document.getElementById("article-featured").checked = article.featured;
    document.getElementById("article-content").value = displayArticle.content.join("\n\n");
    if (typeof window.loadArticleSectionsIntoEditor === "function") {
        window.loadArticleSectionsIntoEditor(article);
    }
    document.getElementById("cancel-edit").hidden = false;
    syncAdminFormTitle();
    updateImagePreview(article.image);
    window.scrollTo({ top: document.getElementById("admin-article-form").offsetTop - 20, behavior: "smooth" });
}

function resetForm() {
    document.getElementById("admin-article-form").reset();
    document.getElementById("article-id").value = "";
    editingArticleId = "";
    document.getElementById("cancel-edit").hidden = true;
    syncAdminFormTitle();
    updateImagePreview("");
    if (typeof window.resetArticleSectionsEditor === "function") {
        window.resetArticleSectionsEditor();
    }
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

    const idField = document.getElementById("article-id");
    const title = document.getElementById("article-title").value.trim();
    const excerpt = document.getElementById("article-excerpt").value.trim();
    const image = document.getElementById("article-image").value.trim();
    const date = document.getElementById("article-date").value;
    const featured = document.getElementById("article-featured").checked;
    const heroStyle = document.getElementById("article-hero-style")?.value || "large";
    const sections = typeof window.collectArticleSectionsFromEditor === "function"
        ? window.collectArticleSectionsFromEditor()
        : [];
    const layoutUi = window.RPS_CONTENT_LAYOUT;
    const content = layoutUi?.sectionsToContent(sections) || [];

    if (!title || !excerpt || !image || !date || !sections.length || !content.length) {
        showAdminMessage(
            sections.length && !content.length
                ? "Vyplňte text alebo pridajte fotku v častiach článku."
                : t("page.admin.msg.fillRequired", "Please fill in all required fields."),
            true
        );
        return;
    }

    const payload = { title, excerpt, image, date, featured, content, sections, heroStyle };

    try {
        if (idField.value) {
            const updated = await updateArticle(idField.value, payload);
            adminArticles = adminArticles.map((item) => (item.id === updated.id ? updated : item));
            showAdminMessage(t("page.admin.msg.updated", "Article updated."));
        } else {
            const created = await createArticle(payload);
            adminArticles.push(created);
            showAdminMessage(t("page.admin.msg.added", "Article added."));
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

async function initAdminPage() {
    document.getElementById("login-form")?.addEventListener("submit", handleLogin);
    document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
    document.getElementById("admin-article-form")?.addEventListener("submit", handleFormSubmit);
    document.getElementById("cancel-edit")?.addEventListener("click", resetForm);
    document.getElementById("image-upload")?.addEventListener("change", handleImageUpload);
    document.getElementById("article-image")?.addEventListener("input", (event) => {
        updateImagePreview(event.target.value.trim());
    });

    syncAdminFormTitle();

    if (typeof window.resetArticleSectionsEditor === "function") {
        window.resetArticleSectionsEditor();
    }

    try {
        const authenticated = await checkAdminAuth();
        if (authenticated) {
            await showAdminDashboard();
        } else {
            showLoginScreen();
        }
    } catch {
        showLoginScreen();
        showAdminMessage(t("page.admin.msg.startBackend", "Start the backend server to manage articles."), true);
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
