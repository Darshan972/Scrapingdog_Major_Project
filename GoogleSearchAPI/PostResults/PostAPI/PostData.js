const getPostData = require("../PostScraping/postData");
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
    data = await getPostData(
      request.data_id,
      request.gl,
      request.hl,
      request.next_page_token
    );
  }
  
  if(expired && data.length == 0)
  {
    return {
      message: "Request Timed Out. Please retry the request.",
      status: 500
    }
  }

  const html = data[0];

    if(html.status == 200)
    {
      
        user.requests = user.requests + 20;
        user.requestsLeft = user.quota - user.requests;
        user.apiCallsPerDay = user.apiCallsPerDay + 20;

        await user.save()
        delete html.status;
    }

        let response = {};
        response.data = html;
        return response;
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

router.get("/posts", checkAPI, checkUser, limiter, async (req, res) => {
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    const user = await User.findById(apiKey)
    if (req.query.data_id.length) {
      const data = await getData(apiKey, req.query,user);

      if (data.data.status == 400) {
        res.status(400).send(data);
      }
      else if(data.data.status == 500){
        res.status(500).send(data); 
      } 
      else {
        res.status(200).send(data);
      }
    }
    else
    {
      res.status(404).send({message: "Please enter a valid data ID"})
    }
  } catch (error) {
    console.log(error);
    res.status(503).send({
      message:
        "Something went wrong . If you keep getting this error please mail us at darshan@scrapingdog.io.",
      success: false,
      status: 503,
    });
  }
});

module.exports = router;
