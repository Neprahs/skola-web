(function () {
    function applyMetaDescription() {
        const key = document.documentElement.dataset.docDescription;
        if (!key || !window.RPS_I18N) return;

        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.content = window.RPS_I18N.t(key);
        }
    }

    document.addEventListener("DOMContentLoaded", applyMetaDescription);
    document.addEventListener("rps-language-change", applyMetaDescription);
})();
