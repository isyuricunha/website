// projects page language filters
(function () {
    "use strict";

    function initFilters() {
        const projectsGrid = document.querySelector(".projects-grid");
        const projectCards = document.querySelectorAll(".project-card");

        if (!projectsGrid || projectCards.length === 0) return;

        // extract unique languages from repos
        const languages = new Set();
        projectCards.forEach((card) => {
            const lang = card.getAttribute("data-language");
            if (lang && lang !== "unknown" && lang !== "Unknown") {
                languages.add(lang);
            }
        });

        // create filter container
        const filterContainer = document.createElement("div");
        filterContainer.className = "projects-filters";

        // add "all" filter
        const allBtn = createFilterButton(
            "all",
            "All",
            projectCards.length,
            true
        );
        filterContainer.appendChild(allBtn);

        // add language filters (sorted alphabetically)
        Array.from(languages)
            .sort()
            .forEach((lang) => {
                const count = Array.from(projectCards).filter(
                    (card) => card.getAttribute("data-language") === lang
                ).length;
                const btn = createFilterButton(lang, lang, count, false);
                filterContainer.appendChild(btn);
            });

        // insert filters before grid
        projectsGrid.parentNode.insertBefore(filterContainer, projectsGrid);

        // add filter event listeners
        filterContainer.querySelectorAll(".filter-btn").forEach((btn) => {
            btn.addEventListener("click", () =>
                handleFilterClick(btn, projectCards)
            );
        });
    }

    function createFilterButton(language, label, count, active) {
        const btn = document.createElement("button");
        btn.className = `filter-btn${active ? " active" : ""}`;
        btn.setAttribute("data-language", language);

        // create label text node (safe from xss)
        btn.appendChild(document.createTextNode(label + " "));

        // create count span
        const countSpan = document.createElement("span");
        countSpan.className = "filter-count";
        countSpan.textContent = count;
        btn.appendChild(countSpan);

        return btn;
    }

    function handleFilterClick(clickedBtn, cards) {
        const language = clickedBtn.getAttribute("data-language");

        // update active state
        document.querySelectorAll(".filter-btn").forEach((btn) => {
            btn.classList.remove("active");
        });
        clickedBtn.classList.add("active");

        // filter cards with smooth animation
        cards.forEach((card) => {
            const cardLang = card.getAttribute("data-language");
            const shouldShow = language === "all" || cardLang === language;

            if (shouldShow) {
                card.style.display = "";
                // trigger reflow for animation
                card.offsetHeight;
                card.classList.remove("filtered-out");
                card.classList.add("filtered-in");
            } else {
                card.classList.remove("filtered-in");
                card.classList.add("filtered-out");
                setTimeout(() => {
                    if (card.classList.contains("filtered-out")) {
                        card.style.display = "none";
                    }
                }, 200);
            }
        });

        // update counts
        updateFilterCounts(cards);
    }

    function updateFilterCounts(cards) {
        document.querySelectorAll(".filter-btn").forEach((btn) => {
            const language = btn.getAttribute("data-language");
            const countSpan = btn.querySelector(".filter-count");

            if (language === "all") {
                countSpan.textContent = cards.length;
            } else {
                const count = Array.from(cards).filter(
                    (card) => card.getAttribute("data-language") === language
                ).length;
                countSpan.textContent = count;
            }
        });
    }

    // initialize on dom ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFilters);
    } else {
        initFilters();
    }
})();
