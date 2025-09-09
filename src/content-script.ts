// We have to define translations in here like this instead of in i18n `locales`
// folder because content script has issues with ES module. Google sucks!
// Reference: https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension

const TRANSLATIONS = {
  en: "dictionary",
  vi: "tra từ điển",
  zh: "词典",
  ja: "辞書",
  ko: "사전",
  fr: "dictionnaire",
  es: "diccionario",
  de: "Wörterbuch",
} as const;

async function getDictionaryButtonText(): Promise<string> {
  try {
    const data = await new Promise<any>((resolve, reject) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.sync
      ) {
        chrome.storage.sync.get(["appLanguage"], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } else {
        resolve({ appLanguage: "en" });
      }
    });

    const currentLang = data.appLanguage || "en";
    const translation =
      TRANSLATIONS[currentLang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
    return translation;
  } catch (error) {
    return "dictionary"; // Fallback text
  }
}

async function getCurrentAppLanguage(): Promise<string> {
  try {
    const data = await new Promise<any>((resolve, reject) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.sync
      ) {
        chrome.storage.sync.get(["appLanguage"], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } else {
        resolve({ appLanguage: "en" });
      }
    });

    return data.appLanguage || "en";
  } catch (error) {
    return "en"; // Fallback language
  }
}

let dictionaryButton: HTMLElement | null = null;
let dictionaryPopup: HTMLIFrameElement | null = null;
let lastSelectedText: string = "";
let selectionChangeTimeout: number | null = null;
let buttonOriginalPosition: { x: number; y: number } | null = null;
let popupOriginalPosition: { x: number; y: number } | null = null;
let extensionEnabled: boolean = true; // Default to enabled

// Check if extension is enabled
async function isExtensionEnabled(): Promise<boolean> {
  try {
    const data = await new Promise<any>((resolve, reject) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.sync
      ) {
        chrome.storage.sync.get(["extensionEnabled"], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } else {
        resolve({ extensionEnabled: true });
      }
    });

    return data.extensionEnabled !== false; // Default to true if not set
  } catch (error) {
    return true; // Default to enabled on error
  }
}

// Listen for extension toggle messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXTENSION_TOGGLE") {
    extensionEnabled = message.enabled;

    // If extension is disabled, remove any existing button/popup
    if (!extensionEnabled) {
      removeDictionaryButton();
      removeDictionaryPopup();
    }

    sendResponse({ success: true });
  }
});

