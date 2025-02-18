chrome.action.onClicked.addListener(async (tab) => {
    try {
      // Inject the content script code directly
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: initializeInterface
      });
    } catch (err) {
      console.error('Failed to execute script:', err);
    }
  });
  
  function initializeInterface() {
    // Check if interface already exists
    if (document.querySelector('.log-finder-container')) {
      return;
    }
    
    // Create and add the interface
    const container = document.createElement('div');
    container.className = 'log-finder-container';
    container.innerHTML = `
      <div class="log-finder-header">
        <span class="log-finder-title">Log Finder</span>
        <div class="log-finder-controls">
          <span class="log-finder-control" id="minimizeButton">−</span>
          <span class="log-finder-control" id="closeButton">×</span>
        </div>
      </div>
      <div class="log-finder-content">
        <input type="text" class="log-finder-input" id="search1" placeholder="e.g., trace_id=abc123">
        <input type="text" class="log-finder-input" id="search2" placeholder="e.g., req.body.customerId=cust_12345">
        <input type="text" class="log-finder-input" id="search3" placeholder="e.g., res.status=201">
        <div class="log-finder-help">
          Search Examples:
          <br>• req.body.items.productId=prod_789
          <br>• req.headers.x-request-id=req_98765
        </div>
        <div class="log-finder-matches" id="matchCount">
          No matches
        </div>
        <div class="log-finder-buttons">
          <button class="log-finder-button" id="prevMatch" disabled>◀ Prev</button>
          <button class="log-finder-button" id="searchButton">🔍 Search</button>
          <button class="log-finder-button" id="nextMatch" disabled>Next ▶</button>
        </div>
      </div>
    `;
  
    document.body.appendChild(container);
  
    // Initialize dragging functionality
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
  
    const header = container.querySelector('.log-finder-header');
  
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
  
    function dragStart(e) {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
  
      if (e.target === header) {
        isDragging = true;
      }
    }
  
    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
  
        xOffset = currentX;
        yOffset = currentY;
  
        setTranslate(currentX, currentY, container);
      }
    }
  
    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    }
  
    function setTranslate(xPos, yPos, el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
  
    // Add event listeners
    const minimizeButton = container.querySelector('#minimizeButton');
    const closeButton = container.querySelector('#closeButton');
    const searchButton = container.querySelector('#searchButton');
    const prevButton = container.querySelector('#prevMatch');
    const nextButton = container.querySelector('#nextMatch');
  
    minimizeButton.addEventListener('click', () => {
      container.classList.toggle('log-finder-minimized');
      minimizeButton.textContent = container.classList.contains('log-finder-minimized') ? '+' : '−';
    });
  
    closeButton.addEventListener('click', () => {
      container.remove();
    });
  
    searchButton.addEventListener('click', () => {
      const conditions = [
        document.getElementById('search1').value,
        document.getElementById('search2').value,
        document.getElementById('search3').value
      ].filter(c => c.trim() !== '');
      
      // Call the search function from content.js
      window.postMessage({ type: 'LOG_SEARCH', conditions }, '*');
    });
  
    prevButton.addEventListener('click', () => {
      window.postMessage({ type: 'LOG_PREV_MATCH' }, '*');
    });
  
    nextButton.addEventListener('click', () => {
      window.postMessage({ type: 'LOG_NEXT_MATCH' }, '*');
    });
  }