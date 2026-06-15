chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-memorypal",
    title: "Save to MemoryPal",
    contexts: ["page", "link", "selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "save-to-memorypal") return;

  // Store the right-clicked link URL (if any) so popup can read it
  const targetUrl = info.linkUrl || (tab && tab.url) || "";
  chrome.storage.session.set({ memorypal_context_url: targetUrl }, () => {
    chrome.action.openPopup();
  });
});
