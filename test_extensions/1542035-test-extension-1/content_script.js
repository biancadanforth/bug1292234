console.log(1);
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
  await browser.storage.local.set(message.item);
}

async function csBulkAddItems(message, port) {
  await browser.storage.local.set(message.items);
}
}());