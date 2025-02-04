const express = require("express");
const router = express.Router();
const User = require("../models/auth.model");

router.post("/credits", async(req, res) => {
  try {
    const user = await User.findById(req.body.data);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({
      validity: user.validity,
      creditsLeft: user.requestsLeft,
      api_calls_per_day: user.apiCallsPerDay,
      total_requests: user.requests,
      quota: user.quota,
      plan: user.plan
    });
  } catch (e) {
    console.log("Error from credits : " + e);
    return res.status(400).json(e);
  }
});

module.exports = router;
