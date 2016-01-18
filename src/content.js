var statsEl = document.querySelector('div.header div.stats');

if (!statsEl) {
  var data = null;
} else {
  var statEls = statsEl.querySelectorAll('span.stat');
  var data = {};
  data.orders = parseInt(statEls[0].innerText, 10);
  data.tickets = parseInt(statEls[2].innerText, 10);
}

chrome.runtime.sendMessage({
  type: 'counts',
  data: data
});
