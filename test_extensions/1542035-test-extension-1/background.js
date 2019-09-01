(async function main() {
  let BROWSER_ACTION_PORT = null;
  let CONTENT_SCRIPT_PORT = null;

  let {counter} = await browser.storage.sync.get();
  if (counter === undefined) {
    counter = 1;
  }

  // The storage panel doesn't currently support "bigint", "undefined", "symbol" or "function"
  const ACCEPTABLE_TYPES = [
    "object",
    "boolean",
    "number",
    "string",
  ];

  const NEW_VALUES_BY_TYPE = {
    object: {zebras: "have stripes"},
    boolean: false,
    number: 42,
    string: "giraffes",
  }

  function handleChange(changes, areaName) {}
  browser.storage.onChanged.addListener(handleChange);

  // Messages from the browserAction popup script
  const portMessageHandlers = new Map([
    ['browser-action-opened', () => console.log("browserAction popup script loaded")],
    ['bg-add-item', () => addItem('background-script')],
    ['bg-bulk-add-items', () => bulkAddItems('background-script')],
    ['bg-edit-item', () => editItem('background-script')],
    ['bg-bulk-edit-items', () => bulkEditItems('background-script')],
    ['bg-remove-item', () => removeItem('background-script')],
    ['bg-bulk-remove-items', () => bulkRemoveItems('background-script')],
    ['bg-remove-all-items', () => removeAllItems('background-script')],
    ['content-script-opened', () => console.log("content script loaded")],
    ['cs-add-item', () => addItem('content-script')],
    ['cs-bulk-add-items', () => bulkAddItems('content-script')],
    ['cs-edit-item', () => editItem('content-script')],
    ['cs-bulk-edit-items', () => bulkEditItems('content-script')],
    ['cs-remove-item', () => removeItem('content-script')],
    ['cs-bulk-remove-items', () => bulkRemoveItems('content-script')],
    ['cs-remove-all-items', () => removeAllItems('content-script')],
    // TODO add menu item for non-JSONifiable values above
    // TODO add menu item for all JSONifiable values
  ]);

  function handleConnect(port) {
    port.onMessage.addListener((portMessage) => {
      if (!BROWSER_ACTION_PORT && portMessage.sender === 'browser-action') {
        port.onDisconnect.addListener(() => {
          BROWSER_ACTION_PORT = null;
        });
        BROWSER_ACTION_PORT = port;
      } else if (!CONTENT_SCRIPT_PORT && portMessage.sender === 'content-script') {
        port.onDisconnect.addListener(() => {
          CONTENT_SCRIPT_PORT = null;
        });
        CONTENT_SCRIPT_PORT = port;
      }
      if (portMessageHandlers.has(portMessage.type)) {
        return portMessageHandlers.get(portMessage.type)(portMessage, port);
      }

      return undefined;
    });
  }

  async function addItem(fromScript) {
    const item = {[String(counter)]: counter};
    if (fromScript === 'content-script') {
      await CONTENT_SCRIPT_PORT.postMessage({type: 'cs-add-item', item});
    } else {
      await browser.storage.local.set(item);
    }
    console.log(`${fromScript} added item: `, item);
    counter++;
    await browser.storage.sync.set({counter});
  }

  async function bulkAddItems(fromScript) {
    const items = {};
    for (let i = 1; i <= 10; i++) {
      const item = {};
      items[counter] = counter;
      counter++;
      await browser.storage.sync.set({counter});
    }
    if (fromScript === 'content-script') {
      await CONTENT_SCRIPT_PORT.postMessage({type: 'cs-bulk-add-items', items});
    } else {
      await browser.storage.local.set(items);
    }
    console.log(`${fromScript} bulk added items: `, items);
  }

  async function editItem(fromScript, randomKey = null) {
    const allItemsKeys = Object.keys(await browser.storage.local.get());
    if (allItemsKeys.length === 0) {
      console.error('There are no items in extension storage local. To edit an item, please add one or more storage items first.');
      return;
    } else if (!randomKey) {
      // Select a random item to edit
      const randomIndex = Math.floor(Math.random() * allItemsKeys.length);
      randomKey = allItemsKeys[randomIndex];
    }

    // Determine the type of its current value
    const randomItem = await browser.storage.local.get(randomKey);
    const randomValue = randomItem[randomKey];
    const type = typeof randomValue;

    // Set its new value to a value of a different, random type. Changing the type of the value
    // ensures the value actually changes.
    const newTypeRandomIndex = Math.floor(Math.random() * (ACCEPTABLE_TYPES.length - 1));
    const newType = (ACCEPTABLE_TYPES.filter(t => t !== type))[newTypeRandomIndex];
    const newValue = NEW_VALUES_BY_TYPE[newType];

    const item = {[randomKey]: newValue};
    if (fromScript === 'content-script') {
      await CONTENT_SCRIPT_PORT.postMessage({type: 'cs-edit-item', item}); 
    } else {
      await browser.storage.local.set(item);
    }
    console.log(`${fromScript} edited item `, randomItem, "; it is now ", item);
  }

  async function bulkEditItems(fromScript) {
    // Edit the first 10 (or first n if n < 10) items in storage local
    const allItemsKeys = Object.keys(await browser.storage.local.get());
    if (allItemsKeys.length === 0) {
      console.error('There are no items in extension storage local. To edit an item, please add one or more storage items first.');
      return;
    }

    // Take the first n keys in storage for n <= 10
    const keysToEdit = allItemsKeys.slice(0, allItemsKeys.length > 10 ? 10 : allItemsKeys.length);
    for (const key of keysToEdit) {
      editItem(fromScript, key);
    }
  }
  async function removeItem(fromScript, randomKey = null) {
    const allItemsKeys = Object.keys(await browser.storage.local.get());
    if (allItemsKeys.length === 0) {
      console.error('There are no items in extension storage local. To remove an item, please add one or more storage items first.');
      return;
    } else if (!randomKey) {
      // Select a random item to edit
      const randomIndex = Math.floor(Math.random() * allItemsKeys.length);
      randomKey = allItemsKeys[randomIndex];
    }

    const item = await browser.storage.local.get(randomKey);
    if (fromScript === 'content-script') {
      await CONTENT_SCRIPT_PORT.postMessage({type: 'cs-remove-item', item}); 
    } else {
      await browser.storage.local.remove(randomKey);
    }
    console.log(`${fromScript} removed item `, item);
  }

  async function bulkRemoveItems(fromScript) {
    // Remove the first 10 (or first n if n < 10) items in storage local
    const allItemsKeys = Object.keys(await browser.storage.local.get());
    if (allItemsKeys.length === 0) {
      console.error('There are no items in extension storage local. To remove an item, please add one or more storage items first.');
      return;
    }

    // Take the first n keys in storage for n <= 10
    const keysToRemove = allItemsKeys.slice(0, allItemsKeys.length > 10 ? 10 : allItemsKeys.length);
    for (const key of keysToRemove) {
      removeItem(fromScript, key);
    }
  }

  async function removeAllItems(fromScript) {
    // Remove the first 10 (or first n if n < 10) items in storage local
    const allItemsKeys = Object.keys(await browser.storage.local.get());
    if (allItemsKeys.length === 0) {
      console.error('There are no items in extension storage local. To remove an item, please add one or more storage items first.');
      return;
    }
    if (fromScript === 'content-script') {
      await CONTENT_SCRIPT_PORT.postMessage({type: 'cs-remove-all-items'}); 
    } else {
      await browser.storage.local.clear();
    }
    console.log(`${fromScript} removed all items`);
  }

  // Register centralized message handlers
  browser.runtime.onConnect.addListener(handleConnect);
}());
