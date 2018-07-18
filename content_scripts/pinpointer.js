/**
   Title: Pinpointer
   Version: 1.0
   Author: Ben Goldsworthy <me@bengoldsworthy.net>

   This file is a part of Pinpointer, a browser extension that allows you to 
   create and share links to arbitrary content on a webpage.

   This script runs in the browser windo and selects elements to pass on to the
   extension popup menu.
*/

(function() {
   /**
    * Protects against multiple injections of the same content script.
    */
   if (window.hasRun) 
      return;
   window.hasRun = true;
   
   var firstRun = true;
   
   // Creates a stylesheet used for highlighting selected elements.
   // Source: https://davidwalsh.name/add-rules-stylesheets
   var sheet = (function() {
      // Create the <style> tag
      var style = document.createElement("style");

      // WebKit hack :(
      style.appendChild(document.createTextNode(""));

      // Add the <style> element to the page
      document.head.appendChild(style);

      return style.sheet;
   })();

   
   /**
    * This function has been _heavily_ adapted from the `jquery-getpath.js` 
    * plugin, released under the MIT License by Dave Cardwell. 
    *
    * The original plugin can be found at:
    * http://davecardwell.co.uk/javascript/jquery/plugins/jquery-getpath/
    */
   function getPath(path, elem) {
      // If this elem is an `<html>` node, we've reached the end of the path.
      if (elem.tagName == 'HTML')
         return 'html' + path;
      
      // Get the elem's tag name and (if applicable, and only the former if
      // possible), ID and class names.
      var cur = elem.tagName.toLowerCase();
      if (elem.id != "") {
         cur += '#' + elem.id;
      } else {
         var classes = elem.className;
         
         if (classes != "")
            cur += '.' + classes.trim().split(/[\s\n]+/).join('.');}
      

      // Recurse up the DOM.
      return getPath(' > ' + cur + path, elem.parentNode);
   }
   
   /**
    * Listen for messages from the popup script.
    * Upon receiving them, either send the path for the currently-selected page
    * element or highlight the new element.
    */
   browser.runtime.onMessage.addListener(
      function(message, sender, sendResponse) {
         switch(message.type) {
         // In this case, send back the path that uniquely identifies the
         // currently-selected element.
         case "grabElement":
            // Check if anything is actually selected first.
            var selection = window.getSelection();
            if (selection.anchorOffset != selection.focusOffset) {
               // If it is, get the path to the selected element.
               var elem = selection.anchorNode.parentNode;
               var path = getPath("", elem);
               
               // If the given path selector does not uniquely specify a single
               // element, replace the class selectors for the final element
               // with an `:nth-of-type()` psuedo-selector.
               if (document.querySelectorAll(path).length > 1) {
                  // Get the last element's type, shorn of class selectors.
                  var tmpPath = path.split(" > ");
                  var lastElem = tmpPath.pop().split(".")[0];
                  path = tmpPath.join(" > ");
                  path += " > " + lastElem;
                  
                  // Find all its same-type siblings, enumerate them and figure
                  // out which number our element is.
                  var sibs = document.querySelectorAll(path);
                  sibs.forEach(function(currentValue, currentIndex, listObj) { 
                     if (currentValue.isEqualNode(elem)) {
                        path += ":nth-of-type(" + (currentIndex + 1) + ")";
                        return;
                     }
                  });
               }
               sendResponse(path);
               highlight(path);
            } else {
               sendResponse(null);
            }
            break;
         case "highlightElement":
            highlight(message.selector);
            break;
         default:
            console.error("Unrecognised message: ", message);
         }
      }
   );
   
   /**
    * Highlight an element, given a selector.
    */
   function highlight(selector) {
      if (!firstRun) sheet.deleteRule(0);
      else firstRun = false;
      sheet.insertRule(selector + " { opacity: 0.7; border: 2px dashed green; }");
   }
   
   /**
    * When focus returns to the tab (i.e. the user clicks off of the pop-up),
    * clear any element highlighting.
    */
   window.addEventListener("focus", function(event) { 
      if (!firstRun) {
         sheet.deleteRule(0);
         firstRun = true;
      }
   }, false);
   
})();
