# backbone-beforepopstate

**Version 1.0.0**

A small small extension to backbone.js v1.0 that adds `beforepopstate` and
`beforepushstate` handlers that work like `beforeunload`. As a bonus, adds a
`pushstate` event that fires when a URL is pushed onto the history stack.

This extension has been tested with jQuery 1.7-1.9 and Backbone.js 1.0.

## Installation

Load `backbone-beforepopstate.js` after loading Backbone.js and jQuery. Once
loaded, call:

```
Backbone.addBeforePopState(Backbone);
```

You may alternatively pass in a `noConflict()` version instead of `Backbone`.

## Usage

The `beforepopstate` and `beforepushstate` events act exactly like `beforeunload`
that is part of all browsers. The event handler should return a string to be
displayed to the user to confirm if they want to leave the page.

```js
var unloadHandler = function(e) {
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
var cleanUp = function(e) {
    // Clean up event handlers, views, etc
}
$(window).on('pushstate', cleanUp);
```

### fragment

Each of the following event handlers will recieve an event object with a
`fragment` property that is the `/pathname?search#hash` of the URL being
transitioned **to**:

- `popstate`
- `pushstate`
- `beforepopstate`
- `beforepushstate`

This fragment is useful for implementing a tabbed inteface where push and pop
state handlers should only run when leaving the view, but not just switching
tabs. This presumes that your tabs each have their own URL.

## License

Copyright (c) 2012-2013 Will Bond, Breuer & Co LLC <wbond@breuer.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.