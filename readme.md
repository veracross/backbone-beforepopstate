# backbone-beforepopstate

**Version 0.9.0**

A small small extension to backbone.js v0.9-1.0 that adds `beforepopstate` and
`beforepushstate` handlers that work like `beforeunload`. As a bonus, adds a
`pushstate` event that fires when a URL is pushed onto the history stack.

## Installation

Load `backbone-beforepopstate.js` after loading backbone.js and jQuery.

This extension has been tested with jQuery 1.7 and 1.8.

## Usage

The `beforepopstate` and `beforepushstate` events act exactly like `beforeunload`
that is part of all browsers. The event handler should return a string to be
displayed to the user to confirm if they want to leave the page.

```js
var unloadHandler = function() {
    if (page.dirty) {
        return "Leaving this page will caused your unsaved changes to be lost!";
    }
}

// Added by backbone-beforepopstate
$(window).on('beforepopstate', unloadHandler);
$(window).on('beforeushstate', unloadHandler);

// Native unload handler
$(window).on('beforeunload', unloadHandler);
```

The `pushstate` event gets called after a URL is pushed onto the history when
using pushState with backbone. Often this is used to clean up event handlers
and other similar view-specific code.

```js
var cleanUp = function() {
    // Clean up event handlers, views, etc
}
$(window).on('pushstate', cleanUp);
```

## License

Copyright (c) 2012-2013 Will Bond, Breuer & Co LLC <wbond@breuer.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.