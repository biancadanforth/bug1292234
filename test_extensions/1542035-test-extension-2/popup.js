(async function main() {
  let {counter} = await browser.storage.sync.get();
  if (counter === undefined) {
    counter = 1;
  }

  const ID_LISTENER_TUPLES = [
    ["ba-add-item", addItem],
    ["ba-bulk-add-items", bulkAddItems],
    ["ba-edit-item", editItem],
    ["ba-bulk-edit-items", bulkEditItems],
    ["ba-remove-item", removeItem],
    ["ba-bulk-remove-items", bulkRemoveItems],
    ["ba-remove-all-items", removeAllItems],
  ];

  for (const [id, listener] of ID_LISTENER_TUPLES) {
    const element = document.getElementById(id);
    element.addEventListener('click', listener);
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

  async function addItem(evt) {
    const item = {[String(counter)]: counter};
    await browser.storage.local.set(item);
    console.log(`browserAction script added item: `, item);
    counter++;
    await browser.storage.sync.set({counter});
  }

  async function bulkAddItems(evt) {
    const items = {};
    for (let i = 1; i <= 10; i++) {
      const item = {};
      items[counter] = counter;
      counter++;
      await browser.storage.sync.set({counter});
    }
    await browser.storage.local.set(items);
    console.log(`browserAction script bulk added items: `, items);
  }

  async function editItem(evt, randomKey = null) {
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
    await browser.storage.local.set(item);
    console.log(`browserAction script edited item `, randomItem, "; it is now ", item);
  }

  async function bulkEditItems(evt) {
    // Edit the first 10 (or first n if n < 10) items in storage local
    const allItemsKeys = Object.keys(await browser.storage.local.get());
    if (allItemsKeys.length === 0) {
      console.error('There are no items in extension storage local. To edit an item, please add one or more storage items first.');
      return;
    }

    // Take the first n keys in storage for n <= 10
    const keysToEdit = allItemsKeys.slice(0, allItemsKeys.length > 10 ? 10 : allItemsKeys.length);
    for (const key of keysToEdit) {
      editItem(null, key);
    }
  }
  async function removeItem(evt, randomKey = null) {
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
    await browser.storage.local.remove(randomKey);
    console.log(`browserAction script removed item `, item);
  }

  async function bulkRemoveItems(evt) {
    // Remove the first 10 (or first n if n < 10) items in storage local
    const allItemsKeys = Object.keys(await browser.storage.local.get());
    if (allItemsKeys.length === 0) {
      console.error('There are no items in extension storage local. To remove an item, please add one or more storage items first.');
      return;
    }

    // Take the first n keys in storage for n <= 10
    const keysToRemove = allItemsKeys.slice(0, allItemsKeys.length > 10 ? 10 : allItemsKeys.length);
    for (const key of keysToRemove) {
      removeItem(null, key);
    }
  }

  async function removeAllItems(evt) {
    // Remove the first 10 (or first n if n < 10) items in storage local
    const allItemsKeys = Object.keys(await browser.storage.local.get());
    if (allItemsKeys.length === 0) {
      console.error('There are no items in extension storage local. To remove an item, please add one or more storage items first.');
      return;
    }
    await browser.storage.local.clear();
    console.log(`browserAction script removed all items`);
  }
})();
