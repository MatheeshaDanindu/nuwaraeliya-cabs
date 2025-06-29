
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Endpoint: Get Stripe Checkout Session details by session ID
// Used by frontend to display payment receipt and status
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ['payment_intent', 'payment_intent.charges']
    });
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Export the router for use in main app
module.exports = router;
