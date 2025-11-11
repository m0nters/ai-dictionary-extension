const THANK_YOU_URL = chrome.runtime.getURL("thank-you.html");
const UNINSTALL_SURVEY_URL = "https://forms.gle/EfpEMy8NdidrdVg36";

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installe/updated:", details);

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // Extension was installed for the first time
    console.log("First time installation detected");

    // Open thank you page in a new tab
    chrome.tabs.create({
      url: THANK_YOU_URL,
      active: true,
    });

    // Set the uninstall URL for future feedback
    chrome.runtime.setUninstallURL(UNINSTALL_SURVEY_URL);
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // Extension was updated
    console.log("Extension updated from version:", details.previousVersion);

    // Optionally handle updates (e.g., show changelog)
    // You can add update-specific logic here if needed
  }
});

export {};