// Create and show the dictionary button
async function showDictionaryButton(
  x: number,
  y: number,
  selectedText: string,
) {
  // Don't recreate if the same text is selected and button exists
  if (dictionaryButton && lastSelectedText === selectedText) {
    return;
  }

  lastSelectedText = selectedText;

  // Remove existing button if any
  removeDictionaryButton();

  try {
    // Get translated button text
    const buttonText = await getDictionaryButtonText();

    dictionaryButton = document.createElement("div");
    dictionaryButton.id = "dictionary-button";
    dictionaryButton.textContent = buttonText;
    dictionaryButton.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      background: #4f46e5;
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: Roboto, sans-serif;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      user-select: none;
      border: none;
      pointer-events: auto;
      display: inline-block;
      width: auto;
      min-width: 50px;
      max-width: 80px;
      text-align: center;
      white-space: nowrap;
      line-height: 1.2;
    `;

    // Store original position for scroll tracking (document coordinates)
    buttonOriginalPosition = { x: x, y: y };

    // Add scroll listener for button
    const handleButtonScroll = () => {
      if (dictionaryButton && buttonOriginalPosition) {
        // Button uses position: absolute, so it needs document coordinates
        // The original position (x, y) was already in document coordinates
        dictionaryButton.style.left = `${buttonOriginalPosition.x}px`;
        dictionaryButton.style.top = `${buttonOriginalPosition.y}px`;
      }
    };

    window.addEventListener("scroll", handleButtonScroll);
    (dictionaryButton as any).scrollHandler = handleButtonScroll;

    dictionaryButton.addEventListener("click", async (e) => {
      // Prevent event bubbling
      e.stopPropagation();
      e.preventDefault();

      // Get the current selection position to show popup nearby
      const selection = window.getSelection();
      let selectionX = x;
      let selectionY = y;

      if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        selectionX = rect.right; // Position to the right of selection
        selectionY = rect.top + window.scrollY; // Account for scroll
      }

      // Use the proper iframe translation popup
      await showDictionaryPopup(selectedText, selectionX, selectionY);
      // showDictionaryPopupDirect(selectedText); // test version removed
      removeDictionaryButton();
    });

    // Add hover effects to make it more obvious it's clickable
    dictionaryButton.addEventListener("mouseenter", () => {
      dictionaryButton!.style.background = "#4338ca";
      dictionaryButton!.style.transform = "scale(1.05)";
    });

    dictionaryButton.addEventListener("mouseleave", () => {
      dictionaryButton!.style.background = "#4f46e5";
      dictionaryButton!.style.transform = "scale(1)";
    });

    document.body.appendChild(dictionaryButton);

    // Add a flag to prevent immediate removal by click-outside
    (dictionaryButton as any).justCreated = true;
    setTimeout(() => {
      if (dictionaryButton) {
        (dictionaryButton as any).justCreated = false;
      }
    }, 200);

    // Auto-hide after 5 seconds (increased from 3)
    setTimeout(() => {
      removeDictionaryButton();
    }, 5000);

    // Clear the creation flag
  } catch (error) {
    console.error("Error creating dictionary button:", error);
  }
}

// Remove the dictionary button
function removeDictionaryButton() {
  if (dictionaryButton) {
    // Clean up scroll event listener
    const scrollHandler = (dictionaryButton as any).scrollHandler;
    if (scrollHandler) {
      window.removeEventListener("scroll", scrollHandler);
    }

    dictionaryButton.remove();
    dictionaryButton = null;
    buttonOriginalPosition = null;
    lastSelectedText = "";
  }
}

// Show the dictionary popup (iframe version)
async function showDictionaryPopup(
  selectedText: string,
  x?: number,
  y?: number,
) {
  // Remove existing popup if any
  removeDictionaryPopup();

  // Pre-fetch the current app language
  const currentAppLanguage = await getCurrentAppLanguage();

  try {
    dictionaryPopup = document.createElement("iframe");
    dictionaryPopup.id = "dictionary-popup";

    const popupURL = chrome.runtime.getURL("dictionary-popup.html");

    dictionaryPopup.src = popupURL;

    // Calculate position near the selected text
    let popupX = x || window.innerWidth / 2;
    let popupY = y || window.innerHeight / 2;

    // Default popup dimensions (height will be updated dynamically)
    const popupWidth = 300;
    let popupHeight = 200; // Initial height, will be updated by popup content

    if (x !== undefined && y !== undefined) {
      // Position popup to the right of selection, with some offset
      popupX = x + 20;

      // Smart vertical positioning
      const spaceBelow = window.innerHeight - y;
      const spaceAbove = y;
      const minimumPopupHeight = 400; // Minimum height needed for popup

      if (spaceBelow >= minimumPopupHeight + 50) {
        // Enough space below - position below selection
        popupY = y + 20;
      } else if (spaceAbove >= minimumPopupHeight + 50) {
        // Not enough space below but enough above - position above selection
        popupY = y - popupHeight - 20;
      } else {
        // Not enough space in either direction - center vertically
        popupY = Math.max(20, (window.innerHeight - popupHeight) / 2);
      }

      // Ensure popup doesn't go off-screen horizontally
      if (popupX + popupWidth > window.innerWidth) {
        popupX = x - popupWidth - 20; // Show to the left instead
      }

      // Final bounds checking
      if (popupY + popupHeight > window.innerHeight) {
        popupY = window.innerHeight - popupHeight - 20;
      }
      if (popupY < 20) {
        popupY = 20;
      }
      if (popupX < 20) {
        popupX = 20;
      }
    }

    dictionaryPopup.style.cssText = `
      position: fixed;
      top: ${popupY}px;
      left: ${popupX}px;
      width: ${popupWidth}px;
      height: ${popupHeight}px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10001;
      background: white;
      overflow: auto;
      opacity: 0;
      visibility: hidden;
    `;

    // Store original position for scroll tracking (relative to viewport)
    popupOriginalPosition = { x: popupX, y: popupY };

    // Add scroll listener for popup
    const handlePopupScroll = () => {
      if (
        dictionaryPopup &&
        popupOriginalPosition &&
        x !== undefined &&
        y !== undefined
      ) {
        // Get the current scroll position
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Calculate the current position of the original selection in viewport coordinates
        const selectionViewportX = x - scrollX;
        const selectionViewportY = y - scrollY;

        // Recalculate popup position based on current selection position in viewport
        let newPopupX = selectionViewportX + 20;
        let newPopupY = selectionViewportY;

        // Smart vertical positioning based on viewport space and current popup height
        const spaceBelow = window.innerHeight - selectionViewportY;
        const spaceAbove = selectionViewportY;
        const currentPopupHeight =
          parseInt(dictionaryPopup.style.height) || popupHeight;
        const minimumPopupHeight = Math.min(currentPopupHeight, 150);

        if (spaceBelow >= minimumPopupHeight + 50) {
          // Enough space below - position below selection
          newPopupY = selectionViewportY + 20;
        } else if (spaceAbove >= minimumPopupHeight + 50) {
          // Not enough space below but enough above - position above selection
          newPopupY = selectionViewportY - currentPopupHeight - 20;
        } else {
          // Not enough space in either direction - center vertically in viewport
          newPopupY = Math.max(
            20,
            (window.innerHeight - currentPopupHeight) / 2,
          );
        }

        // Horizontal bounds checking (viewport relative)
        if (newPopupX + popupWidth > window.innerWidth) {
          newPopupX = selectionViewportX - popupWidth - 20;
        }

        // Final bounds checking (viewport relative)
        if (newPopupY + currentPopupHeight > window.innerHeight) {
          newPopupY = window.innerHeight - currentPopupHeight - 20;
        }
        if (newPopupY < 20) {
          newPopupY = 20;
        }
        if (newPopupX < 20) {
          newPopupX = 20;
        }

        // Update popup position (fixed positioning, so viewport relative)
        dictionaryPopup.style.left = `${newPopupX}px`;
        dictionaryPopup.style.top = `${newPopupY}px`;
      }
    };

    window.addEventListener("scroll", handlePopupScroll);
    (dictionaryPopup as any).scrollHandler = handlePopupScroll;

    document.body.appendChild(dictionaryPopup);

    // Listen for popup ready message and then send the text
    let textSent = false;
    let popupVisible = false;
    const handlePopupMessage = (event: MessageEvent) => {
      // Only handle messages from our popup iframe
      if (event.source !== dictionaryPopup?.contentWindow) {
        return;
      }

      if (event.data.type === "POPUP_READY" && !textSent) {
        dictionaryPopup?.contentWindow?.postMessage(
          {
            type: "TRANSLATE_TEXT",
            text: selectedText,
            appLanguage: currentAppLanguage,
          },
          "*",
        );
        textSent = true;

        // Show popup after it's ready and positioned with a small delay
        if (dictionaryPopup && !popupVisible) {
          setTimeout(() => {
            if (dictionaryPopup && !popupVisible) {
              // Add transitions after positioning
              dictionaryPopup.style.transition =
                "opacity 0.2s ease, height 0.3s ease";
              dictionaryPopup.style.opacity = "1";
              dictionaryPopup.style.visibility = "visible";
              popupVisible = true;
            }
          }, 350); // 250ms delay to ensure proper positioning
        }
      } else if (event.data.type === "UPDATE_POPUP_HEIGHT" && dictionaryPopup) {
        const newHeight = event.data.height;
        popupHeight = newHeight; // Update the stored height
        dictionaryPopup.style.height = `${newHeight}px`;

        // Reposition popup if needed based on new height
        if (x !== undefined && y !== undefined) {
          let newPopupX = popupX;
          let newPopupY = popupY;

          // Smart vertical repositioning based on new height
          const spaceBelow = window.innerHeight - y;
          const spaceAbove = y;
          const minimumPopupHeight = Math.min(newHeight, 150);

          if (spaceBelow >= minimumPopupHeight + 50) {
            // Enough space below - keep it below selection
            newPopupY = y + 20;
          } else if (spaceAbove >= minimumPopupHeight + 50) {
            // Not enough space below but enough above - move above selection
            newPopupY = y - newHeight - 20;
          } else {
            // Not enough space in either direction - center vertically
            newPopupY = Math.max(20, (window.innerHeight - newHeight) / 2);
          }

          // Final bounds checking with new height
          if (newPopupY + newHeight > window.innerHeight) {
            newPopupY = window.innerHeight - newHeight - 20;
          }
          if (newPopupY < 20) {
            newPopupY = 20;
          }

          // Update position if it changed
          if (newPopupY !== popupY) {
            dictionaryPopup.style.top = `${newPopupY}px`;
            popupOriginalPosition = { x: newPopupX, y: newPopupY };
          }
        }

        // Show popup if not already visible with a small delay
        if (!popupVisible) {
          setTimeout(() => {
            if (dictionaryPopup && !popupVisible) {
              dictionaryPopup.style.transition =
                "opacity 0.2s ease, height 0.3s ease";
              dictionaryPopup.style.opacity = "1";
              dictionaryPopup.style.visibility = "visible";
              popupVisible = true;
            }
          }, 150); // Reduced delay since height is already calculated
        }
      }
    };
    window.addEventListener("message", handlePopupMessage);
    (dictionaryPopup as any).messageHandler = handlePopupMessage;

    // Fallback: Send text after a timeout in case POPUP_READY is missed
    const fallbackTimeout = setTimeout(() => {
      if (!textSent && dictionaryPopup?.contentWindow) {
        dictionaryPopup.contentWindow.postMessage(
          {
            type: "TRANSLATE_TEXT",
            text: selectedText,
            appLanguage: currentAppLanguage,
          },
          "*",
        );
        textSent = true;
      }
    }, 2000); // 2 second fallback

    (dictionaryPopup as any).fallbackTimeout = fallbackTimeout; // Send the selected text to the popup with a delay as fallback
    dictionaryPopup.onload = () => {
      setTimeout(() => {
        if (!textSent) {
          dictionaryPopup?.contentWindow?.postMessage(
            {
              type: "TRANSLATE_TEXT",
              text: selectedText,
              appLanguage: currentAppLanguage,
            },
            "*",
          );
          textSent = true;
        }

        // Fallback: Show popup after delay if still not visible
        setTimeout(() => {
          if (dictionaryPopup && !popupVisible) {
            setTimeout(() => {
              if (dictionaryPopup && !popupVisible) {
                dictionaryPopup.style.transition =
                  "opacity 0.2s ease, height 0.3s ease";
                dictionaryPopup.style.opacity = "1";
                dictionaryPopup.style.visibility = "visible";
                popupVisible = true;
              }
            }, 200); // Additional delay for fallback
          }
        }, 500);
      }, 1000); // Wait 1000ms for React component to mount as fallback
    };

    // Add click-outside-to-close functionality
    const handleClickOutside = (e: MouseEvent) => {
      if (dictionaryPopup && !dictionaryPopup.contains(e.target as Node)) {
        removeDictionaryPopup();
      }
    };

    // Add the event listener with a small delay to prevent immediate closure
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 200);

    // Store the cleanup function for later removal
    (dictionaryPopup as any).clickOutsideHandler = handleClickOutside;

    // Add error handling for iframe loading
    dictionaryPopup.onerror = (error) => {
      console.error("Error loading dictionary popup iframe:", error);
    };
  } catch (error) {
    console.error("Error creating dictionary popup:", error);
  }
}

// Remove the dictionary popup
function removeDictionaryPopup() {
  if (dictionaryPopup) {
    // Clean up click-outside event listener
    const clickHandler = (dictionaryPopup as any).clickOutsideHandler;
    if (clickHandler) {
      document.removeEventListener("click", clickHandler);
    }

    // Clean up scroll event listener
    const scrollHandler = (dictionaryPopup as any).scrollHandler;
    if (scrollHandler) {
      window.removeEventListener("scroll", scrollHandler);
    }

    // Clean up message event listener
    const messageHandler = (dictionaryPopup as any).messageHandler;
    if (messageHandler) {
      window.removeEventListener("message", messageHandler);
    }

    // Clean up fallback timeout
    const fallbackTimeout = (dictionaryPopup as any).fallbackTimeout;
    if (fallbackTimeout) {
      clearTimeout(fallbackTimeout);
    }

    dictionaryPopup.remove();
    dictionaryPopup = null;
    popupOriginalPosition = null;
  }
}

// Listen for text selection
document.addEventListener("mouseup", async (e) => {
  // Only proceed if it's a left mouse button release (button 0)
  if (e.button !== 0) {
    return;
  }

  // Check if extension is enabled
  const enabled = await isExtensionEnabled();
  if (!enabled) {
    return;
  }

  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  if (selectedText && selectedText.length > 0) {
    const rect = selection?.getRangeAt(0).getBoundingClientRect();
    if (rect) {
      await showDictionaryButton(
        rect.left + rect.width / 2,
        rect.top + window.scrollY - 35, // Position above the selection
        selectedText,
      );
    }
  } else if (!selectedText || selectedText.length === 0) {
    removeDictionaryButton();
  }
});

// Alternative listener for selection changes
document.addEventListener("selectionchange", () => {
  // Clear previous timeout
  if (selectionChangeTimeout) {
    clearTimeout(selectionChangeTimeout);
  }

  // Debounce the selection change event
  selectionChangeTimeout = window.setTimeout(async () => {
    // Check if extension is enabled
    const enabled = await isExtensionEnabled();
    if (!enabled) {
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    // Only proceed if text is different from what we already have
    if (
      selectedText &&
      selectedText.length > 0 &&
      selectedText !== lastSelectedText
    ) {
      const rect = selection?.getRangeAt(0).getBoundingClientRect();
      if (rect) {
        await showDictionaryButton(
          rect.left + rect.width / 2,
          rect.top + window.scrollY - 35, // Position above the selection
          selectedText,
        );
      }
    } else if (!selectedText || selectedText.length === 0) {
      // Clear the button if no text is selected
      if (lastSelectedText) {
        removeDictionaryButton();
      }
    }

    selectionChangeTimeout = null;
  }, 300); // 300ms debounce
});

// Listen for messages from popup
window.addEventListener("message", (event) => {
  if (event.data.type === "CLOSE_POPUP") {
    removeDictionaryPopup();
  }
});

// Remove button when clicking elsewhere
document.addEventListener("click", (e) => {
  if (dictionaryButton) {
    const isClickOnButton = dictionaryButton.contains(e.target as Node);
    const justCreated = (dictionaryButton as any).justCreated;

    if (isClickOnButton) {
    } else if (justCreated) {
    } else {
      removeDictionaryButton();
    }
  }
});

// Initialize extension state on load
(async () => {
  extensionEnabled = await isExtensionEnabled();
})();
