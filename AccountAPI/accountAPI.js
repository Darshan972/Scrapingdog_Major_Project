const express = require("express");
const User = require("../models/auth.model");
const router = new express.Router();
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 1, // 1 sec
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  const getData = async(apiKey) => {
    try{
    const user = await User.findById(apiKey);
    const data = {};
    data.user_name = user.name;
    data.api_key = user.id;
    data.email = user.email;
    data.plan = user.plan;
    data.quota = user.quota;
    data.requests = user.requests;
    data.requests_left = user.requestsLeft;
    return data;
    }
    catch(e)
    {
        console.log(e);
        return {message: "Something went wrong . If you keep getting this error please mail us at darshan@scrapingdog.com."};
    }
  }

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
        next();
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
  

  
  module.exports = router;