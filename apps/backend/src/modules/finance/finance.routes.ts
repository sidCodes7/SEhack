// ──────────────────────────────────────────────
// Finance Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { financeController } from './finance.controller.js';

const router = Router();

// GET /api/finance/dues — list my dues
router.get('/dues', financeController.getDues);

// POST /api/finance/pay/:dueId — initiate Razorpay order
router.post('/pay/:dueId', financeController.initiatePay);

// POST /api/finance/verify — verify payment signature
router.post('/verify', financeController.verifyPayment);

// GET /api/finance/checkout/:amount/:label — public Razorpay checkout page for mobile
router.get('/checkout/:amount/:label', (req, res) => {
  const amount = parseInt(req.params.amount) || 250;
  const label = decodeURIComponent(req.params.label || 'Campus Due');
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_Sf3ZtDFK8y8SSU';

  res.send(`<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aether Payment</title>
<style>
  * { margin:0; box-sizing:border-box; }
  body { font-family:-apple-system,system-ui,sans-serif; background:#F7F6F2; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; }
  .card { background:#fff; border-radius:24px; padding:32px; width:100%; max-width:400px; text-align:center; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  h1 { font-size:28px; font-weight:800; color:#1A1A1A; margin-bottom:4px; }
  .amount { font-size:48px; font-weight:900; color:#1A1A1A; margin:16px 0; }
  .label { font-size:14px; color:#6B6B6B; margin-bottom:24px; }
  .pay-btn { width:100%; padding:16px; background:#1A1A1A; color:#fff; border:none; border-radius:16px; font-size:16px; font-weight:700; cursor:pointer; }
  .pay-btn:hover { background:#333; }
  .badge { margin-top:16px; font-size:11px; color:#6B6B6B; display:flex; align-items:center; justify-content:center; gap:4px; }
  .success { display:none; }
  .success.show { display:block; }
  .success h2 { color:#2CB67D; font-size:24px; margin-bottom:8px; }
</style>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head><body>
<div class="card">
  <h1>Aether Campus OS</h1>
  <div class="amount">₹${amount}</div>
  <p class="label">${label}</p>
  <div id="main">
    <button class="pay-btn" onclick="startPay()">Pay with Razorpay</button>
  </div>
  <div class="success" id="success">
    <h2>✓ Payment Successful</h2>
    <p style="color:#6B6B6B">You can close this tab now</p>
  </div>
  <div class="badge">🔒 Payments secured via Razorpay · TEST MODE</div>
</div>
<script>
function startPay() {
  var options = {
    key: '${keyId}',
    amount: ${amount * 100},
    currency: 'INR',
    name: 'Aether Campus OS',
    description: '${label}',
    prefill: { name: 'Student', email: 'student@spit.ac.in' },
    theme: { color: '#1A1A1A' },
    handler: function(r) {
      document.getElementById('main').style.display='none';
      document.getElementById('success').classList.add('show');
    }
  };
  var rzp = new Razorpay(options);
  rzp.open();
}
</script>
</body></html>`);
});

export default router;
