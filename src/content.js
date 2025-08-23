(function() {

  const getTabs = () => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({action: "getTabs"}, (res) => {
        resolve(res);
      })
    })
  }

  function handleMessage(msg, sender, sendResponse) {
    if (msg === "is_open_content") {
      sendResponse({ is_open: true });
    }
  }

  chrome.runtime.onMessage.addListener(handleMessage);

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "999999";
  overlay.style.background = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  document.body.appendChild(overlay);

  const box = document.createElement("div");
  box.style.backgroundColor = "#fff";
  box.style.padding = "16px 20px";
  box.style.borderRadius = "12px";
  box.style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
  box.style.minWidth = "320px";
  box.style.maxWidth = "600px";
  box.style.maxHeight = "400px";
  box.style.overflowY = "auto";
  box.style.fontFamily = "system-ui, sans-serif";
  overlay.appendChild(box);

  const ring = document.createElement("div");
  ring.style.position = "absolute";
  ring.style.left = "0";
  ring.style.right = "0";
  ring.style.height = "32px";
  ring.style.background = "rgba(0,120,215,0.15)";
  ring.style.border = "2px solid #0078d7";
  ring.style.borderRadius = "6px";
  ring.style.pointerEvents = "none";
  ring.style.transition = "top 0.15s";
  ring.style.display = "none";
  box.style.position = "relative"; 
  box.appendChild(ring);

  function moveRing(index) {
    if (index < 0 || index >= rows.length) return;
    currentIndex = index;
    ring.style.display = "block";
    ring.style.top = rows[index].row.offsetTop + "px";
  }

  let rows = [];
  let currentIndex = -1;

  getTabs().then(tabs => {
    if (!tabs || !tabs.length) {
      box.innerText = "No tabs found.";
      return; 
    }

    tabs.sort((a,b) => {
      return b.lastAccessed - a.lastAccessed;
    })

    tabs.forEach((tab,i) => {
      const row = document.createElement("div");
      row.innerText = tab.title || "(no title)";
      row.style.padding = "8px 10px";
      row.style.borderBottom = "1px solid #eee";
      row.style.fontSize = "14px";
      row.style.cursor = "pointer";
      row.style.whiteSpace = "nowrap";
      row.style.overflow = "hidden";
      row.style.textOverflow = "ellipsis";

      row.addEventListener("mouseenter", () => {
        row.style.backgroundColor = "#f5f5f5";
      });
      row.addEventListener("mouseleave", () => {
        row.style.backgroundColor = "transparent";
      });

      row.addEventListener("click", () => {
        moveRing(i);
        chrome.runtime.sendMessage({ action: "activateTab", id: tab.id });
        cleanup();
      });

      box.appendChild(row);

      rows.push({ row, tab });

    });
    
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveRing((currentIndex + 1) % rows.length); // % to make it wrapped
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveRing((currentIndex - 1 + rows.length) % rows.length); 
    }
    if (e.key === "Enter" && currentIndex >= 0) {
      chrome.runtime.sendMessage({ action: "activateTab", id: rows[currentIndex].tab.id });
      cleanup();
    }
  },true); // to prevent controlling the active web page
  
  document.addEventListener('keyup', handleKeyUp);

  let isAltPressed = true;

  function cleanup() {
    if (overlay && overlay.parentNode) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 200);
    }

    document.removeEventListener('keyup', handleKeyUp);
    chrome.runtime.onMessage.removeListener(handleMessage);
  }

  function handleKeyUp(e) {
    if (e.key === 'Alt' || !e.altKey) {
      isAltPressed = false;
      if (!isAltPressed) cleanup();
    }
  }

})();




