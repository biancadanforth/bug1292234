(async function main() {
  let BROWSER_ACTION_PORT = null;
  let CONTENT_SCRIPT_PORT = null;

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
    ['browser-action-opened', () => console.log("browserAction popup script opened")],
    ['bg-add-item', () => {}],
    ['bg-bulk-add-items', () => {}],
    ['bg-edit-item', () => {}],
    ['content-script-opened', () => console.log("content script loaded")],
    ['cs-add-item', async () => {
      const item = {a: 123}; // TODO: randomly generate new item to add
      await CONTENT_SCRIPT_PORT.postMessage({type: 'cs-add-item', item});
      console.log(`Content script added item ${item}.`);
    }],
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

  // Register centralized message handlers
  browser.runtime.onConnect.addListener(handleConnect);
}());
