(async function main() {
  // Notify the background script that the browser action has been opened. This
  // must be done using connect so that the background script can detect when the
  // panel closes.
  const port = browser.runtime.connect();
  port.postMessage({type: 'browser-action-opened', sender: 'browser-action'});

  const bgAddItem = document.getElementById('bg-add-item');
  bgAddItem.addEventListener('click', () => port.postMessage({type: 'bg-add-item'}));

  const csAddItem = document.getElementById('cs-add-item');
  csAddItem.addEventListener('click', () => port.postMessage({type: 'cs-add-item'}));

  const bgBulkAddItems = document.getElementById('bg-bulk-add-items');
  bgBulkAddItems.addEventListener('click', () => port.postMessage({type: 'bg-bulk-add-items'}));

  const csBulkAddItems = document.getElementById('cs-bulk-add-items');
  csBulkAddItems.addEventListener('click', () => port.postMessage({type: 'cs-bulk-add-items'}));

  const bgEditItem = document.getElementById('bg-edit-item');
  bgEditItem.addEventListener('click', () => port.postMessage({type: 'bg-edit-item'}));

  const csEditItem = document.getElementById('cs-edit-item');
  csEditItem.addEventListener('click', () => port.postMessage({type: 'cs-edit-item'}));
})();
