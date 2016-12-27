var resultEl = document.getElementById('result');
var whmcsUrlInput = document.getElementById('whmcs_url_input');
var monitorOrdersInput = document.getElementById('monitor_orders_input');
var monitorTicketsInput = document.getElementById('monitor_tickets_input');
var showNotificationsInput = document.getElementById('show_notifications_input');

document.querySelector('button').addEventListener('click', ev => {
  // Get the admin URL in the format we want it, quick and messy.
  var whmcsUrl = whmcsUrlInput.value;
  var whmcsUrlIndexPosition = whmcsUrl.indexOf('index.php');
  var adminUrl = whmcsUrl.substr(0, whmcsUrlIndexPosition == -1 ? whmcsUrl.length : whmcsUrlIndexPosition);
  adminUrl += adminUrl.substr(-1) == '/' ? '' : '/';
  whmcsUrlInput.value = adminUrl;

  chrome.storage.sync.set({
    whmcsUrl: adminUrl,
    monitorOrders: monitorOrdersInput.checked,
    monitorTickets: monitorTicketsInput.checked,
    showNotifications: showNotificationsInput.checked
  }, () => {
    resultEl.style.display = 'block';
    setTimeout(() => {
      resultEl.style.display = 'none';
    }, 2000);
  });
});

document.addEventListener('DOMContentLoaded', ev => {
  chrome.storage.sync.get({
    whmcsUrl: '',
    monitorOrders: true,
    monitorTickets: true,
    showNotifications: true
  }, items => {
    whmcsUrlInput.value = items.whmcsUrl;
    monitorOrdersInput.checked = items.monitorOrders;
    monitorTicketsInput.checked = items.monitorTickets;
    showNotificationsInput.checked = items.showNotifications;
  });
});
