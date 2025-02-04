const express = require("express");
const router = express.Router();
const User = require("../models/auth.model");

let d = (element) => element.date == new Date(Date.now() - 86400000) + " "

router.post("/usage", async(req, res) => {
  try {
    const user = await User.findById(req.body.data).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
  
    if (user.usageArray.some(d)) {
      return res.status(200).json(user.usageArray);
    } else {
      return res.status(200).json(user.usageArray);
    }
  } catch (e) {
    console.log("Error from usage : " + e);
    return res.status(400).json(e);
  }
});

module.exports = router;
