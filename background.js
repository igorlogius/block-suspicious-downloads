/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

let enabled = true;

function getSuspiciousSubstrings(str) {
  str = str.toLowerCase();
  return [
    "exe",
    "wmi",
    "dll",
    "sfx",
    "sea",
    "scr",
    "bat",
    "bin",
    "cmd",
    "com",
    "cpl",
    "csh",
    "ex_",
    "gadget",
    "inf",
    "ins",
    "ipa",
    "isu",
    "job",
    "jse",
    "lnk",
    "msc",
    "msi",
    "msp",
    "mst",
    "paf",
    "pif",
    "ps1",
    "reg",
    "rgs",
    "vb",
    "vbe",
    "vbs",
    "vbscript",
    "ws",
    "wsf",
    "wsh",
  ].filter((ext) => str.includes("." + ext));
}

browser.downloads.onCreated.addListener(async (item) => {
  if (!enabled) {
    return;
  }
  const matches = getSuspiciousSubstrings(item.filename);

  if (matches.length > 0) {
    try {
      // first we try to cancel the download
      await browser.downloads.cancel(item.id);

      browser.notifications.create("" + Date.now(), {
        type: "basic",
        iconUrl: browser.runtime.getURL("warn.png"),
        title: extname,
        message:
          "Canceled a suspicious download!" +
          "\r\nReason for suspicion: Filename contained [" +
          matches.join(",") +
          "]",
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
          title: extname,
          message:
            "Removed a suspicious downloaded file!" +
            "\r\nReason for suspicion: Filename contained [" +
            matches.join(",") +
            "]",
        });
      } catch (e) {
        console.error(e);
        // now if that did not work ... lets at least try and warn the user with a notification
        browser.notifications.create("" + Date.now(), {
          priority: 2,
          type: "basic",
          iconUrl: browser.runtime.getURL("error.png"),
          title: extname,
          message:
            "Failed to cancel and remove a suspicious downloaded file!" +
            "\r\nReason for suspicion: Filename contained [" +
            matches.join(",") +
            "]",
        });
      }
    }
  }
  // renenable after 3 minutes
  setTimeout(() => {
    enabled = true;
    browser.browserAction.setBadgeText({ text: "ON" });
    browser.browserAction.setBadgeBackgroundColor({ color: "green" });
  }, 3 * 60 * 1000);
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
