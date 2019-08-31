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
    ["cs-remove-item", csRemoveItem],
    ["cs-remove-all-items", csRemoveAllItems],
  ]);

  port.onMessage.addListener((portMessage) => {
    if (portMessageHandlers.has(portMessage.type)) {
      return portMessageHandlers.get(portMessage.type)(portMessage, port);
    }

    return undefined;
  });

  async function csAddItem(message, port) {
    await browser.storage.local.set(message.item);
    console.log("content script added item: ", message.item);
  }

  async function csBulkAddItems(message, port) {
    await browser.storage.local.set(message.items);
    console.log("content script bulk added items: ", message.items);
  }

  async function csEditItem(message, port) {
    const {item} = message;
    const oldItem = await browser.storage.local.get(Object.keys(item)[0]);
    await browser.storage.local.set(item);
    console.log("content script edited item: ", oldItem, "; it is now: ", message.item);
  }

  async function csRemoveItem(message, port) {
    const {item} = message;
    await browser.storage.local.remove(Object.keys(item)[0]);
    console.log("content script removed item: ", item);
  }

  async function csRemoveAllItems(message, port) {
    await browser.storage.local.clear();
    console.log("content script removed all items");
  }
}());
