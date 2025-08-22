(function() {
    console.log("Content script injected via Alt+Q!");

  
    chrome.runtime.sendMessage({ action: "getTabs" }, (response) => {
        console.log(response);

        response.sort((a,b)=>{
            return b.lastAccessed - a.lastAccessed;
        });

        console.log(response);

    });   

})();