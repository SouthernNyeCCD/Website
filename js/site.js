
/* =====================================================
   SNCCD Website
   Shared Header, Navigation and Footer
   ===================================================== */



document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderNavigation();
    renderFooter();
    loadNews();
    loadGrants();
    loadMeetings();
    loadOpportunities();
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


/* =====================================================
   Shared JSON Data Loader
   ===================================================== */

async function loadData(fileName) {

    const response = await fetch(`data/${fileName}.json`);

    if (!response.ok) {
        throw new Error(`Unable to load ${fileName} data.`);
    }

    const data = await response.json();

    return data.filter(item => item.published === true);
}


/* =====================================================
   Grants and Funding
   ===================================================== */

async function loadGrants() {

    const homeGrants = document.getElementById("home-grants");
    const grantsList = document.getElementById("grants-list");

    if (!homeGrants && !grantsList) return;

    try {

        const grants = await loadData("grants");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentGrants = grants
            .filter(item =>
                !item.deadline ||
                new Date(item.deadline + "T00:00:00") >= today
            )
            .sort((a, b) =>
                (a.deadline || "9999-12-31")
                .localeCompare(b.deadline || "9999-12-31")
            );

        const expiredGrants = grants
            .filter(item =>
                item.deadline &&
                new Date(item.deadline + "T00:00:00") < today
            )
            .sort((a, b) =>
                b.deadline.localeCompare(a.deadline)
            );

        if (homeGrants) {
            renderGrants(homeGrants, currentGrants.slice(0, 3));
        }

        if (grantsList) {

            renderGrants(grantsList, currentGrants);

            if (expiredGrants.length > 0) {

                const heading = document.createElement("h2");
                heading.textContent = "Past Funding Opportunities";

                const archive = document.createElement("div");

                grantsList.append(heading, archive);

                renderGrants(archive, expiredGrants, true);
            }
        }

    } catch (error) {

        console.error("Error loading grants:", error);

        [homeGrants, grantsList]
            .filter(Boolean)
            .forEach(container => {
                container.textContent =
                    "Funding information is temporarily unavailable.";
            });
    }
}


/* Render Grant Listings */

function renderGrants(container, items, expired = false) {

    container.replaceChildren();

    if (items.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-state";
        empty.textContent =
            "No current funding opportunities at this time.";

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
            `${item.organization} | ${item.category}`;

        const summary = document.createElement("p");
        summary.textContent = item.summary;

        const eligibility = document.createElement("p");
        eligibility.textContent =
            `Eligibility: ${item.eligibility || "See program details"}`;

        const deadline = document.createElement("p");
        deadline.className = "grant-deadline";

        deadline.textContent = expired
            ? `Closed: ${formatDate(item.deadline)}`
            : item.deadline
                ? `Application Deadline: ${formatDate(item.deadline)}`
                : "Application Deadline: Ongoing";

        const status = document.createElement("span");

        status.className = expired
            ? "status-closed"
            : "status-open";

        status.textContent = expired
            ? "Closed"
            : "Open";

        article.append(
            title,
            metadata,
            status,
            summary,
            eligibility,
            deadline
        );

        if (item.url) {

            const url = new URL(item.url, document.baseURI);

            if (["http:", "https:"].includes(url.protocol)) {

                const link = document.createElement("a");

                link.href = url.href;
                link.textContent =
                    item.linkText || "Program Information";

                link.className = "button";

                article.appendChild(link);
            }
        }

        container.appendChild(article);
    });
}


/* =====================================================
   Public Meetings and Historical Archive
   ===================================================== */

