export const checkPrivilegePage = async (tabId: number): Promise<boolean> => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => true, // Simple test function
    });
    return false; // Script executed successfully, not a privilege page
  } catch (error) {
    return true; // Privilege page or restricted
  }
};
