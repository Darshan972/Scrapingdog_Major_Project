const express = require("express");
const User = require("../../../models/auth.model");
const router = new express.Router();
const rateLimit = require("express-rate-limit");
const unirest = require("unirest");
const cheerio = require("cheerio")
const selectRandom = require("../.././UserAgents")


const getData = async (apiKey, request,res, user) => {
  let data = [];
  let expired = false;

  const getProductData = async (product_id, gl = "us", hl = "en", uule = "",start = 0, offers=0, specs=0, reviews=0, filters="" ,api_key) => {
    let product_results = {}, online_sellers = [], related_products = [], specifications = {}, reviews_results = {}, product_variations = [];

    return [];
}

    data = await getProductData(
      request.product_id,
      request.gl,
      request.hl,
      request.uule,
      request.start,
      request.offers,
      request.specs,
      request.reviews,
      request.filters,
      request.api_key      
    );
 
   if(expired == true)
   {
     console.log("andar")
     let data = {}
     data.status = 408;
     data.message = "Request Timed Out"
     return data;
   }
 
   let status;
 if(expired == false)
 {
 status = data[0];
 }



 else if(status == 503)
 {
 let response;
 response = data[1];
 return response;
 }
   
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
      if (user.requests >= user.quota) {
        return res.status(403).send({
          success: false,
          message: "You have used all request credits from your quota. Please update your plan to get more credits at https://scrapingdog.io/pricing"
        })
      }
      if (user.email.includes("loca") || user.email.includes("loka") || user.email.includes("rus") || user.email.includes("cife") || user.email.includes("yopmail") || user.email.includes("asuflex.com") || user.email.includes("andorem.com") || user.email.includes("appxapi.com")) {
        return res.status(400).send({ message: "This email is not allowed to make requests", success: false })
      }
      else if (user.validity <= 0) {
        return res.status(403).send({
          success: false,
          message: "Your plan is expired. Please upgrade your plan at https://api.scrapingdog.io/pricing."
        })
      }
      else {
        next();
      }
    }
    else {
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

const checkIP = async (req, res, next) => {
  try {
    let ip = req.headers['x-real-ip'];
    if (ip === "2401:4900:1b23:bb8b:5049:e1b:9fcf:db9e" || ip == "2600:4040:90bb:4400:d9c5:4f4a:91c5:e46c" || ip === "49.44.80.39" || ip === "152.166.130.234" || ip === "2401:4900:51c2:bde8:248b:816:dec3:69c" || ip === "186.148.91.98" || ip === "181.37.188.118" || ip === "207.244.64.33" || ip === "2605:fe80:2100:a010:6::1" || ip === '68.168.126.122') {
      return res.status(400).send({ message: "This email is not allowed to make requests", success: false })
    }
    else {
      next();
    }
  }
  catch (e) {
    console.log(e)
  }
}

router.get(
  "/product",
  checkIP,
  checkAPI,
  checkUser,
  limiter,
  async (req, res) => {
    try {
      console.log(req.headers['x-real-ip'])
      const apiKey = req.query.api_key;
      const user = await User.findById(apiKey)
      if (req.query.product_id.length) {
        const data = await getData(apiKey, req.query, res, user);
        if (data.status !== 200) {
          return res.status(data.status).send(data);
        }
        if (data.status == 200) {
          delete data.status;
          if (req.query.html == "true") {
            res.status(200).send(data.html);
          }
          else {
            res.status(200).send(data);
          }
        }
      } else {
        res.status(404).send({ success: false ,message: "Please enter a valid product id" });
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
  }
);


module.exports = router;
