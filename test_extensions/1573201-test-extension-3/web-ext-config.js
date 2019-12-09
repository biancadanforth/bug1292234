module.exports = {
  run: {
    firefox: '/Users/bdanforth/src/mozilla-unified/objdir-frontend-debug-artifact/dist/Nightly.app/Contents/MacOS/firefox',
    pref: [
      'extensions.legacy.enabled=true',
      'xpinstall.signatures.required=false',
      'devtools.aboutdebugging.showHiddenAddons=false',
    ],
    startUrl: [
      'about:debugging#/runtime/this-firefox',
    ],
  },
};