const express = require("express");
const { getCheckoutSummary, simulateCheckout, cancelSubscription } = require("../controllers/subscriptionController");

const router = express.Router();
router.get("/demo-checkout", getCheckoutSummary);
router.post("/demo-checkout", simulateCheckout);
router.post("/cancel", cancelSubscription);

module.exports = router;
