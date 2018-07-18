/**
   Title: Pinpointer
   Version: 1.0
   Author: Ben Goldsworthy <me@bengoldsworthy.net>

   This file is a part of Pinpointer, a browser extension that allows you to 
   create and share links to arbitrary content on a webpage.

   This script provides the logic of the extension popup menu.
*/

/**
 * Listens for clicks within the pop-up. These will be to either grab a selected
 * element's CSS selector, to change the selected element or to generate the
 * URL.
 */
function listenForClicks() {
   var maxIndex = 0;
   var splitPath = new Array();
   var currentURL;
   
   document.addEventListener("click", (e) => {
      switch (e.target.id) {
      // Get the active tab, then request the path to the currently-selected
      // element and display it.
      case "grabElement":
         browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // Strips the fragment identifier off of the current URL, if
            // applicable.
            currentURL = tabs[0].url.split('#')[0];
            
            // Requests the unique path of the currently-selected element.
            browser.tabs.sendMessage(tabs[0].id, {type: "grabElement"}, function(path) {
               if (path != null) {
                  // Splits the path into constituent elements.
                  splitPath = path.split(' > ');
                  maxIndex = splitPath.length - 1;
                  
                  // Builds and displays the precision selection form.
                  document.getElementById("selector").classList.remove("hidden");
                  var back = document.createElement("button");
                  back.id = "back";
                  back.setAttribute('type', 'button');
                  if (maxIndex <= 0) back.disabled = true;
                  back.appendChild(document.createTextNode("<"));
                  document.getElementById("selector").appendChild(back);
                  
                  for (var i = 0; i <= maxIndex; i++) {
                     var segment = document.createElement("span");
                     segment.classList.add("segment");
                     var selector = document.createTextNode(splitPath[i]);
                     segment.appendChild(selector);
                     document.getElementById("selector").appendChild(segment);
                     
                     if (i + 1 <= maxIndex) {
                        var sef = document.createElement("span");
                        var segSep = document.createElement("span");
                        segSep.classList.add("segSep");
                        segSep.appendChild(document.createTextNode(" > "));
                        document.getElementById("selector").appendChild(segSep);
                     }
                  }
                  
                  var fwd = document.createElement("button");
                  fwd.id = "fwd";
                  fwd.setAttribute('type', 'button');
                  if (maxIndex == splitPath.length - 1) fwd.disabled = true;
                  fwd.appendChild(document.createTextNode(">"));
                  document.getElementById("selector").appendChild(fwd);
                  
                  // Shows the next steps for the user.
                  document.getElementById("step2").classList.remove("hidden");
                  document.getElementById("generateLink").classList.remove("hidden");
               } else {
                  // Otherwise, if nothing is currently highlighted, display
                  // a message.
                  document.getElementById("selector").innerHTML = 'Please select some text first.';
               }
            });
         });
         break;
      // In this case, generate and display the URL.
      case "generateLink":
         // Re-form the selector into a string.
         splitPath = splitPath.slice(0, maxIndex + 1);
         var finalPath = splitPath.join(" > ");
         // Encode it and append it to the current URL.
         var encodedPath = encodeURIComponent(btoa(finalPath));
         var linkURL = currentURL + '#' + encodedPath;
         var linkElem = document.createElement('a');
         linkElem.href = linkURL;
         linkElem.target = "_blank";
         linkElem.rel = "noopener noreferrer";
         linkElem.id = "linkElement";
         linkElem.appendChild(document.createTextNode(linkElem));
         document.getElementById("link").appendChild(linkElem);
         document.getElementById("link").classList.remove("hidden");
         break;
      // Selects the previous element in the selector.
      case "back":
         if (maxIndex > 0) {
            document.getElementsByClassName("segment")[maxIndex--].classList.add("hidden");
            document.getElementsByClassName("segSep")[maxIndex].classList.add("hidden");
            browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
               browser.tabs.sendMessage(tabs[0].id, {type: "highlightElement", selector: splitPath.slice(0, maxIndex + 1).join(" > ") });
            });
            if (maxIndex <= 0) 
               e.target.disabled = true;
            if (document.getElementById("fwd").disabled) 
               document.getElementById("fwd").disabled = false;
         }
         break;
      // Selects the next element in the selector.
      case "fwd":
         if (maxIndex < splitPath.length - 1) {
            document.getElementsByClassName("segSep")[maxIndex++].classList.remove("hidden");
            document.getElementsByClassName("segment")[maxIndex].classList.remove("hidden");
            browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
               browser.tabs.sendMessage(tabs[0].id, {type: "highlightElement", selector: splitPath.slice(0, maxIndex + 1).join(" > ") });
            });
            if (maxIndex == splitPath.length - 1) 
               e.target.disabled = true;
            if (document.getElementById("back").disabled) 
               document.getElementById("back").disabled = false;
         }
         break;
      default:
      }
   });
}

/**
 * Displays the popup's error message if there is an error executing the script.
 */
function reportExecuteScriptError(error) {
   document.getElementById("popup-content").classList.add("hidden");
   document.getElementById("error-content").classList.remove("hidden");
   console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * Injects the content script into the active tab and adds a click handler.
 * Handles errors if need be.
 */
browser.tabs.executeScript({file: "/content_scripts/pinpointer.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);