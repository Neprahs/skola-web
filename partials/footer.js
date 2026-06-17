(function () {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    footer.innerHTML = `
<footer class="site-footer" data-i18n-aria="a11y.footer">
    <div class="footer-inner">
        <div class="footer-grid">
            <div class="footer-brand">
                <a href="index.html" class="footer-logo">
                    <img src="images/rudnik-erb.png" alt="" class="footer-logo-emblem" width="44" height="44">
                    <span class="footer-logo-text" data-i18n="school.name">Základná škola Rudník</span>
                </a>
                <p class="footer-tagline" data-i18n="footer.tagline">
                    Inspirujeme mysle, formujeme budúcnosť. Komunita zameraná na vzdelanie, kreativitu a charakter.
                </p>
                <div class="footer-actions" data-i18n-aria="a11y.externalLinks">
                    <a href="https://www.facebook.com/zakladnaskola.rudnik" target="_blank" rel="noopener noreferrer" class="footer-action-btn footer-facebook-btn" aria-label="Facebook">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href="https://rudnik.edupage.org/" target="_blank" rel="noopener noreferrer" class="footer-action-btn footer-edupage-btn" data-i18n-aria="a11y.edupageLogin">
                        <img src="images/edupage-logo.png" alt="" class="footer-edupage-logo" width="54" height="54">
                    </a>
                    <a href="https://www.rudnik.sk/" target="_blank" rel="noopener noreferrer" class="footer-action-btn footer-village-btn" data-i18n-aria="a11y.villageWebsite">
                        <img src="images/rudnik-erb.png" alt="" class="footer-village-logo" width="54" height="54">
                    </a>
                </div>
            </div>

            <div class="footer-col">
                <h3 data-i18n="side.aboutSchool">O škole</h3>
                <ul class="footer-links">
                    <li><a href="about.html" data-i18n="side.schoolProfile">Profil školy</a></li>
                    <li><a href="partners.html" data-i18n="side.partners">Partneri</a></li>
                    <li><a href="projects.html" data-i18n="side.projects">Projekty</a></li>
                    <li><a href="school-board.html" data-i18n="side.schoolBoard">Rada školy</a></li>
                    <li><a href="school-rules.html" data-i18n="side.schoolRules">Školský poriadok</a></li>
                    <li><a href="forms.html" data-i18n="side.forms">Tlačivá</a></li>
                    <li><a href="contracts.html" data-i18n="side.contracts">Zmluvy a faktúry</a></li>
                    <li><a href="admissions.html" data-i18n="side.admissions">Prijímačky</a></li>
                    <li><a href="admissions.html#why-us" data-i18n="side.whyStudy">Prečo študovať u nás?</a></li>
                    <li><a href="admissions.html#criteria" data-i18n="side.criteria">Kritériá</a></li>
                    <li>
                        <a href="https://rudnik.edupage.org/prijimacky/" target="_blank" rel="noopener noreferrer" data-i18n="side.onlineApplication">Elektronická prihláška</a>
                    </li>
                </ul>
            </div>

            <div class="footer-col">
                <h3 data-i18n="side.studentsParents">Žiaci a rodičia</h3>
                <ul class="footer-links">
                    <li>
                        <a href="https://rudnik.edupage.org/" target="_blank" rel="noopener noreferrer" data-i18n="side.edupagePortal">EduPage portál</a>
                    </li>
                    <li><a href="news.html" data-i18n="nav.news">Novinky</a></li>
                    <li><a href="library.html" data-i18n="side.library">Knižnica</a></li>
                    <li><a href="clubs.html" data-i18n="side.clubs">Krúžky</a></li>
                    <li><a href="teachers.html" data-i18n="side.teachers">Učitelia</a></li>
                    <li><a href="guidance.html" data-i18n="side.guidance">Výchovný poradca</a></li>
                    <li><a href="psychologist.html" data-i18n="side.psychologist">Školský psychológ</a></li>
                    <li><a href="contact.html" data-i18n="nav.contact">Kontakt</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h3 data-i18n="footer.contact">Kontakt</h3>
                <div class="footer-contact-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                    <span>Rudník 2<br>906 23 Rudník, Slovakia</span>
                </div>
                <div class="footer-contact-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    <a href="tel:+421346215624">+421 0346215624</a>
                </div>
                <div class="footer-contact-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    <a href="mailto:zs2rudnik.edu.sk@zoznam.sk">zs2rudnik.edu.sk@zoznam.sk</a>
                </div>
            </div>
        </div>

        <div class="footer-newsletter">
            <div class="footer-newsletter-text">
                <h4 data-i18n="footer.stayInLoop">Zostaňte v obraze</h4>
                <p data-i18n="footer.stayInLoopText">Dostávajte školské novinky a oznámenia do e-mailu.</p>
            </div>
            <form class="footer-newsletter-form" action="#" method="post">
                <input type="email" name="email" data-i18n-placeholder="footer.emailPlaceholder" placeholder="Váš e-mail" required data-i18n-aria="footer.emailPlaceholder">
                <button type="submit" data-i18n="footer.subscribe">Odoberať</button>
            </form>
        </div>
    </div>

    <div class="footer-bottom">
        <div class="footer-bottom-inner">
            <p data-i18n="footer.copyright">© 2026 Základná škola Rudník. Všetky práva vyhradené.</p>
            <ul class="footer-bottom-links">
                <li><a href="index.html" data-i18n="nav.home">Domov</a></li>
                <li><a href="privacy.html" data-i18n="side.privacy">Ochrana súkromia</a></li>
                <li><a href="/admin" class="footer-admin-link" data-i18n="footer.siteAdmin">Správa webu</a></li>
            </ul>
        </div>
    </div>
</footer>`;

    document.dispatchEvent(new CustomEvent("rps-i18n-update"));
})();
