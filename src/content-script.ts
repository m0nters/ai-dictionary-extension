/* This content script handles showing "dictionary button" and "dictionary popup"
 * "dictionary button" is a small button that appears when selecting a text
 * "dictionary popup" is a popup that appears after clicking the button, showing the translation
 * Remember these 2 terms!
 */

// We have to define translations in here like this instead of in i18n `locales`
// folder because content script has issues with ES module. There are some
// workarounds with this but they are all unsafe.
// Google sucks!
// Reference: https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension

const DICTIONARY = {
  en: "dictionary",
  vi: "tra từ điển",
  zh: "词典",
  ja: "辞書",
  ko: "사전",
  fr: "dictionnaire",
  es: "diccionario",
  de: "Wörterbuch",
} as const;

async function getCurrentAppLanguage(): Promise<string> {
  try {
    const data = await new Promise<any>((resolve, reject) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.sync
      ) {
        chrome.storage.sync.get(["appLangCode"], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } else {
        resolve({ appLangCode: "en" });
      }
    });

    return data.appLangCode || "en";
  } catch (error) {
    console.error("Error getting current app language:", error);
    return "en"; // Fallback language
  }
}

async function getDictionaryButtonText(): Promise<string> {
  try {
    const currentLang =
      (await getCurrentAppLanguage()) as keyof typeof DICTIONARY;
    const translation = DICTIONARY[currentLang];
    return translation;
  } catch (error) {
    console.error("Error getting dictionary button text:", error);
    return "dictionary"; // Fallback text
  }
}

let dictionaryButton: HTMLElement | null = null;
let dictionaryPopup: HTMLIFrameElement | null = null;
let popupOriginalPosition: { x: number; y: number } | null = null;
let extensionEnabled: boolean = true; // Default to enabled
let isButtonJustCreated: boolean = false;
let lastSelectedText: string | null = null;

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

// Initialize extension state on load
(async () => {
  extensionEnabled = await isExtensionEnabled();
})();

// Listen for extension toggle messages (from App.tsx)
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
  selectedText: string,
  x: number,
  y: number,
) {
  try {
    // remove any existing button, just in case there's bug
    removeDictionaryButton();

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
      z-index: 99999;
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

    // Add hover effects to make it more obvious it's clickable
    dictionaryButton.addEventListener("mouseenter", () => {
      dictionaryButton!.style.background = "#4338ca";
      dictionaryButton!.style.transform = "scale(1.05)";
    });

    dictionaryButton.addEventListener("mouseleave", () => {
      dictionaryButton!.style.background = "#4f46e5";
      dictionaryButton!.style.transform = "scale(1)";
    });

    // Prevent inspecting element
    dictionaryButton.addEventListener("contextmenu", () => {
      removeDictionaryButton();
    });

    document.body.appendChild(dictionaryButton);

    // Add a flag to prevent immediate removal by the click-outside detector
    isButtonJustCreated = true;
    // Clear the creation flag
    setTimeout(() => {
      isButtonJustCreated = false;
    }, 200);

    // when click, replace dictionary button by dictionary popup
    dictionaryButton.addEventListener("click", async (e) => {
      // Prevent event bubbling
      e.stopPropagation();
      e.preventDefault();
      removeDictionaryButton();
      await showDictionaryPopup(selectedText, x, y);
    });
  } catch (error) {
    console.error("Error creating dictionary button:", error);
  }
}

// Remove the dictionary button
function removeDictionaryButton() {
  if (dictionaryButton) {
    dictionaryButton.remove();
    dictionaryButton = null;
  }
}

// Show the dictionary popup (iframe version)
async function showDictionaryPopup(selectedText: string, x: number, y: number) {
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
    let popupX = x;
    let popupY = y;

    // Default popup dimensions (height will be updated dynamically)
    const popupWidth = 300;
    let popupHeight = 200; // Initial height, e.g., for the loading screen, will be updated later by popup content

    if (x !== undefined && y !== undefined) {
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

// Alternative listener for selection changes
// the event is not "selectionchange" because for example, we are typing something
// and select all using Ctrl+A
document.addEventListener("mouseup", async () => {
  // Check if extension is enabled
  const enabled = await isExtensionEnabled();
  if (!enabled) {
    return;
  }

  const selection = window.getSelection();
  const selectedText = selection?.toString().replace(/ +/g, " ").trim(); // Normalize spaces

  if (
    selection &&
    selectedText &&
    selectedText.length > 0 &&
    selectedText !== lastSelectedText // prevent showing button after clicking it
  ) {
    lastSelectedText = selectedText;

    const rects = selection.getRangeAt(0).getClientRects(); // Get all rectangles for multi-line selection
    const lastRect = rects[rects.length - 1]; // Use the last line's rectangle
    let xPos = lastRect.right - 20;
    let yPos = lastRect.bottom + window.scrollY + 5; // Default position below

    // Check if the button would go off-screen
    const buttonHeight = 26;
    if (yPos + buttonHeight > window.innerHeight + window.scrollY) {
      yPos = lastRect.top + window.scrollY - buttonHeight - 5; // Position above
    }

    await showDictionaryButton(selectedText, xPos, yPos);
  }
  // this case only happens when select no text, or in the middle between
  // selecting 2 different texts
  else if (!selectedText || selectedText.length === 0) {
    // reset last selected text
    lastSelectedText = null;
    // Clear the button if no text is selected
    removeDictionaryButton();
  }
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
    const justCreated = isButtonJustCreated;

    if (!isClickOnButton && !justCreated) {
      removeDictionaryButton();
    }
  }
});

// Increasing UX, when select a different text, the old button should disappear
// right away, not waiting for mouseup event for it to be removed by click event
document.addEventListener("mousedown", (e) => {
  if (dictionaryButton && !dictionaryButton.contains(e.target as Node)) {
    removeDictionaryButton();
    isButtonJustCreated = false; // Reset flag on outside click
  }
});
