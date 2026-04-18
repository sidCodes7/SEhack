# aether-bridge.js — Mini-App SDK

> Lightweight JavaScript SDK for building mini-apps on the Aether Super App platform.

## Quick Start

Include the SDK in your mini-app's HTML:

```html
<script src="/path/to/aether-bridge.js"></script>
<script>
  AetherBridge.onReady(function (user) {
    console.log('Hello, ' + user.userName + '!');
    console.log('Role:', user.role);
    console.log('Department:', user.department);
  });
</script>
```

## API

### `AetherBridge.onReady(callback)`

Registers a callback that fires when user data is received from the Aether Host Shell.

**Parameters:**
- `callback(user)` — Function receiving the user data object

**User object:**
```javascript
{
  userName: "Priyank",       // Display name
  role: "student",           // 'student' | 'professor' | 'admin'
  department: "Computer Science"
}
```

### `AetherBridge.sendToHost(type, payload)`

Sends a message back to the Aether Host Shell.

**Parameters:**
- `type` — String identifier for the message type
- `payload` — Any serializable data

### `AetherBridge.user`

Direct access to the user object (null until `onReady` fires).

## Security Notes

- The SDK only receives **scoped, non-sensitive data**: `userName`, `role`, `department`
- **No auth tokens** are passed to mini-apps
- Mini-apps run inside sandboxed iframes with `allow-scripts allow-same-origin`
- All communication uses `window.postMessage`

## Example Mini-App

See `apps/canteen-tracker/` for a complete working example.
