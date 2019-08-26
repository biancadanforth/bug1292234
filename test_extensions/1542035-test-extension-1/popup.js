(async function main() {
  // Notify the background script that the browser action has been opened. This
  // must be done using connect so that the background script can detect when the
  // panel closes.
  const port = browser.runtime.connect();
  port.postMessage({type: 'browser-action-opened', sender: 'browser-action'});

  const bgAddItem = document.getElementById('bg-add-item');
  bgAddItem.addEventListener('click', () => port.postMessage({type: 'bg-page-add-item'}));

  const csAddItem = document.getElementById('cs-add-item');
  csAddItem.addEventListener('click', () => port.postMessage({type: 'cs-add-item'}));
})();