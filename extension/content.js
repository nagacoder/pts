
let matches = [];
let currentMatchIndex = -1;

function wrapLinesInSpan() {
  const preElement = document.querySelector('pre');
  console.log(preElement)
  if (!preElement || preElement.querySelector('.log-line')) return;

  const lines = preElement.textContent.split('\n');
  preElement.innerHTML = lines
    .map(line => `<span class="log-line">${line}</span>`)
    .join('\n');
}

function findMatches(conditions) {
  wrapLinesInSpan();

  // Reset previous highlights
  document.querySelectorAll('.log-highlight').forEach(el => {
    el.classList.remove('log-highlight', 'log-current');
  });
  
  matches = [];
  currentMatchIndex = -1;
  
  // Get all log lines
  const logLines = Array.from(document.querySelectorAll('.log-line'));
  
  // Find matches that satisfy all conditions
  matches = logLines.filter(line => {
    const text = line.textContent.toLowerCase();
    return conditions.every(condition => 
      text.includes(condition.toLowerCase())
    );
  });
  
  // Highlight all matches
  matches.forEach(match => {
    match.classList.add('log-highlight');
  });
  
  // Update match count
  updateMatchInfo();
  
  // Go to first match if exists
  if (matches.length > 0) {
    goToMatch(0);
  }
}

function updateMatchInfo() {
    const matchCountEl = document.getElementById('matchCount');
    const prevButton = document.getElementById('prevMatch');
    const nextButton = document.getElementById('nextMatch');
  
    if (!matchCountEl || !prevButton || !nextButton) return;
  
    if (matches.length === 0) {
      matchCountEl.textContent = 'No matches';
      prevButton.disabled = true;
      nextButton.disabled = true;
    } else {
      matchCountEl.textContent = `Match ${currentMatchIndex + 1} of ${matches.length}`;
      prevButton.disabled = false;
      nextButton.disabled = false;
    }
  }

function goToMatch(index) {
  // Remove current highlight
  if (currentMatchIndex >= 0 && matches[currentMatchIndex]) {
    matches[currentMatchIndex].classList.remove('log-current');
  }
  
  currentMatchIndex = index;
  
  // Add new current highlight
  if (matches[currentMatchIndex]) {
    matches[currentMatchIndex].classList.add('log-current');
    matches[currentMatchIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
  
  updateMatchInfo();
}

function nextMatch() {
  if (matches.length === 0) return;
  const nextIndex = (currentMatchIndex + 1) % matches.length;
  goToMatch(nextIndex);
}

function previousMatch() {
  if (matches.length === 0) return;
  const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
  goToMatch(prevIndex);
}

// Initialize when the page loads
// document.addEventListener('DOMContentLoaded', wrapLinesInSpan);

// Listen for messages from the injected UI
window.addEventListener('message', (event) => {
    if (event.data.type === 'LOG_SEARCH') {
      findMatches(event.data.conditions);
    } else if (event.data.type === 'LOG_PREV_MATCH') {
      previousMatch();
    } else if (event.data.type === 'LOG_NEXT_MATCH') {
      nextMatch();
    }
  });


