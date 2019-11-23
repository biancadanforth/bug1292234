(async function main() {
  const itemsSupported = {
      arr: [1, 2],
      bool: true,
      null: null,
      num: 4,
      obj: { a: 123 },
      str: "hi",
      // Nested objects or arrays at most 2 levels deep should be editable
      nestedArr: [
        {
          a: "b",
        },
        "c",
      ],
      nestedObj: {
        a: [1, 2],
        b: 3,
      },
    };

    const itemsUnsupported = {
      arrBuffer: new ArrayBuffer(8),
      bigint: BigInt(1),
      blob: new Blob(
        [
          JSON.stringify(
            {
              hello: "world",
            },
            null,
            2
          ),
        ],
        {
          type: "application/json",
        }
      ),
      date: new Date(0),
      map: new Map().set("a", "b"),
      regexp: /regexp/,
      set: new Set().add(1).add("a"),
      undef: undefined,
      // Arrays and object literals with non-JSONifiable values should not be editable
      arrWithMap: [1, new Map().set("a", 1)],
      objWithArrayBuffer: { a: new ArrayBuffer(8) },
      // Nested objects or arrays more than 2 levels deep should not be editable
      deepNestedArr: [[{ a: "b" }, 3], 4],
      deepNestedObj: {
        a: {
          b: [1, 2],
        },
      },
    };

  function handleChange(changes, areaName) {
    if (areaName !== 'local') return;
    console.log("Bug 1573201: change(s) to `storage.local` data received by the extension: ", changes);
  }
  
  browser.storage.onChanged.addListener(handleChange);

  await browser.storage.local.set(itemsSupported);
  await browser.storage.local.set(itemsUnsupported);
}());
