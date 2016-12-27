(function() {
  'use strict';

  var CONFIG = {};
  var LAST_COUNTS;

  function buildConfig() {
    return new Promise((resolve, reject) => {
      var keys = ['whmcsUrl', 'monitorOrders', 'monitorTickets'];

      // Populate the initial config object.
      chrome.storage.sync.get(keys, items => {
        Object.assign(CONFIG, items);
        resolve(CONFIG);
      });

      // Listen for future config changes, updating the config object and
      // polling WHMCS again with the fresh settings.
      chrome.storage.onChanged.addListener(changes => {
        var updated = false;

        Object.keys(changes).forEach(key => {
          if (keys.indexOf(key) >= 0) {
            updated = true;
            CONFIG[key] = changes[key].newValue;
          }
        });

        if (updated) {
          pollWHMCS();
        }
      });
    });
  }

  function buildLastCounts() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('lastCounts', items => {
        LAST_COUNTS = items.lastCounts || {orders: 0, tickets: 0};
        resolve(LAST_COUNTS);
      });
    });
  }

  function handleFreshCounts(counts) {
    if (counts == null || (!CONFIG.monitorOrders && !CONFIG.monitorTickets)) {
      setBrowserActionStatus(null);
      updateNotification('orders', 0);
      updateNotification('tickets', 0);
      counts = {orders: 0, tickets: 0};
    } else {
      var total = 0;

      if (CONFIG.monitorOrders && counts.orders) {
        total += counts.orders;
      }

      if (CONFIG.monitorTickets && counts.tickets) {
        total += counts.tickets;
      }

      setBrowserActionStatus(total);
      updateNotification('orders', counts.orders);
      updateNotification('tickets', counts.tickets);
    }

    LAST_COUNTS = counts;

    chrome.storage.local.set({lastCounts: LAST_COUNTS});
  }

  function updateNotification(type, count) {
    var id = 'monitor-' + type;
    var previousCount = LAST_COUNTS[type];

    if (!count) {
      chrome.notifications.clear(id);
    } else if (count > previousCount) {
      var details = {};
      details.type = 'basic';
      details.iconUrl = 'icons/notification.png';
      details.title = 'Pending ' + type[0].toUpperCase() + type.substr(1);
      details.message = 'You have ' + count + ' pending ' + (count == 1 ? type.substr(0, type.length - 1) : type) + '.';
      details.contextMessage = 'WHMCS Notifier';
      details.isClickable = true;

      chrome.notifications.create(id, details);
    }
  }

  function setBrowserActionStatus(count) {
    if (count === null) {
      chrome.browserAction.setBadgeText({text: '?'});
      chrome.browserAction.setBadgeBackgroundColor({color: '#AAAAAA'});
      chrome.browserAction.setIcon({path: {
        '19': 'icons/browser_disabled@1x.png',
        '38': 'icons/browser_disabled@2x.png'
      }});
    } else {
      chrome.browserAction.setBadgeText({text: '' + (count || '')});
      chrome.browserAction.setBadgeBackgroundColor({color: '#FF0000'});
      chrome.browserAction.setIcon({path: {
        '19': 'icons/browser_standard@1x.png',
        '38': 'icons/browser_standard@2x.png'
      }});
    }
  }

  function pollWHMCS() {
    if (!CONFIG.whmcsUrl) {
      console.debug('Polling aborted, no WHMCS URL configured.');
      handleFreshCounts(null);
      return;
    } else if (!CONFIG.monitorOrders && !CONFIG.monitorTickets) {
      console.debug('Polling aborted, no monitors enabled.');
      handleFreshCounts(null);
      return;
    }

    fetch(CONFIG.whmcsUrl, {
      credentials: 'include'
    }).then(response => {
      if (response.status !== 200) {
        throw new Error('The response code must be 200.');
      }

      return response.text();
    }).then(html => {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var statsEl = doc.querySelector('div.header div.stats');

      if (!statsEl) {
        throw new Error('Failed to parse the stats element.');
      }

      var statEls = statsEl.querySelectorAll('span.stat');
      var data = {};
      data.orders = parseInt(statEls[0].innerText, 10);
      data.tickets = parseInt(statEls[2].innerText, 10);
      handleFreshCounts(data);
    }).catch(error => {
      handleFreshCounts(null);
      console.warn('Polling failed.', error);
    });
  }

  function handleTabReload(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.url && CONFIG.whmcsUrl && tab.url.indexOf(CONFIG.whmcsUrl) === 0) {
      var page = tab.url.substr(CONFIG.whmcsUrl.length);
      var excludedPages = ['whmcsconnect.php'];

      if (excludedPages.indexOf(page) == -1) {
        chrome.tabs.executeScript(tab.id, {
          file: 'content.js'
        });
      }
    }
  }

  function highlightWHMCSTab() {
    if (!CONFIG.whmcsUrl) {
      return;
    }

    chrome.tabs.query({
      url: CONFIG.whmcsUrl + '*'
    }, tabs => {
      if (tabs.length) {
        chrome.tabs.highlight({
          tabs: tabs.map(tab => tab.index)
        });
      } else {
        chrome.tabs.create({
          url: CONFIG.whmcsUrl
        });
      }
    });
  }

  function handleNotificationClick(notificationId) {
    switch (notificationId) {
      case 'monitor-orders':
        var pageUrl = 'orders.php?status=Pending';
        break;
      case 'monitor-tickets':
        var pageUrl = 'supporttickets.php';
        break;
      default:
        return;
    }

    chrome.tabs.create({url:CONFIG.whmcsUrl + pageUrl});
    chrome.notifications.clear(notificationId);
  }

  buildConfig().then(buildLastCounts).then(() => {
    chrome.alarms.create('poll', {periodInMinutes: 1});
    chrome.alarms.onAlarm.addListener(pollWHMCS);
    chrome.tabs.onUpdated.addListener(handleTabReload);
    chrome.browserAction.onClicked.addListener(highlightWHMCSTab);
    chrome.notifications.onClicked.addListener(handleNotificationClick);

    chrome.runtime.onMessage.addListener(message => {
      if (message.type == 'counts') {
        handleFreshCounts(message.data);
      }
    });

    pollWHMCS();
  });
})();
