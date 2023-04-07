/* global browser */

let enabled = true;

browser.downloads.onCreated.addListener(async (item) => {
  if (item.filename.includes(".exe")) {
    try {
      // first we try to cancel the download
      await browser.downloads.cancel(item.id);

      browser.notifications.create("" + Date.now(), {
        type: "basic",
        iconUrl: browser.runtime.getURL("warn.png"),
        title: "Download Canceled",
        message:
          "The download was canceled because its filename contained the suspicious substring '.exe'",
      });
    } catch (e) {
      console.error(e);
      // if that fails ... we have to assume the file was downloaded ... so we try to remove it
      try {
        await browser.downloads.removeFile(item.id);

        browser.notifications.create("" + Date.now(), {
          priority: 2,
          type: "basic",
          iconUrl: browser.runtime.getURL("warn.png"),
          title: "File Removed",
          message:
            "The download file was removed because its filename contained the suspicious substring '.exe'",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
  enabled = true;
  browser.browserAction.setBadgeText({ text: "ON" });
  browser.browserAction.setBadgeBackgroundColor({ color: "green" });
});

browser.browserAction.onClicked.addListener(() => {
  if (enabled) {
    enabled = false;
    browser.browserAction.setBadgeText({ text: "OFF" });
    browser.browserAction.setBadgeBackgroundColor({ color: "red" });
  } else {
    enabled = true;
    browser.browserAction.setBadgeText({ text: "ON" });
    browser.browserAction.setBadgeBackgroundColor({ color: "green" });
  }
});

browser.browserAction.setBadgeText({ text: "ON" });
browser.browserAction.setBadgeBackgroundColor({ color: "green" });
