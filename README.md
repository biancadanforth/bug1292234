# bug_1542035_and_1573201

### Overview

Mercurial patch for fixing [Bug 1542035](https://bugzilla.mozilla.org/show_bug.cgi?id=1542035) in Firefox and some supporting files for [Bug 1573201](https://bugzilla.mozilla.org/show_bug.cgi?id=1573201).

This work initially started as a [gist](https://gist.github.com/biancadanforth/fb6aaae07084512a594a8098c971807e) targeting the [meta bug 1292234](https://bugzilla.mozilla.org/show_bug.cgi?id=1542035), but as this work is adding new functionality to a Firefox feature, it is complicated enough to benefit from using issue tracking and the like.


### How to test
1. `hg import` the patch into the `mozilla-central` hg repo.
2. Run tests:
```bash
./mach test devtools/client/storage/test/ devtools/server/tests/browser/browser_storage_* toolkit/components/extensions/test/xpcshell/test_ext_storage* devtools/server/tests/unit/test_extension_storage_actor.js
```
This will run:
   * Existing client tests (tests for the storage panel itself): `./mach mochitest devtools/client/storage/test/`
      *  This will also run our new `"extensionStorage"` client mochitest at `devtools/client/storage/test/browser_storage_webext_storage_local.js`
   * Existing server tests (tests for the storage actors): `./mach mochitest devtools/server/tests/browser/browser_storage_*`
      * This will also run our new `"extensionStorage"` server mochitest at `devtools/server/tests/browser/browser_storage_webext_storage_local.js`
   * Existing WE storage API xpcshell tests: `./mach xpcshell-test toolkit/components/extensions/test/xpcshell/test_ext_storage*`
   * Our new `"extensionStorage"` actor xpcshell test: `./mach test devtools/server/tests/unit/test_extension_storage_actor.js`
    * We also want to `./mach eslint path/to/file` for all modified and new files.

Note: When running these tests locally using the combined command above, some tests are skipped (1 for mochitest and 9 for xpcshell). The skipped mochitest is `browser_storage_cookies_samesite.js` which is currently [always skipped](https://searchfox.org/mozilla-central/source/devtools/client/storage/test/browser.ini#47). The skipped xpcshell tests come from the fact that the WE storage API tests are run twice, once for single-process mode and once for OOP (out of process) mode. Since my machine is a Desktop OSX, the single-process mode pass is skipped.
