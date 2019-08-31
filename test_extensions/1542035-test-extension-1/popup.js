(async function main() {
  // Notify the background script that the browser action has been opened. This
  // must be done using connect so that the background script can detect when the
  // panel closes.

  const IDS = [
    "bg-add-item",
    "cs-add-item",
    "bg-bulk-add-items",
    "cs-bulk-add-items",
    "bg-edit-item",
    "cs-edit-item",
    "bg-bulk-edit-items",
    "cs-bulk-edit-items",
    "bg-remove-item",
    "cs-remove-item",
    "bg-bulk-remove-items",
    "cs-bulk-remove-items",
    "bg-remove-all-items",
    "cs-remove-all-items",
  ];

  const port = browser.runtime.connect();
  port.postMessage({type: 'browser-action-opened', sender: 'browser-action'});

  for (const id of IDS) {
    const element = document.getElementById(id);
    element.addEventListener('click', () => port.postMessage({type: id}));
  }
})();