async function loadMeetings() {

    const homeMeetings =
        document.getElementById("home-meetings");

    const meetingsList =
        document.getElementById("meetings-list");

    if (!homeMeetings && !meetingsList) return;

    try {

        const meetings = await loadData("meetings");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Identify upcoming meetings

        const upcoming = meetings
            .filter(item =>
                new Date(item.date + "T00:00:00") >= today
            )
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            );

        // Identify historical meetings

        const past = meetings
            .filter(item =>
                new Date(item.date + "T00:00:00") < today
            )
            .sort((a, b) =>
                b.date.localeCompare(a.date)
            );

        // Homepage: next three meetings

        if (homeMeetings) {
            renderMeetings(
                homeMeetings,
                upcoming.slice(0, 3)
            );
        }

        // Public Meetings page

        if (meetingsList) {

            meetingsList.replaceChildren();

            const upcomingHeading =
                document.createElement("h2");

            upcomingHeading.textContent =
                "Upcoming Public Meetings";

            const upcomingContainer =
                document.createElement("div");

            meetingsList.append(
                upcomingHeading,
                upcomingContainer
            );

            renderMeetings(
                upcomingContainer,
                upcoming
            );

            // Historical archive

            const archiveHeading =
                document.createElement("h2");

            archiveHeading.textContent =
                "Historical Meeting Archive";

            meetingsList.appendChild(archiveHeading);

            if (past.length === 0) {

                const empty =
                    document.createElement("div");

                empty.className = "empty-state";

                empty.textContent =
                    "No historical meetings available.";

                meetingsList.appendChild(empty);
            }

            // Group historical meetings by year

            const years = [
                ...new Set(
                    past.map(item =>
                        item.date.substring(0, 4)
                    )
                )
            ].sort((a, b) => b.localeCompare(a));

            years.forEach(year => {

                const yearHeading =
                    document.createElement("h3");

                yearHeading.className =
                    "archive-year";

                yearHeading.textContent = year;

                const yearContainer =
                    document.createElement("div");

                const yearMeetings = past.filter(
                    item => item.date.startsWith(year)
                );

                meetingsList.append(
                    yearHeading,
                    yearContainer
                );

                renderMeetings(
                    yearContainer,
                    yearMeetings,
                    true
                );
            });
        }

    } catch (error) {

        console.error("Error loading meetings:", error);

        [homeMeetings, meetingsList]
            .filter(Boolean)
            .forEach(container => {
                container.textContent =
                    "Meeting information is temporarily unavailable.";
            });
    }
}


/* =====================================================
   Render Meeting Listings
   ===================================================== */

function renderMeetings(container, items, historical = false) {

    container.replaceChildren();

    if (items.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-state";

        empty.textContent =
            "No upcoming meetings currently posted.";

        container.appendChild(empty);

        return;
    }

    items.forEach(item => {

        const article = document.createElement("article");
        article.className = "listing";

        // Meeting title

        const title = document.createElement("h3");
        title.textContent = item.title;

        // Meeting type

        const metadata = document.createElement("div");
        metadata.className = "listing-date";
        metadata.textContent = item.type;

        // Meeting status

        const status = document.createElement("span");

        status.className = historical
            ? "status-closed"
            : "status-open";

        status.textContent = historical
            ? "Past Meeting"
            : "Upcoming";

        // Meeting date

        const date = document.createElement("p");
        date.className = "meeting-date";

        date.textContent =
            `Date: ${formatDate(item.date)}`;

        article.append(
            title,
            metadata,
            status,
            date
        );

        // Meeting time

        if (item.time) {

            const time = document.createElement("p");
            time.textContent = `Time: ${item.time}`;

            article.appendChild(time);
        }

        // Meeting location

        if (item.location) {

            const location = document.createElement("p");
            location.textContent =
                `Location: ${item.location}`;

            article.appendChild(location);
        }

        // Meeting description

        if (item.description) {

            const description =
                document.createElement("p");

            description.textContent =
                item.description;

            article.appendChild(description);
        }

        // Virtual meeting link

        if (!historical && item.virtualUrl) {

            const url = new URL(
                item.virtualUrl,
                document.baseURI
            );

            if (["http:", "https:"].includes(url.protocol)) {

                const link =
                    document.createElement("a");

                link.href = url.href;
                link.textContent = "Join Virtual Meeting";
                link.className = "button";
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                article.appendChild(link);
            }
        }

        // Associated meeting documents

        if (Array.isArray(item.documents) &&
            item.documents.length > 0) {

            const heading =
                document.createElement("h4");

            heading.textContent = "Meeting Documents";

            const list =
                document.createElement("ul");

            list.className = "document-list";

            item.documents.forEach(doc => {

                if (!doc.url) return;

                const url = new URL(
                    doc.url,
                    document.baseURI
                );

                if (!["http:", "https:"]
                    .includes(url.protocol)) return;

                const listItem =
                    document.createElement("li");

                const link =
                    document.createElement("a");

                link.href = url.href;
                link.textContent = doc.title;
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                listItem.appendChild(link);
                list.appendChild(listItem);
            });

            article.append(heading, list);
        }

        container.appendChild(article);
    });
}


/* ========================================
   OPPORTUNITIES
======================================== */

