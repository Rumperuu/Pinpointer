# Pinpointer

Pinpointer is a browser extension that allows you to create and share links to arbitrary content on a webpage.

You can read more about the extension on my website [here](https://bengoldsworthy.net/program/pinpointer/).

## Use

After installing the extension, an icon will appear in your browser toolbar. Select an element on a web page and click the icon, then click the first button to select that element. Fine-tune your choices, and then click the second button to generate the link.

With the extension installed, any received Pinpoint links will automatically highlight the element selected. The links are backwards compatible, so you don't have to worry about the recipient using the extension or not.

## Future Improvements

### Major

* Add an options menu so a user can specify (for example) how they want elements in Pinpoint links that they receive to be highlighted.
* Look at ways of modifying `getPath()` to produce shorter selectors.
* Make it look less ugly.
* Find an efficient method of making every element _except_ the highlighted one low-opacity? Previous attempts to do so would make the highlighted element's parent low-opacity, and you can't make a child more opaque than its parent.
* Move repo off of GitHub.

### Minor

* Add a button to cancel element highlighting when receiving a Pinpointer link.
* Should the first button on the form be removed, and just have clicking the Pinpointer icon go straight to the selector specification stage?