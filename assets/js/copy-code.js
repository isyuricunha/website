// add copy button to all code blocks
(function () {
    "use strict";

    if (!navigator.clipboard) {
        console.warn("Clipboard API not available");
        return;
    }

    function createCopyButton() {
        const button = document.createElement("button");
        button.className = "copy-code-button";
        button.type = "button";
        button.setAttribute("aria-label", "Copy code to clipboard");
        button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span class="copy-code-text">Copy</span>
    `;
        return button;
    }

    function showFeedback(button, success = true) {
        const originalHTML = button.innerHTML;
        const feedbackText = success ? "Copied!" : "Failed";
        const feedbackClass = success ? "copy-code-success" : "copy-code-error";

        button.classList.add(feedbackClass);
        button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span class="copy-code-text">${feedbackText}</span>
    `;

        setTimeout(() => {
            button.classList.remove(feedbackClass);
            button.innerHTML = originalHTML;
        }, 2000);
    }

    function addCopyButtons() {
        const codeBlocks = document.querySelectorAll("pre > code");

        codeBlocks.forEach((codeBlock) => {
            const pre = codeBlock.parentElement;

            // skip if button already exists
            if (pre.querySelector(".copy-code-button")) {
                return;
            }

            // create wrapper for positioning
            if (!pre.classList.contains("code-block-wrapper")) {
                pre.style.position = "relative";
            }

            const button = createCopyButton();

            button.addEventListener("click", async () => {
                try {
                    const code = codeBlock.textContent;
                    await navigator.clipboard.writeText(code);
                    showFeedback(button, true);
                } catch (err) {
                    console.error("Failed to copy code:", err);
                    showFeedback(button, false);
                }
            });

            pre.appendChild(button);
        });
    }

    // initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addCopyButtons);
    } else {
        addCopyButtons();
    }
})();
