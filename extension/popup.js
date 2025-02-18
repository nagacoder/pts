document.addEventListener('DOMContentLoaded', function() {
    alert(1)
    const searchBtn = document.getElementById('search');
    const prevBtn = document.getElementById('prevMatch');
    const nextBtn = document.getElementById('nextMatch');
    const matchCountEl = document.getElementById('matchCount');
    
    let currentMatch = 0;
    
    searchBtn.addEventListener('click', () => {
      const conditions = [
        document.getElementById('search1').value,
        document.getElementById('search2').value,
        document.getElementById('search3').value
      ].filter(c => c.trim() !== '');
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'search',
          conditions: conditions
        });
      });
    });
    
    prevBtn.addEventListener('click', () => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'previousMatch'
        });
      });
    });
    
    nextBtn.addEventListener('click', () => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'nextMatch'
        });
      });
    });
    
    // Listen for match updates from content script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'matchUpdate') {
        if (message.total === 0) {
          matchCountEl.textContent = 'No matches';
          prevBtn.disabled = true;
          nextBtn.disabled = true;
        } else {
          matchCountEl.textContent = `Match ${message.current + 1} of ${message.total}`;
          prevBtn.disabled = false;
          nextBtn.disabled = false;
        }
      }
    });
  });