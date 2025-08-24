(function() {


  // states
  let rows = [];
  let currentIndex = -1;
  let isAltPressed = true;

  // General Functions

  const getTabs = () => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({action: "getTabs"}, (res) => {
        resolve(res);
      })
    })
  }

  function HoverRow(rowElement) {
    rowElement.style.backgroundColor = "rgba(59, 169, 255, 0.15)";
    rowElement.style.color = "#ffffff";
    rowElement.style.transform = "translateX(4px)";
  }

  function LeaveRow(rowElement) {
    rowElement.style.backgroundColor = "transparent";
    rowElement.style.color = "#e0e0e0";
    rowElement.style.transform = "translateX(0)";
  }

  function moveRing(index) {
    if (index < 0 || index >= rows.length) return;
    currentIndex = index;
    ring.style.display = "block";
    ring.style.top = rows[index].row.offsetTop + "px";

    for(let i = 0 ; i < rows.length ; ++i) {
      LeaveRow(rows[i].row);
    }

    HoverRow(rows[index].row);
  
    rows[index].row.scrollIntoView({
      behavior: "smooth",
      block: "nearest"  // to prevent full scrolling when the row is out of sight
    });

  }

  function cleanup() {
    
    overlay.removeEventListener('click' , handleClickOut,true);
    window.removeEventListener('blur' , handleClean);
    document.removeEventListener('keydown', handleMove,true);
    document.removeEventListener('keyup', handleKeyUp);
    chrome.runtime.onMessage.removeListener(handleMessage);

    if (overlay && overlay.parentNode) {
      overlay.style.opacity = "0";
      setTimeout(() => {
          if (overlay.parentNode) {
            overlay.remove();
          }
        }, 200);
    }
  }

  // styling
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "999999";
  overlay.style.background = "rgba(0, 0, 0, 0.65)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.backdropFilter = "blur(1px)";
  document.body.appendChild(overlay);

  const box = document.createElement("div");
  box.style.backgroundColor = "#1e1e2f"; 
  box.style.color = "#f5f5f5";          
  box.style.padding = "20px";
  box.style.borderRadius = "14px";
  box.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
  box.style.minWidth = "360px";
  box.style.maxWidth = "640px";
  box.style.maxHeight = "480px";
  box.style.overflowY = "auto";
  box.style.fontFamily = "Segoe UI, system-ui, sans-serif";
  box.style.border = "1px solid rgba(255,255,255,0.08)";
  overlay.appendChild(box);

  const ring = document.createElement("div");
  ring.style.position = "absolute";
  ring.style.height = "43px";
  ring.style.background = "rgba(0, 120, 215, 0.2)";
  ring.style.border = "2px solid #3ba9ff";
  ring.style.borderRadius = "8px";
  ring.style.transition = "top 0.15s";
  ring.style.display = "none";
  box.style.position = "relative"; 
  box.appendChild(ring);

  // script
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
      row.style.padding = "10px 14px";
      row.style.borderBottom = "1px solid rgba(255,255,255,0.08)";
      row.style.fontSize = "15px";
      row.style.cursor = "pointer";
      row.style.whiteSpace = "nowrap";
      row.style.overflow = "hidden";
      row.style.textOverflow = "ellipsis";
      row.style.color = "#e0e0e0";
      row.style.transition = "background 0.25s, color 0.25s, transform 0.1s";

      row.addEventListener("mouseenter", () => {
        row.style.backgroundColor = "rgba(59, 169, 255, 0.15)";
        row.style.color = "#ffffff";
        row.style.transform = "translateX(4px)";
      });
      row.addEventListener("mouseleave", () => {
        row.style.backgroundColor = "transparent";
        row.style.color = "#e0e0e0";
        row.style.transform = "translateX(0)";
      });

      row.addEventListener("click", () => {
        moveRing(i);
        chrome.runtime.sendMessage({ action: "activateTab", id: tab.id });
        cleanup();
      });

      box.appendChild(row);

      rows.push({ row, tab });

    });



    chrome.runtime.onMessage.addListener(handleMessage);
    document.addEventListener("keydown",handleMove,true); // to prevent controlling the active web page
    document.addEventListener('keyup', handleKeyUp);
    overlay.addEventListener('click', handleClickOut,true);
    window.addEventListener('blur',handleClean);
    
  });


  // handleEvents

  function handleMessage(msg, sender, sendResponse) {
    if (msg === "is_open_content") {
      sendResponse({ is_open: true });
    }

    if(msg === "moveQ") {
      moveRing((currentIndex + 1) % rows.length);
    }
  }

  const handleMove =  (e) => {
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
  };

  function handleClickOut(e) {
    cleanup();
  }

  function handleKeyUp(e) {
    if (e.key === 'Alt' || !e.altKey) {
      isAltPressed = false;
      if (!isAltPressed) cleanup();
    }
  }

  function handleClean() {
    cleanup();
  }

})();




