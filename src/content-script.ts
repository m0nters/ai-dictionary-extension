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

const popupWidth = 300;
let dictionaryButton: HTMLElement | null = null;
let dictionaryPopup: HTMLIFrameElement | null = null;
let extensionEnabled: boolean = true; // Default to enabled
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

function getButtonPosition() {
  const rects = window.getSelection()!.getRangeAt(0).getClientRects();
  const lastRect = rects[rects.length - 1];

  let xPos = lastRect.right - 20;
  let yPos = lastRect.bottom + window.scrollY + 5; // Default position below

  // Ensure button doesn't go off-screen vertically
  const buttonHeight = 26;
  const buttonWidth = 80;
  if (yPos + buttonHeight > window.innerHeight + window.scrollY) {
    yPos = lastRect.top + window.scrollY - buttonHeight - 5; // Position above
  }

  // Ensure button doesn't go off-screen horizontally
  if (xPos + buttonWidth > window.innerWidth) {
    xPos = window.innerWidth - buttonWidth - 20; // Shift left to fit
  }

  return { xPos, yPos };
}

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
      background: white;
      color: #4f46e5;
      border: 1px solid #4f46e5;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: Roboto, sans-serif;
      cursor: pointer;
      z-index: 99999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      user-select: none;
      pointer-events: auto;
      display: inline-block;
      width: auto;
      text-align: center;
      white-space: nowrap;
      line-height: 1.2;
    `;

    // Add hover effects to make it more obvious it's clickable
    dictionaryButton.addEventListener("mouseenter", () => {
      dictionaryButton!.style.background = "#4f46e5";
      dictionaryButton!.style.color = "white";
      dictionaryButton!.style.border = "1px solid white";
    });

    dictionaryButton.addEventListener("mouseleave", () => {
      dictionaryButton!.style.background = "white";
      dictionaryButton!.style.color = "#4f46e5";
      dictionaryButton!.style.border = "1px solid #4f46e5";
    });

    // Prevent inspecting element
    dictionaryButton.addEventListener("contextmenu", () => {
      removeDictionaryButton();
    });

    document.body.appendChild(dictionaryButton);

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
    selectedText &&
    selectedText.length > 0 &&
    selectedText !== lastSelectedText // prevent showing button after clicking it
  ) {
    lastSelectedText = selectedText;
    const { xPos, yPos } = getButtonPosition();

    // show dictionary button and popup at the bottom right of the selection
    // by default
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

// Remove the dictionary button
function removeDictionaryButton() {
  if (dictionaryButton) {
    dictionaryButton.remove();
    dictionaryButton = null;
  }
}

function getPopupPosition(x: number, y: number, height: number) {
  // Calculate position near the selected text
  let newX = x;
  let newY = y;

  const selection = window.getSelection();
  const rects = selection!.getRangeAt(0).getClientRects(); // Get all rectangles for multi-line selection
  const lastRect = rects[rects.length - 1];

  // Ensure popup doesn't go off-screen vertically
  const spaceAbove = lastRect.top;
  const spaceBelow = window.innerHeight - lastRect.bottom;
  const minimumPopupHeight = 400; // Minimum height needed for popup, this is just for estimation for height calculation

  if (spaceBelow < minimumPopupHeight && spaceAbove >= minimumPopupHeight) {
    // Not enough space below but enough above -> position above selection
    newY = y - height + 30;
  } else if (
    spaceBelow < minimumPopupHeight &&
    spaceAbove < minimumPopupHeight
  ) {
    // Not enough space in either direction -> center vertically
    newX += 30;
    newY = (window.innerHeight - height) / 2 + window.scrollY;
  }

  // Ensure popup doesn't go off-screen horizontally
  if (newX + popupWidth > window.innerWidth) {
    newX = x - popupWidth; // Show to the left instead
  }
  return { popupX: newX, popupY: newY };
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

    // Default popup dimensions (height will be updated dynamically)
    let popupInitialHeight = 200; // Initial height, e.g., for the loading screen, will be updated later by popup content

    const { popupX, popupY } = getPopupPosition(x, y, popupInitialHeight);

    dictionaryPopup.style.cssText = `
      position: absolute;
      left: ${popupX}px;
      top: ${popupY}px;
      width: ${popupWidth}px;
      height: ${popupInitialHeight}px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 99999;
      background: white;
      overflow: auto;
      opacity: 0;
      visibility: hidden;
    `;

    document.body.appendChild(dictionaryPopup);

    // Listen for popup ready message and then send the text
    const handlePopupMessage = (event: MessageEvent) => {
      // Only handle messages from our popup iframe
      if (event.source !== dictionaryPopup?.contentWindow) {
        return;
      }

      if (event.data.type === "POPUP_READY") {
        dictionaryPopup?.contentWindow?.postMessage(
          {
            type: "TRANSLATE_TEXT",
            text: selectedText,
            appLanguage: currentAppLanguage,
          },
          "*",
        );

        // The delay is to hide the position transition when popup height is
        // adjusted from loading screen to actual content, this is just for UI.
        // If you delete it, there will be a weird jumpy effect.
        if (dictionaryPopup) {
          setTimeout(() => {
            if (dictionaryPopup) {
              dictionaryPopup.style.opacity = "1";
              dictionaryPopup.style.visibility = "visible";
            }
          }, 200); // this is a minimum delay quantity, lower than this may cause the jumpy effect to be visible
        }
      } else if (event.data.type === "UPDATE_POPUP_HEIGHT" && dictionaryPopup) {
        const newHeight = event.data.height;
        dictionaryPopup.style.height = `${newHeight}px`;
        const { popupX, popupY } = getPopupPosition(x, y, newHeight);
        dictionaryPopup.style.left = `${popupX}px`;
        dictionaryPopup.style.top = `${popupY}px`;
      }
    };
    window.addEventListener("message", handlePopupMessage);
    (dictionaryPopup as any).messageHandler = handlePopupMessage; // save the reference for later removal

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
    // Notify the popup to stop any TTS before removing
    dictionaryPopup.contentWindow?.postMessage({ type: "POPUP_CLOSING" }, "*");

    // Give it a moment to process the message before removing
    setTimeout(() => {
      if (dictionaryPopup) {
        // Clean up message event listener
        const messageHandler = (dictionaryPopup as any).messageHandler;
        if (messageHandler) {
          window.removeEventListener("message", messageHandler);
        }

        dictionaryPopup.remove();
        dictionaryPopup = null;
      }
    }, 50);
  }
}

// Listen for messages from popup
window.addEventListener("message", (event) => {
  if (event.data.type === "CLOSE_POPUP") {
    removeDictionaryPopup();
  }
});

// Increasing UX, when select a different text, the old button and popup should
// disappear right away, not waiting for mouseup event for it to be removed by
// click event
document.addEventListener("mousedown", (e) => {
  if (dictionaryButton && !dictionaryButton.contains(e.target as Node)) {
    removeDictionaryButton();
  }

  if (dictionaryPopup && !dictionaryPopup.contains(e.target as Node)) {
    removeDictionaryPopup();
  }
});
