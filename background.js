try {
  if (typeof importScripts === 'function') {
    importScripts('libs/browser-polyfill.js');
  }
} catch (_) {
}

browser.action.onClicked.addListener(() => {
  browser.tabs.create({ url: browser.runtime.getURL('converter.html') });
});
