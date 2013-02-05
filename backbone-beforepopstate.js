/*!
 * backbone-beforepopstate v0.9.0
 * https://github.com/veracross/backbone-beforepopstate
 *
 * Requires jQuery, tested with 1.7 and 1.8
 *
 * Copyright 2012-2013 Will Bond, Breuer & Co LLC <wbond@breuer.com>
 * Released under the MIT license
 *
 * Date: 2013-2-4
 */

// Replaces the original checkUrl with one that runs beforepopstate event
// handlers before the state is popped, allowing for equivalent functionality
// to beforeunload handlers.
Backbone.History.prototype._originalCheckUrl = Backbone.History.prototype.checkUrl;

Backbone.History.prototype.checkUrl = function(e) {
  var confirmText, returnTo;
  var confirmSuffix = "\n\nAre you sure you want to leave this page?";

  // If there are beforepopstate handlers, continue as normal
  var events = $(window).data('events') || $._data($(window)[0], 'events');
  if (!events || !events.beforepopstate) {
    return this._originalCheckUrl(e);
  }

  // Try each beforepopstate handler, retrieving the text
  // and then checking with the user
  var cancelled = false;
  for (var i = 0; i < events.beforepopstate.length; i++) {
    confirmText = events.beforepopstate[i].handler();
    if (confirmText && !confirm(confirmText + confirmSuffix)) {
      cancelled = true;
      break;
    }
  }

  if (!cancelled) {
    return this._originalCheckUrl(e);
  }

  // If the user did cancel, we have to push the previous URL
  // back onto the history to make it seem as if they never
  // moved anywhere.
  returnTo = this.fragment;
  this.fragment = this.getFragment();
  this._originalNavigate(returnTo);
};


// Replaces the original navigate with one that runs
// beforepushstate event handlers before the state is
// changed, allowing for equivalent functionality to
// beforeunload handlers.
Backbone.History.prototype._originalNavigate = Backbone.History.prototype.navigate;

Backbone.History.prototype.navigate = function(fragment, options) {
  if (!Backbone.History.started) return false;

  var confirmText;
  var confirmSuffix = "\n\nAre you sure you want to leave this page?";

  // If there are beforepushstate handlers, continue as normal
  var events = $(window).data('events') || $._data($(window)[0], 'events');
  var cancelled = false;
  if (events && events.beforepushstate) {
    // Try each beforepushstate handler, retrieving the text
    // and then checking with the user
    for (var i = 0; i < events.beforepushstate.length; i++) {
      confirmText = events.beforepushstate[i].handler();
      if (confirmText && !confirm(confirmText + confirmSuffix)) {
        cancelled = true;
        break;
      }
    }
  }

  if (!cancelled) {
    return this._triggerPushState(fragment, options);
  }
};

// Sets up pushstate events to be triggered when navigate is called
Backbone.History.prototype._triggerPushState = function(fragment, options) {
  var events, cont, i, e;
  result = this._originalNavigate(fragment, options);

  events = $(window).data('events') || $._data($(window)[0], 'events');
  if (events && events.pushstate) {
    e = {
      bubbles: false,
      cancelable: true,
      preventDefault: function() {},
      srcElement: window,
      stopPropagation: function() {},
      target: window,
      type: "pushstate"
    };

    for (i = 0; i < events.pushstate.length; i++) {
      cont = events.pushstate[i].handler(e);
      // If the handler returns false, skip remaining handlers
      if (cont === false) {
        break;
      }
    }
  }

  return result;
};