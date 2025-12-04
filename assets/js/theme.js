(() => {
    "use strict";
    const LS_THEME_KEY = "theme";
    const THEMES = {
        LIGHT: "light",
        DARK: "dark",
        AUTO: "auto",
    };

    const body = document.body;
    const config = body.getAttribute("data-theme");

    const getThemeState = () => {
        const lsState = localStorage.getItem(LS_THEME_KEY);
        if (lsState) return lsState;

        let state;
        switch (config) {
            case THEMES.DARK:
                state = THEMES.DARK;
                break;
            case THEMES.LIGHT:
                state = THEMES.LIGHT;
                break;
            case THEMES.AUTO:
            default:
                state = window.matchMedia("(prefers-color-scheme: dark)")
                    .matches
                    ? THEMES.DARK
                    : THEMES.LIGHT;
                break;
        }
        return state;
    };

    const initTheme = (state) => {
        if (state === THEMES.DARK) {
            document.documentElement.classList.add(THEMES.DARK);
            document.documentElement.classList.remove(THEMES.LIGHT);
        } else if (state === THEMES.LIGHT) {
            document.documentElement.classList.remove(THEMES.DARK);
            document.documentElement.classList.add(THEMES.LIGHT);
        }
    };

    // init theme asap, then enable transitions
    initTheme(getThemeState());
    requestAnimationFrame(() => body.classList.remove("notransition"));

    const toggleTheme = () => {
        const state = getThemeState();
        const lamp = document.getElementById("mode");

        // add transition class for smooth animation
        document.documentElement.classList.add('theme-transitioning');

        // animate the toggle button
        if (lamp) {
            lamp.classList.add('theme-toggle-spin');
            setTimeout(() => lamp.classList.remove('theme-toggle-spin'), 500);
        }

        if (state === THEMES.DARK) {
            localStorage.setItem(LS_THEME_KEY, THEMES.LIGHT);
            initTheme(THEMES.LIGHT);
        } else if (state === THEMES.LIGHT) {
            localStorage.setItem(LS_THEME_KEY, THEMES.DARK);
            initTheme(THEMES.DARK);
        }

        // remove transition class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);
    };

    window.addEventListener("DOMContentLoaded", () => {
        // theme switch
        const lamp = document.getElementById("mode");

        lamp.addEventListener("click", () => toggleTheme());

        // blur the content when the menu is open
        const cbox = document.getElementById("menu-trigger");

        cbox.addEventListener("change", function () {
            const area = document.querySelector(".wrapper");
            if (this.checked) return area.classList.add("blurry");
            area.classList.remove("blurry");
        });
    });
})();
