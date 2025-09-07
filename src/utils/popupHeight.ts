/**
 * Calculates and updates the popup height based on content
 */
export const updatePopupHeight = (): void => {
  setTimeout(() => {
    // Get the actual content height
    const contentWrapper = document.querySelector(
      ".dictionary-content-wrapper"
    );
    const closeButton = document.querySelector(".flex.justify-end.p-4.pb-0");

    if (contentWrapper && closeButton) {
      const contentHeight = contentWrapper.scrollHeight;
      const closeButtonHeight = closeButton.getBoundingClientRect().height;
      const padding = 32; // Account for padding and margins

      // Calculate total needed height
      let totalHeight = contentHeight + closeButtonHeight + padding;

      // Set reasonable min and max heights
      const minHeight = 150;
      const maxHeight = 500;

      totalHeight = Math.max(minHeight, Math.min(totalHeight, maxHeight));

      window.parent.postMessage(
        {
          type: "UPDATE_POPUP_HEIGHT",
          height: totalHeight,
        },
        "*"
      );
    } else {
      // Fallback to minimum height if elements not found
      window.parent.postMessage(
        {
          type: "UPDATE_POPUP_HEIGHT",
          height: 150,
        },
        "*"
      );
    }
  }, 100);
};
