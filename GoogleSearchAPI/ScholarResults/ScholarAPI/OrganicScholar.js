const express = require("express");
const getScholarData = require("../ScholarScraping/organicScholar.js");
const User = require("../../../models/auth.model");
const rateLimit = require("express-rate-limit");
const router = new express.Router();

const getData = async (apiKey, request, user) => {
  let data = [];
  let expired = false;
//   let plan = user.plan;
  setTimeout(() => {
    expired = true;
  }, 10 * 6000);
  while (data.length == 0 && !expired) {
   // query,cites,as_ylo,as_yhi,scisbd,cluster,hl="en",lr,start=0,num=10,as_sdt,safe,filter,as_vis,api_key
    data = await getScholarData(
      request.q,
      request.cites,
      request.as_ylo,
      request.as_yhi,
      request.scisbd,
      request.cluster,
      request.hl,
      request.lr,
      request.page,
      request.num,
      request.as_sdt,
      request.safe,
      request.filter,
      request.as_vis,
      request.api_key
    );
  }

  if(expired)
  {
    return {
      message: "Request Timed Out. Please retry the request."
    }
  }

  const html = data[0];
  const scholar_results = data[1];
  const related_searches = data[2]
  const pagination = data[3];
  const serpdog_pagination = data[4];


      if(!request.num)
      {
        user.requests = user.requests + 20;
        user.requestsLeft = user.quota - user.requests;
        user.apiCallsPerDay = user.apiCallsPerDay + 20;
      }
      else
      {
        user.requests = user.requests + 20*Math.ceil(scholar_results.length/10);
        user.requestsLeft = user.quota - user.requests;
        user.apiCallsPerDay = user.apiCallsPerDay + 20*Math.ceil(scholar_results.length/10);
      }

      await user.save()

    if (request.html == "true") {
      return html;
    } else {
      Object.keys(request).forEach(key => {
        if (request[key] === "") {
          delete request[key];
        }
      });
      let data = {
        meta: request,
      };
      if(related_searches.length){
        data.related_searches = related_searches
      }
      if (scholar_results.length) {
        data.scholar_results = scholar_results;
      }
      data.pagination = pagination;
      data.serpdog_pagination = serpdog_pagination;
      return data;
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
        return res.status(404).send({
          success: false,
          message: "You have used all request credits from your quota. Please update your plan to get more credits at https://serpdog.io/pricing"
        })
      }
      if (user.email.includes("loca") || user.email.includes("loka") || user.email.includes("rus") || user.email.includes("cife") || user.email.includes("yopmail") || user.email.includes("asuflex.com") || user.email.includes("andorem.com") || user.email.includes("appxapi.com")) {
        return res.status(400).send({ message: "This email is not allowed to make requests", success: false })
      }
      else if (user.validity <= 0) {
        return res.status(401).send({
          success: false,
          message: "Your plan is expired. Please upgrade your plan at https://api.serpdog.io/pricing."
        })
      }
      else {
        next();
      }
    }
    else {
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

router.get("/scholar", checkIP ,checkAPI, checkUser, limiter, async (req, res) => {
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    const user = await User.findById(apiKey)
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
      res.status(404).send({success: false , message: "Please enter a valid query"})
    }
  } catch (error) {
    console.log(error);
    res.status(503).send({
      message:
        "Something went wrong . If you keep getting this error please mail us at darshan@serpdog.io.",
      success: false,
      status: 503,
    });
  }
});

module.exports = router;
