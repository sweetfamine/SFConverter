import browser from "./libs/browser-polyfill.js";

browser.action.onClicked.addListener(() => {
  browser.tabs.create({ url: browser.runtime.getURL("converter.html") });
});