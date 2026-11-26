
/* =====================================================
   SNCCD Website
   Shared Header, Navigation and Footer
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderNavigation();
    renderFooter();
});

/* Website Navigation */

const navigation = [
    { name: "Home", url: "index.html" },
    { name: "About", url: "about.html" },
    { name: "Conservation", url: "conservation.html" },
    { name: "Grants & Funding", url: "grants.html" },
    { name: "Education", url: "education.html" },
    { name: "News", url: "news.html" },
    { name: "Opportunities", url: "opportunities.html" },
    { name: "Public Meetings", url: "meetings.html" },
    { name: "Partners", url: "partners.html" },
    { name: "Contact", url: "contact.html" }
];

/* Shared Header */

function renderHeader() {
    const header = document.getElementById("site-header");

    if (!header) return;

    header.innerHTML = `
        <div class="draft-banner">
            <strong>DRAFT WEBSITE - FOR BOARD REVIEW</strong>
            <span>
                Under development. Not yet approved
                for official publication.
            </span>
        </div>

        <header class="site-header">
            <div class="container">
                <h1>Southern Nye County Conservation District</h1>
                <p>Conservation, Education and Stewardship</p>
            </div>
        </header>
    `;
}

/* Shared Navigation */

function renderNavigation() {
    const nav = document.getElementById("site-navigation");

    if (!nav) return;

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    const links = navigation.map(item => {
        const isActive = currentPage === item.url;

        return `
            <a href="${item.url}"
               class="${isActive ? "active" : ""}"
               ${isActive ? 'aria-current="page"' : ""}>
                ${item.name}
            </a>
        `;
    }).join("");

    nav.innerHTML = `
        <nav class="main-nav" aria-label="Main navigation">
            <div class="container">
                ${links}
            </div>
        </nav>
    `;
}

/* Shared Footer */

function renderFooter() {
    const footer = document.getElementById("site-footer");

    if (!footer) return;

    const year = new Date().getFullYear();

    footer.innerHTML = `
        <footer class="site-footer">
            <div class="container">

                <p>
                    <strong>
                        Southern Nye County Conservation District
                    </strong>
                </p>

                <p>
                    <a href="contact.html">Contact</a> |
                    <a href="partners.html">Partners</a> |
                    <a href="meetings.html">Public Meetings</a>
                </p>

                <p>
                    &copy; ${year} Southern Nye County Conservation District
                </p>

            </div>
        </footer>
    `;
}
