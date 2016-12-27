## WHMCS Notifier for Google Chrome

### Introduction
This is an unofficial Google Chrome extension for [WHMCS](https://www.whmcs.com). The purpose of this extension is to indicate when you have pending tickets or orders which need attention. The extension polls your admin URL once per minute, additionally keeping in sync each time you navigate within the admin area. You are then alerted to pending tickets/orders in two ways:

* An icon with badge indicating the current total pending count.
* Notifications triggered when the count increases.

![Screenshot](https://i.imgur.com/ybrqALT.jpg)

### Installation
You can install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/whmcs-notifier/hodfnepodddflpcilaccjbgfnkbgffjc). If you to prefer to install from source, just download the source, visit `chrome://extensions` and use the "Load unpacked extension..." option to let Chrome know which directory the source lives in.

Following installation you'll need to access the extension's options page and configure your WHMCS admin URL.

### Usage

There's not much to explain, the extension does what it says on the tin!

You can click on the extension's notifications to open a new tab on the appropriate WHMCS page (either pending orders or pending tickets). You can also click on the icon in your browser window to highlight the existing WHMCS tab or open a new one. To avoid loss of any unsubmitted form data, the extension will never reload existing tabs.

### Permissions
Installing this extension will prompt you to allow the extension to "Read and change all your data on the websites you visit". The extension cannot request access to specific URL's at runtime (following configuration of your admin URL), as such access to all URL's must be requested at installation time.

### Disclaimer
This was created for my own personal needs as a quick weekend project. The source code isn't perfect and shortcuts may have been made in places.

The extension does not use the WHMCS external API, so you're expected to be using the default admin theme ("blend") for the correct values to be read from HTML.

### Changelog

##### 2016-01-17 1.0.0
First version released, Hello World!

##### 2016-01-18 1.0.1
Fixed a syncing issue when visiting `whmcsconnect.php`.

##### 2016-02-11 1.0.2
Remove unnecessary code from notifications. Hopefully this update fixes the repeat notification issue, however I'm struggling to reproduce this problem accurately.

##### 2016-02-18 1.0.3
Fixed repeat notification issue. This was caused by the background page being killed while inactive, destroying the state each time. The last known notification counts are now stored in chrome.storage for persistence.

##### 2016-12-27 1.1.0
New option to disable notifications.
