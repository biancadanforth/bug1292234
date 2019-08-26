module.exports = {
  run: {
    // Points to my local artifact development build of Firefox
    firefox: '/Users/bdanforth/src/mozilla-unified/objdir-frontend-debug-artifact/dist/Nightly.app/Contents/MacOS/firefox',
    startUrl: [
      'about:debugging#/runtime/this-firefox',
    ],
    pref: [
      'devtools.storage.extensionStorage.enabled=true',
    ],
  },
};
