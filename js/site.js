
/* =====================================================
   SNCCD Website
   Shared Header, Navigation and Footer
   ===================================================== */


document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderNavigation();
    renderFooter();
    loadNews();
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


/* =====================================================
   News and Public Notices
   ===================================================== */

async function loadNews() {

    const homeNews = document.getElementById("home-news");
    const newsList = document.getElementById("news-list");

    // Only load news on pages that display it.

    if (!homeNews && !newsList) return;

    try {

        const response = await fetch("data/news.json");

        if (!response.ok) {
            throw new Error("Unable to load news data.");
        }

        const data = await response.json();

        const news = data
            .filter(item => item.published === true)
            .sort((a, b) => b.date.localeCompare(a.date));

        if (homeNews) {
            renderNews(homeNews, news.slice(0, 3));
        }

        if (newsList) {
            renderNews(newsList, news);
        }

    } catch (error) {

        console.error("Error loading news:", error);

        [homeNews, newsList].filter(Boolean).forEach(container => {
            container.textContent =
                "News is temporarily unavailable.";
        });
    }
}


/* Render News Listings */

function renderNews(container, items) {

    container.replaceChildren();

    if (items.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-state";
        empty.textContent = "No announcements at this time.";

        container.appendChild(empty);

        return;
    }

    items.forEach(item => {

        const article = document.createElement("article");
        article.className = "listing";

        const title = document.createElement("h3");
        title.textContent = item.title;

        const metadata = document.createElement("div");
        metadata.className = "listing-date";
        metadata.textContent =
            `${formatDate(item.date)} | ${item.category}`;

        const summary = document.createElement("p");
        summary.textContent = item.summary;

        article.append(title, metadata, summary);

        if (item.url) {

            const url = new URL(item.url, document.baseURI);

            if (["http:", "https:"].includes(url.protocol)) {

                const link = document.createElement("a");

                link.href = url.href;
                link.textContent = item.linkText || "Read More";
                link.className = "button";

                article.appendChild(link);
            }
        }

        container.appendChild(article);
    });
}


/* Shared Date Formatting */

function formatDate(dateString) {

    return new Date(dateString + "T00:00:00")
        .toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}
