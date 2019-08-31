(async function main() {
  const port = browser.runtime.connect();
  port.postMessage({
    type: "content-script-opened",
    sender: "content-script"
  });

  const portMessageHandlers = new Map([
    ["cs-add-item", csAddItem],
    ["cs-bulk-add-items", csBulkAddItems],
    ["cs-edit-item", csEditItem],
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

  async function csEditItem(message, port) {
    const {item} = message;
    const oldItem = await browser.storage.local.get(Object.keys(item)[0]);
    console.log("content script edited item ", oldItem, "; it is now ", message.item);
    await browser.storage.local.set(item);
  }
}());
