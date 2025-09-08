const THANK_YOU_URL = chrome.runtime.getURL("thank-you.html");
const UNINSTALL_SURVEY_URL = "https://forms.gle/EfpEMy8NdidrdVg36";

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installe/updated:", details);

  if (details.reason === "install") {
    // Extension was installed for the first time
    console.log("First time installation detected");

    // Open thank you page in a new tab
    chrome.tabs.create({
      url: THANK_YOU_URL,
      active: true,
    });

    // Set the uninstall URL for future feedback
    chrome.runtime.setUninstallURL(UNINSTALL_SURVEY_URL);
  } else if (details.reason === "update") {
    // Extension was updated
    console.log("Extension updated from version:", details.previousVersion);

    // Optionally handle updates (e.g., show changelog)
    // You can add update-specific logic here if needed

    // Make sure uninstall URL is still set
    chrome.runtime.setUninstallURL(UNINSTALL_SURVEY_URL);
  }
});

// Handle extension startup (when browser starts with extension already installed)
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");

  // Ensure uninstall URL is set on startup
  chrome.runtime.setUninstallURL(UNINSTALL_SURVEY_URL);
});

// Optional: Handle when extension is enabled/disabled
chrome.management.onEnabled.addListener((info) => {
  if (info.id === chrome.runtime.id) {
    console.log("Extension enabled");
    // Set uninstall URL when extension is re-enabled
    chrome.runtime.setUninstallURL(UNINSTALL_SURVEY_URL);
  }
});

// Optional: Log when extension context is invalidated (for debugging)
chrome.runtime.onSuspend.addListener(() => {
  console.log("Extension suspended");
});

export {};