async function loadOpportunities() {
    const container = document.getElementById("opportunities-list");

    if (!container) return;

    try {
        const opportunities = await loadData("opportunities");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const active = opportunities
            .filter(item =>
                !item.deadline ||
                new Date(item.deadline + "T00:00:00") >= today
            )
            .sort((a, b) =>
                (b.date || "").localeCompare(a.date || "")
            );

        const expired = opportunities
            .filter(item =>
                item.deadline &&
                new Date(item.deadline + "T00:00:00") < today
            )
            .sort((a, b) =>
                b.deadline.localeCompare(a.deadline)
            );

        container.replaceChildren();

        const activeHeading = document.createElement("h2");
        activeHeading.textContent = "Current Opportunities";
        container.appendChild(activeHeading);

        if (active.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent =
                "There are no current opportunities at this time.";
            container.appendChild(empty);
        } else {
            renderOpportunities(container, active);
        }

        if (expired.length > 0) {
            const heading = document.createElement("h2");
            heading.className = "archive-year";
            heading.textContent = "Past Opportunities";
            container.appendChild(heading);

            renderOpportunities(container, expired, true);
        }

    } catch (error) {
        console.error("Unable to load opportunities:", error);
        container.textContent =
            "Opportunity information is temporarily unavailable.";
    }
}


function renderOpportunities(container, items, expired = false) {

    items.forEach(item => {

        const article = document.createElement("article");
        article.className = "listing";

        // Title
        const title = document.createElement("h3");
        title.textContent = item.title;
        article.appendChild(title);

        // Organization and category
        const metadata = document.createElement("div");
        metadata.className = "listing-date";
        metadata.textContent = [
            item.organization,
            item.category
        ].filter(Boolean).join(" | ");

        article.appendChild(metadata);

        // Status
        const status = document.createElement("span");
        status.className = expired
            ? "status-closed"
            : "status-open";

        status.textContent = expired
            ? "Closed"
            : item.deadline
                ? "Open"
                : "Open until filled";

        article.appendChild(status);

        // Summary
        if (item.summary) {
            const summary = document.createElement("p");
            summary.textContent = item.summary;
            article.appendChild(summary);
        }

        // Opportunity details
        const details = document.createElement("div");
        details.className = "opportunity-details";

        const fields = [
            ["Employment Type", item.employmentType],
            ["Hours", item.hours],
            ["Compensation", item.compensation],
            ["Location", item.location],
            ["Closing Date",
                item.deadline
                    ? formatDate(item.deadline)
                    : "Until filled"]
        ];

        fields.forEach(([label, value]) => {
            if (!value) return;

            const line = document.createElement("div");
            const strong = document.createElement("strong");

            strong.textContent = label + ": ";
            line.appendChild(strong);
            line.appendChild(document.createTextNode(value));

            details.appendChild(line);
        });

        article.appendChild(details);

        // Contact information
        if (!expired && (item.contact || item.phone || item.email)) {

            const contact = document.createElement("div");
            contact.className = "opportunity-contact";

            const heading = document.createElement("h4");
            heading.textContent = "Contact and Application Information";
            contact.appendChild(heading);

            if (item.contact) {
                const name = document.createElement("div");
                name.textContent = item.contact;
                contact.appendChild(name);
            }

            if (item.phone) {
                const phoneLine = document.createElement("div");
                const phone = document.createElement("a");

                phone.href = "tel:" +
                    item.phone.replace(/[^\d+]/g, "");

                phone.textContent = item.phone;
                phoneLine.appendChild(phone);
                contact.appendChild(phoneLine);
            }

            if (item.email) {
                const emailLine = document.createElement("div");
                const email = document.createElement("a");

                email.href = "mailto:" + item.email +
                    (item.emailSubject
                        ? "?subject=" +
                          encodeURIComponent(item.emailSubject)
                        : "");

                email.textContent = item.email;
                emailLine.appendChild(email);
                contact.appendChild(emailLine);
            }

            article.appendChild(contact);
        }

        // Supporting documents
        if (Array.isArray(item.documents) && item.documents.length) {

            const list = document.createElement("ul");
            list.className = "document-list";

            item.documents.forEach(doc => {

                if (!doc.url) return;

                const url = new URL(doc.url, document.baseURI);

                if (!["http:", "https:"].includes(url.protocol)) return;

                const li = document.createElement("li");
                const link = document.createElement("a");

                link.href = url.href;
                link.textContent = doc.title || "View Document";
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                li.appendChild(link);
                list.appendChild(li);
            });

            article.appendChild(list);
        }

        // External application link
        if (!expired && item.url) {

            const url = new URL(item.url, document.baseURI);

            if (["http:", "https:"].includes(url.protocol)) {

                const link = document.createElement("a");

                link.href = url.href;
                link.className = "button";
                link.textContent =
                    item.linkText || "More Information";

                link.target = "_blank";
                link.rel = "noopener noreferrer";

                article.appendChild(link);
            }
        }

        container.appendChild(article);
    });
}
