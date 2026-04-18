// ──────────────────────────────────────────────
// aether-bridge.js — Mini-App Communication SDK
// ──────────────────────────────────────────────
// Lightweight SDK for Aether Super App mini-apps.
// Provides communication between the Host Shell
// and sandboxed iframe mini-apps via postMessage.
//
// Usage in a mini-app:
//   <script src="https://cdn.aether.edu/aether-bridge.js"></script>
//   <script>
//     AetherBridge.onReady(function(user) {
//       console.log('Hello, ' + user.userName);
//     });
//   </script>

(function (root) {
  'use strict';

  var AetherBridge = {
    /** @type {{ userName: string, role: string, department: string } | null} */
    user: null,

    /** @type {boolean} */
    _ready: false,

    /** @type {Function[]} */
    _readyCallbacks: [],

    /**
     * Register a callback for when Aether user data is available.
     * If already received, fires immediately.
     * @param {function} callback - Called with user data: { userName, role, department }
     */
    onReady: function (callback) {
      if (typeof callback !== 'function') {
        console.warn('[AetherBridge] onReady expects a function');
        return;
      }
      if (this._ready && this.user) {
        callback(this.user);
      } else {
        this._readyCallbacks.push(callback);
      }
    },

    /**
     * Send a message back to the Host Shell.
     * @param {string} type - Message type identifier
     * @param {*} payload - Data payload
     */
    sendToHost: function (type, payload) {
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: 'AETHER_BRIDGE_MSG', bridgeType: type, payload: payload },
          '*'
        );
      }
    },

    /**
     * Internal: Initialize message listener.
     * @private
     */
    _init: function () {
      var self = this;
      window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'AETHER_INIT') {
          self.user = event.data.payload;
          self._ready = true;

          // Fire all registered callbacks
          for (var i = 0; i < self._readyCallbacks.length; i++) {
            try {
              self._readyCallbacks[i](self.user);
            } catch (e) {
              console.error('[AetherBridge] Callback error:', e);
            }
          }
          self._readyCallbacks = [];
        }
      });
    },
  };

  // Auto-initialize
  AetherBridge._init();

  // Expose globally
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AetherBridge;
  } else {
    root.AetherBridge = AetherBridge;
  }
})(typeof window !== 'undefined' ? window : this);
