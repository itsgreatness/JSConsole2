"use strict"
const focusable = 'input, select, textarea, button, a, area, [tabindex]:not([tabindex="-1"])';
let focusableElementsBuffer = [];

const updateFocusableElementsBuffer = () => {
    focusableElementsBuffer = Array.from(document.querySelectorAll(focusable)).filter(isElementFocusable);

    // Sort elements based on tabIndex
    focusableElementsBuffer.sort((a, b) => {
        const tabIndexA = a.hasAttribute("tabindex") ? parseInt(a.getAttribute("tabindex")) : 0;
        const tabIndexB = b.hasAttribute("tabindex") ? parseInt(b.getAttribute("tabindex")) : 0;
        return tabIndexA - tabIndexB;
    });
}

addEventListener("DOMContentLoaded", updateFocusableElementsBuffer);

addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();

        const currentIndex = focusableElementsBuffer.indexOf(document.activeElement);
        let nextIndex;

        if (event.key === "ArrowUp") {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElementsBuffer.length - 1;
        } else {
            nextIndex = currentIndex < focusableElementsBuffer.length - 1 ? currentIndex + 1 : 0;
        }

        const nextElement = focusableElementsBuffer[nextIndex];
        if (nextElement) {
            nextElement.focus();
        }
    }
});

const isElementFocusable = (element) => {
    const isDisabled = element.disabled || (element.tagName === "A" && !element.hasAttribute("href"));
    const isVisible = isElementVisible(element);

    return !isDisabled && isVisible;
}

const isElementVisible = (element) => {
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue("display") !== "none" && computedStyle.getPropertyValue("visibility") === "visible";
}

// Example: Update buffer when DOM is modified (you might need to adapt this based on your application's logic)
const observer = new MutationObserver(updateFocusableElementsBuffer);
observer.observe(document.body, { subtree: true, childList: true, attributes: true });
