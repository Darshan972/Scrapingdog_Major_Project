const getDataId = require("../DataIdScraping/dataId");
const express = require("express");
const User = require("../../../models/auth.model");
const router = new express.Router();
const rateLimit = require("express-rate-limit");

const getData = async (apiKey, request, user) => {
  let data = [];
  let expired = false;
  setTimeout(() => {
    expired = true;
  }, 10 * 6000);
  while (data.length == 0 && !expired) {
    data = await getDataId(request.q, request.gl);
  }

      user.requests = user.requests + 20;
      user.requestsLeft = user.quota - user.requests;
      user.apiCallsPerDay = user.apiCallsPerDay + 20;

      await user.save();

    return {
      placeDetails: data,
    };
};

const limiter = rateLimit({
  windowMs: 1, // 1 sec
  max: async (req, res) => {
    const apiKey = req.query.api_key;
    const user = await User.findById(apiKey);
    if (user.requests < user.quota) {
      return user.concurrency;
    } else {
      return res.status(426).send({ message: "Please upgrade your plan" });
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const checkAPI = async (req, res, next) => {
  const apiKey = req.query.api_key;
  if (apiKey) {
    next();
  } else {
    return res.status(404).send({
      success: false,
      message: "Unauthorized request, please make sure your API key is valid.",
    });
  }
};

const checkUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.query.api_key);
    if (user) {

      if(user.requests >= user.quota){
        return res.status(404).send({
          success: false,
          message: "You have used all request credits from your quota. Please update your plan to get more credits at https://scrapingdog.io/pricing"
        })
      }
      else if(user.validity <= 0)
      {
        return res.status(401).send({
          success: false,
          message: "Your plan is expired. Please upgrade your plan at https://api.scrapingdog.io/pricing."
        })
      }
      else
      {
        next();
      }
    } else {
      return res.status(404).send({
        success: false,
        message: "User not found or API key is wrong. Please register on https://api.scrapingdog.io/register to get your API Key.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).send({
      success: false,
      message: "User not found or API key is wrong. Please register on https://api.scrapingdog.io/register to get your API Key.",
    });
  }
};

const checkIP = async(req,res,next) => {
  try{
    let ip = req.headers['x-real-ip']; 
    if(ip === "2401:4900:1b23:bb8b:5049:e1b:9fcf:db9e" || ip === "49.44.80.39" || ip === "152.166.130.234" || ip === "2401:4900:51c2:bde8:248b:816:dec3:69c" || ip === "186.148.91.98" || ip === "181.37.188.118" || ip === "207.244.64.33")
    {
      return res.status(400).send({message: "This email is not allowed to make requests", success: false})
    }
    else{
      next();
    }
  }
  catch(e)
  {
    console.log(e)
  }
}

router.get("/dataId", checkIP ,checkAPI, checkUser, limiter, async (req, res) => {
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    let user = await User.findById(apiKey)
    if (req.query.q.length) {
      const data = await getData(apiKey, req.query, user);
      if (data.message) {
        res.status(429).send({ message: data.message });
      } else {
        res.status(200).send(data);
      }
    }
    else
    {
      res.status(404).send({message: "Please enter a valid query"})
    }
  } catch (error) {
    console.log(error);
    res.status(504).send({
      message:
        "Something went wrong . If you keep getting this error please mail us at darshan@scrapingdog.io.",
      success: false,
      status: 504,
    });
  }
});

module.exports = router;
