/**
 * Calculates and updates the popup height based on content
 */
export const updatePopupHeight = (): void => {
  setTimeout(() => {
    // Use body scrollHeight to get the actual needed height
    const bodyHeight = document.body.scrollHeight;

    // Set reasonable min and max heights
    const minHeight = 150;
    const maxHeight = 500;

    const totalHeight = Math.max(minHeight, Math.min(bodyHeight, maxHeight));

    window.parent.postMessage(
      {
        type: "UPDATE_POPUP_HEIGHT",
        height: totalHeight,
      },
      "*",
    );
  }, 100);
};
