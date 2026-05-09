// ═══════════════════════════════════════════════════════════════
// AquaSentinel — DNS Fix for ISP networks (Reliance, etc.)
// Forces Google DNS (8.8.8.8) for external service domains
// Import this BEFORE neonDb.js in index.js
// ═══════════════════════════════════════════════════════════════

import dns from 'dns';

const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']);

const FORCE_GOOGLE_DNS = [
  'supabase.co',
  'neon.tech',
  'neo4j.io',
  'x.ai',
  'api.x.ai',
];

const originalLookup = dns.lookup.bind(dns);
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const opts = typeof options === 'number' ? { family: options } : (options || {});

  const needsOverride = hostname && FORCE_GOOGLE_DNS.some(d => hostname.includes(d));
  if (needsOverride) {
    resolver.resolve4(hostname, (err, addresses) => {
      if (err) return originalLookup(hostname, opts, callback);
      if (opts.all) {
        callback(null, addresses.map(a => ({ address: a, family: 4 })));
      } else {
        callback(null, addresses[0], 4);
      }
    });
  } else {
    originalLookup(hostname, opts, callback);
  }
};

export default {};
