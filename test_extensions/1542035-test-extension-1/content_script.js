(async function main() {
const port = browser.runtime.connect();
port.postMessage({
  type: "content-script-opened",
  sender: "content-script"
});

const portMessageHandlers = new Map([
  ["cs-add-item", csAddItem],
  ["cs-bulk-add-items", csBulkAddItems],
]);

port.onMessage.addListener((portMessage) => {
  if (portMessageHandlers.has(portMessage.type)) {
    return portMessageHandlers.get(portMessage.type)(portMessage, port);
  }

  return undefined;
});

async function csAddItem(message, port) {
  console.log("content script added item: ", message.item);
  await browser.storage.local.set(message.item);
}

async function csBulkAddItems(message, port) {
  console.log("content script bulk added items: ", message.items);
  await browser.storage.local.set(message.items);
}
}());
