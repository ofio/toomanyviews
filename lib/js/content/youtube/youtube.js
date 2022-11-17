; (function () {
  var searchForm = document.querySelector("#search-form");
  var searchFormInput;
  if (searchForm) searchFormInput = searchForm.querySelector("#search");
  var targetNode = null;
  var observingTargetNode = false;
  var minViewCount = -1
  var maxViewCount = -1
  chrome.storage.sync.get(['minViewCount'], function(result) {
    minViewCount = result.minViewCount
    console.log('Value currently is ' + result.minViewCount);
  });
  chrome.storage.sync.get(['maxViewCount'], function(result) {
    maxViewCount = result.maxViewCount
    console.log('Value currently is ' + result.maxViewCount);
  });

  if (searchForm) {
    searchForm.addEventListener("submit", function () {
      waitForVideoResults();
    }, false);
  }
  if (searchFormInput) {
    searchFormInput.addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        waitForVideoResults();
      }
    });
  }

  chrome.runtime.onMessage.addListener(function (request) {
    if (request.type === SEND_SUCCESS && request.hasOwnProperty('msg')) {
      alert(request.msg);
    } else {
      getChannels(function() {
        waitForVideoResults();
      });
    }
    return true;
  });

  function waitForVideoResults() {
    var resultVideochannelLinks = document.querySelectorAll("ytd-video-renderer ytd-video-meta-block span.inline-metadata-item")

    for (var i = 0; i < resultVideochannelLinks.length; i++) {
      var n = resultVideochannelLinks[i];
      var value = -1
      var metadata = n.getInnerHTML();
      var deleteParent = false;
      if (metadata && metadata.includes("views")){
        if (metadata.includes("M") || metadata.includes("B") || metadata.includes("T")) {
          deleteParent = true
        }else if (metadata.includes("K")){
          if (metadata.includes(".")) {
            value = parseInt(metadata.split(".")[0]);
          }else{
            value = parseInt(metadata.match(/\d+/)[0]);
          }
        }else{
          var numMatch = metadata.match(/\d+/)
          if (numMatch){
            //this case should only be if view count is under 1000
            value = 0
          }else{
            //assume No views and no number
            value = 0
          }
        }  
        if (value > -1 && (value < minViewCount || value > maxViewCount)){
          deleteParent = true
        }
        if (deleteParent) {
          var parent = n.closest("ytd-video-renderer, ytd-compact-video-renderer");
          var videoName = parent.querySelector("ytd-channel-name, yt-formatted-string").getInnerHTML();
          if (parent) parent.remove();
          console.log("removed - " +videoName+" - "+metadata);
        }
      }
    }
  };

  var observeDOM = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    return function (obj, callback) {
      if (!obj || !obj.nodeType === 1) return;

      if (MutationObserver) {
        var obs = new MutationObserver(function (mutations) {
          var videoBlocks = mutations.find(function (m) {
            return m.type === 'childList' && (m.target.id === 'contents');
          });
          callback(videoBlocks);
        });
        obs.observe(obj, { childList: true, subtree: true });
      }
      else if (window.addEventListener) {
        obj.addEventListener('DOMNodeInserted', callback, false);
        obj.addEventListener('DOMNodeRemoved', callback, false);
      }
    }
  })();

  var interval;
  interval = setInterval(function () {

    targetNode = document.querySelectorAll('ytd-search.style-scope.ytd-page-manager');
    if (targetNode && !observingTargetNode) {
      observingTargetNode = true;

      for (var i = 0; i < targetNode.length; i++) {
        var tn = targetNode[i];
        observeDOM(tn, function (m) {
          waitForVideoResults();
        });
      }
    }
  }, 100);

  //Clear after 10sec.
  setTimeout(function () {
    clearInterval(interval);
  }, 10000);
})();