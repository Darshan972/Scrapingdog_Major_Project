const getLinkedInData = require("./leadbagData");
const express = require("express");
const User = require("../models/auth.model");
const router = new express.Router();
const rateLimit = require("express-rate-limit");

const getData = async (apiKey, request) => {
  let data = [];

  data = await getLinkedInData(request.domain);

  const employees_data = data[0];

  User.findById(apiKey, (err, user) => {
    if(!request.num)
    {
      user.requests = user.requests + 1;
      user.requestsLeft = user.quota - user.requests;
      user.apiCallsPerDay = user.apiCallsPerDay + 1;
    }

    user.save((err) => {
      if (err) {
        console.log("Error : " + err);
      }
    });
  });
    if(!employees_data)
    {
      return ({message: "Domain Not Found"});
    }
    let info = {};
    info.employees_data = employees_data;
    return info;
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
          message: "You have used all request credits from your quota. Please update your plan to get more credits at https://serpdog.io/pricing"
        })
      }
      else if(user.validity == 0)
      {
        return res.status(401).send({
          success: false,
          message: "Your plan is expired. Please upgrade your plan at https://api.serpdog.io/pricing."
        })
      }
      else
      {
        next();
      }
    } else {
      return res.status(404).send({
        success: false,
        message: "User not found or API key is wrong. Please register on https://api.serpdog.io/register to get your API Key.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).send({
      success: false,
      message: "User not found or API key is wrong. Please register on https://api.serpdog.io/register to get your API Key.",
    });
  }
};

router.get("/leadbag", checkAPI, checkUser, limiter, async (req, res) => {
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    if (req.query.domain.length) {
      const data = await getData(apiKey, req.query);
      if (data.message) {
        res.status(404).send({ message: data.message });
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
        "Something went wrong . If you keep getting this error please mail us at darshan@serpdog.io.",
      success: false,
      status: 504,
    });
  }
});

module.exports = router;
