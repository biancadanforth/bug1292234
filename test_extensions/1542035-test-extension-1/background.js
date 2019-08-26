(async function main() {
  let BROWSER_ACTION_PORT = null;
  let CONTENT_SCRIPT_PORT = null;

  let nextKey = 0;
  let nextValue = 0;
  const map = new Map();
  map.set("a", "b");
  const set = new Set();
  set.add(1).add("a");
  const arrBuff = new ArrayBuffer(8);
  const bigint = 1n;
  const date = new Date(0);
  const regexp = /regexp/;

  // await browser.storage.local.set({a: 123, b: 456});


  function handleChange(changes, areaName) {}

  browser.storage.onChanged.addListener(handleChange);

  // Messages from the browserAction popup script
  const portMessageHandlers = new Map([
    ['browser-action-opened', () => console.log("browserAction popup script loaded")],
    ['bg-add-item', () => addItem('background-script')],
    ['bg-bulk-add-items', () => bulkAddItems('background-script')],
    ['bg-edit-item', () => {}],
    ['content-script-opened', () => console.log("content script loaded")],
    ['cs-add-item', () => addItem('content-script')],
    ['cs-bulk-add-items', () => bulkAddItems('content-script')],
  ]);

  function handleConnect(port) {
    port.onMessage.addListener((portMessage) => {
      if (!BROWSER_ACTION_PORT && portMessage.sender === 'browser-action') {
        BROWSER_ACTION_PORT = port;
      } else if (!CONTENT_SCRIPT_PORT && portMessage.sender === 'content-script') {
        CONTENT_SCRIPT_PORT = port;
      }
      if (portMessageHandlers.has(portMessage.type)) {
        return portMessageHandlers.get(portMessage.type)(portMessage, port);
      }

      return undefined;
    });
  }

  async function addItem(fromScript) {
    const item = {[String(nextKey)]: nextValue};
    if (fromScript === 'content-script') {
      await CONTENT_SCRIPT_PORT.postMessage({type: 'cs-add-item', item});
    } else {
      await browser.storage.local.set(item);
    }
    console.log(`${fromScript} added item with key ${item[nextKey]} and value ${item[nextValue]}.`);
    nextKey++;
    nextValue++;
  }

  async function bulkAddItems(fromScript) {
    const items = {};
    for (let i = 0; i < 10; i++) {
      const item = {};
      items[nextKey] = nextValue;
      nextKey++;
      nextValue++;
    }
    if (fromScript === 'content-script') {
      await CONTENT_SCRIPT_PORT.postMessage({type: 'cs-bulk-add-items', items});
    } else {
      await browser.storage.local.set(items);
    }
    console.log(`${fromScript} bulk added items ${items}`);
  }

  // Register centralized message handlers
  browser.runtime.onConnect.addListener(handleConnect);
}());
