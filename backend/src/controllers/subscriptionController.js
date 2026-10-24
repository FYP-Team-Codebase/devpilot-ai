const User = require("../models/User");

// This is demo configuration, not a payment processor or merchant price.
const DEMO_PRO_PLAN = Object.freeze({
  id: "pro",
  name: "Pro",
  amount: 19,
  currency: "USD",
  interval: "month",
  discount: 0,
  features: ["Everything in Free", "Increased AI generation capacity", "More project workspace room", "Advanced inspiration workflow", "Full code export", "Priority generation"],
});
const VALID_OUTCOMES = new Set(["success", "failure", "cancel"]);

async function getCheckoutSummary(req, res) {
  try {
    const user = await User.findById(req.userId).select("email subscription");
    if (!user) return res.status(404).json({ success: false, message: "Account not found." });
    return res.json({ success: true, plan: DEMO_PRO_PLAN, accountEmail: user.email, subscription: user.subscription || null });
  } catch {
    return res.status(500).json({ success: false, message: "Could not load checkout details." });
  }
}

async function simulateCheckout(req, res) {
  const { outcome } = req.body || {};
  if (!VALID_OUTCOMES.has(outcome)) {
    return res.status(400).json({ success: false, message: "Choose a valid demo checkout outcome." });
  }

  try {
    let subscription = null;
    if (outcome === "success") {
      const activatedAt = new Date();
      const user = await User.findOneAndUpdate(
        { _id: req.userId, "subscription.status": { $ne: "active" } },
        { $set: { subscription: { plan: DEMO_PRO_PLAN.id, status: "active", simulated: true, activatedAt, canceledAt: null } } },
        { new: true, runValidators: true }
      );
      if (!user) {
        const existingUser = await User.findById(req.userId).select("subscription");
        if (!existingUser) return res.status(404).json({ success: false, message: "Account not found." });
        subscription = existingUser.subscription;
      } else subscription = user.subscription;
    } else {
      const user = await User.findById(req.userId).select("subscription");
      if (!user) return res.status(404).json({ success: false, message: "Account not found." });
      subscription = user.subscription || null;
    }

    const message = outcome === "success"
      ? "Demo checkout succeeded. Your simulated Pro plan is active."
      : outcome === "failure"
        ? "Demo checkout failed. Your plan was not changed."
        : "Demo checkout cancelled. Your plan was not changed.";
    return res.status(200).json({ success: true, outcome, message, subscription });
  } catch {
    return res.status(500).json({ success: false, message: "Could not update the demo subscription." });
  }
}

async function cancelSubscription(req, res) {
  try {
    const canceledAt = new Date();
    const user = await User.findOneAndUpdate(
      { _id: req.userId, "subscription.plan": DEMO_PRO_PLAN.id, "subscription.status": "active" },
      { $set: { "subscription.status": "canceled", "subscription.canceledAt": canceledAt } },
      { new: true, runValidators: true }
    );
    if (user) {
      return res.json({ success: true, canceled: true, message: "Your demo Pro subscription was canceled.", subscription: user.subscription });
    }

    const existingUser = await User.findById(req.userId).select("subscription");
    if (!existingUser) return res.status(404).json({ success: false, message: "Account not found." });
    return res.json({
      success: true,
      canceled: false,
      message: existingUser.subscription?.status === "canceled" ? "This demo subscription is already canceled." : "There is no active Pro subscription to cancel.",
      subscription: existingUser.subscription || null,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Could not cancel the demo subscription." });
  }
}

module.exports = { getCheckoutSummary, simulateCheckout, cancelSubscription, DEMO_PRO_PLAN };
