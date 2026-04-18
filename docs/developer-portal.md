# 🧩 Aether Developer Portal — Mini-App Guide

> Build mini-apps that plug into the Aether campus ecosystem.

---

## What is a Mini-App?

Mini-apps are lightweight web applications that run inside the Aether Super App via sandboxed `<iframe>` elements. They receive basic user context (name, role, department) but **never** get auth tokens or direct API access.

---

## Quick Start

### 1. Build Your App

Create any web application (HTML/CSS/JS, React, Vue — anything that runs in a browser).

### 2. Include aether-bridge.js

Add the Aether Bridge SDK to your app:

```html
<script src="https://cdn.aether.edu/aether-bridge.js"></script>
```

Or copy `libs/aether-bridge/aether-bridge.js` into your project.

### 3. Receive User Context

```javascript
AetherBridge.onReady(function(user) {
  console.log('Hello, ' + user.userName);
  console.log('Role:', user.role);           // 'student' | 'professor' | 'admin'
  console.log('Department:', user.department);
});
```

### 4. Deploy Your App

Deploy to any hosting service (Vercel, Netlify, GitHub Pages, etc.).

### 5. Submit via Developer Portal

Open the Aether Super App → **Developer** tab → Fill in the submission form.

Your app will be automatically scanned by our AI security auditor (Grok). After the audit, an admin will review and approve or reject your submission.

---

## Available Scoped Data

When your mini-app loads inside Aether, it receives the following user data via `postMessage`:

| Field | Type | Description |
|-------|------|-------------|
| `userName` | `string` | Display name of the current user |
| `role` | `string` | User's role: `student`, `professor`, or `admin` |
| `department` | `string` | User's academic department |

> ⚠️ **Security:** No auth tokens, session IDs, or API keys are ever passed to mini-apps.

---

## SDK API Reference

### `AetherBridge.onReady(callback)`

Registers a callback that fires when user context is received.

```javascript
AetherBridge.onReady(function(user) {
  // user = { userName, role, department }
});
```

If the data has already been received, the callback fires **immediately**.

### `AetherBridge.sendToHost(type, payload)`

Send a message back to the Aether Host Shell:

```javascript
AetherBridge.sendToHost('canteen:order', { item: 'Masala Chai', qty: 1 });
```

### `AetherBridge.user`

Direct access to the user object. `null` until `onReady` fires.

---

## Security Audit Process

When you submit a mini-app:

1. **Submission** — You fill in app name, description, category, deployment URL, and requested permissions
2. **AI Audit** — Grok analyzes your submission and generates a **Security Clearance Certificate**:
   ```json
   {
     "riskLevel": "LOW",
     "findings": ["Uses HTTPS", "No external API calls detected"],
     "recommendation": "APPROVE",
     "compliance": "Data Privacy OK"
   }
   ```
3. **Admin Review** — A campus admin reviews the audit report and approves or rejects your app
4. **Live** — Once approved, your app appears in the Mini Apps grid for all users

---

## Iframe Sandbox Policy

Mini-apps run with the following sandbox attributes:

```
sandbox="allow-scripts allow-same-origin"
```

This means:
- ✅ JavaScript execution allowed
- ✅ Same-origin allowed for your app's domain
- ❌ No popups
- ❌ No form submissions to external URLs
- ❌ No top-level navigation

---

## Example: Canteen Tracker

See `apps/canteen-tracker/` for a complete working example that:
- Includes `aether-bridge.js`
- Uses `AetherBridge.onReady()` to greet the user
- Displays a mock canteen menu with prices and wait times

---

## Best Practices

1. **Use HTTPS** for your deployment URL (required for approval)
2. **Keep it lightweight** — mini-apps should load fast inside the iframe
3. **Handle the guest case** — your app might load outside of Aether (set a timeout fallback)
4. **Don't request unnecessary permissions** — it increases your risk score
5. **Responsive design** — the iframe viewport may vary in size
