/**
   Title: Pinpointer
   Version: 1.0
   Author: Ben Goldsworthy <me@bengoldsworthy.net>

   This file is a part of Pinpointer, a browser extension that allows you to 
   create and share links to arbitrary content on a webpage.

   This script highlights elements when provided with a Pinpointer link.
*/
(function() {
   /**
    * Check if an extension-compatible fragment identfier is present (and that
    * it's not just a regular identifier). If it is, then scroll the page to
    * the correct element and style it.
    */
   var currentElement = window.location.href.split('#')[1];
   if ((typeof currentElement != 'undefined') && (document.querySelector(":target") == null)) {
      currentElement = atob(decodeURIComponent(currentElement));
      elem = document.querySelector(currentElement);
      elem.scrollIntoView(true);
      elem.style.cssText = "background-color: lightgreen; border: 2px dashed green;"; 
      window.scrollBy(0, -50);
   }
})();
