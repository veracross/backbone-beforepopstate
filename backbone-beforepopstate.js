/*!
 * backbone-beforepopstate v0.9.1
 * https://github.com/veracross/backbone-beforepopstate
 *
 * Requires jQuery, tested with 1.7 and 1.8
 *
 * Copyright 2012-2013 Will Bond, Breuer & Co LLC <wbond@breuer.com>
 * Released under the MIT license
 *
 * Date: 2013-2-6
 */

// Replaces the original checkUrl with one that runs beforepopstate event
// handlers before the state is popped, allowing for equivalent functionality
// to beforeunload handlers.
Backbone.History.prototype._originalCheckUrl = Backbone.History.prototype.checkUrl;

Backbone.History.prototype.checkUrl = function(e) {
  var confirmText, returnTo, fragment, e;
  var confirmSuffix = "\n\nAre you sure you want to leave this page?";

  // If there are beforepopstate handlers, continue as normal
  var events = jQuery(window).data('events') || jQuery._data(jQuery(window)[0], 'events');
  if (!events || !events.beforepopstate || Backbone.history._pushHistory.length == 0) {
    return Backbone.history._originalCheckUrl(e);
  }

  // Try each beforepopstate handler, retrieving the text
  // and then checking with the user
  var cancelled = false;
  for (var i = 0; i < events.beforepopstate.length; i++) {
    e= {
      type: "beforepopstate",
      fragment: Backbone.history._pushHistory[Backbone.history._pushHistory.length - 1]
    };
    confirmText = events.beforepopstate[i].handler(e);
    if (confirmText && !confirm(confirmText + confirmSuffix)) {
      cancelled = true;
      break;
    }
  }

  if (!cancelled) {
    Backbone.history._pushHistory.pop();
    return Backbone.history._originalCheckUrl(e);
  }

  // If the user did cancel, we have to push the previous URL
  // back onto the history to make it seem as if they never
  // moved anywhere.
  Backbone.history._popCancelled = true
  returnTo = Backbone.history.fragment;
  Backbone.history.fragment = Backbone.history.getFragment();
  Backbone.history._originalNavigate(returnTo);
};


// Replaces the original navigate with one that runs
// beforepushstate event handlers before the state is
// changed, allowing for equivalent functionality to
// beforeunload handlers.
Backbone.History.prototype._originalNavigate = Backbone.History.prototype.navigate;

Backbone.History.prototype.navigate = function(fragment, options) {
  if (!Backbone.History.started) return false;

  var confirmText, e;
  var confirmSuffix = "\n\nAre you sure you want to leave this page?";

  // If there are beforepushstate handlers, continue as normal
  var events = jQuery(window).data('events') || jQuery._data(jQuery(window)[0], 'events');
  var cancelled = false;
  if (events && events.beforepushstate && Backbone.history._pushHistory.length > 0) {
    // Try each beforepushstate handler, retrieving the text
    // and then checking with the user
    for (var i = 0; i < events.beforepushstate.length; i++) {
      e = {
        type: "beforepushstate",
        fragment: fragment
      };
      confirmText = events.beforepushstate[i].handler(e);
      if (confirmText && !confirm(confirmText + confirmSuffix)) {
        cancelled = true;
        break;
      }
    }
  }

  if (!cancelled) {
    return Backbone.history._triggerPushState(fragment, options);
  }
};

// Sets up pushstate events to be triggered when navigate is called
Backbone.History.prototype._triggerPushState = function(fragment, options) {
  var oldFragment = window.location.pathname + window.location.search + window.location.hash;
  Backbone.history._pushHistory.push(oldFragment);
  // Make sure the history doesn't get "wicked" big
  if (Backbone.history._pushHistory.length > 1000) {
    Backbone.history._pushHistory.shift();
  }

  var events, cont, i, e;
  result = Backbone.history._originalNavigate(fragment, options);

  events = jQuery(window).data('events') || jQuery._data(jQuery(window)[0], 'events');
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
      e.fragment = fragment;
      cont = events.pushstate[i].handler(e);
      // If the handler returns false, skip remaining handlers
      if (cont === false) {
        break;
      }
    }
  }

  return result;
};

// Adds an event handler that adds the fragment being popped to onto the event
Backbone.History.prototype._originalStart = Backbone.History.prototype.start;
Backbone.History.prototype.start = function(options) {
  Backbone.history._pushHistory = [];
  Backbone.history._popCancelled = false;
  var history = Backbone.history;

  // Adds a "fragment" property to popstate events so that they are like
  // pushstate, onbeforepushstate and onbeforepopstate. The fragment will be
  // set to false for the initial popstate event that chrome and safari trigger
  // when first loading a page.
  jQuery(window).on('popstate', function(e) {
    var fragment = history._pushHistory[history._pushHistory.length - 1];
    // The state is null for the default popstate event that chrome and safari
    // trigger on page load
    if (fragment === undefined && e.originalEvent.state === null) {
      fragment = false;
    }
    e.fragment = fragment;
  });

  Backbone.history._originalStart(options);

  // This prevents the popstate event handler from calling any handlers after
  // the one that backbone uses to fire navigation
  jQuery(window).on('popstate', function(e) {
    if (history._popCancelled) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      history._popCancelled = false;
    }
  });
};