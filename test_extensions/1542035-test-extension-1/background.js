(async function main() {
  const map = new Map();
  map.set("a", "b");
  const set = new Set();
  set.add(1).add("a");
  const arrBuff = new ArrayBuffer(8);
  const bigint = 1n;
  const date = new Date(0);
  const regexp = /regexp/;

  // await browser.storage.local.set({a: 123, b: 456});

  function handleChange(changes, areaName) {
    if (areaName !== 'local') return;
    console.log("WebExtensionLog::ExtensionLocalStorageChange", changes);
  }
  
  browser.storage.onChanged.addListener(handleChange);

  const messageHandlers = new Map([
    // TODO ...
  ]);

  async function handleMessage(message, sender) {
    if (messageHandlers.has(message.type)) {
      return messageHandlers.get(message.type)(message, sender);
    }

    return undefined;
  }

  // connect/port handlers

  function handleBrowserActionOpened() {
    // TODO
    console.log("browser action opened");
  }

  const portMessageHandlers = new Map([
    ['browser-action-opened', handleBrowserActionOpened],
    ['bg_page_add_item', addItem],
    ['bg_page_bulk_add_items', bulkAddItem],
    ['bg_page_edit_item', editItem],
  ]);

  function handleConnect(port) {
    port.onMessage.addListener((portMessage) => {
      if (portMessageHandlers.has(portMessage.type)) {
        return portMessageHandlers.get(portMessage.type)(portMessage, port);
      }

      return undefined;
    });
  }

  // Register centralized message handlers
  browser.runtime.onMessage.addListener(handleMessage);
  browser.runtime.onConnect.addListener(handleConnect);

  function addItem() {
    console.log("bg page addItem");
  }
  function bulkAddItem() {}
  function editItem() {}
}());
