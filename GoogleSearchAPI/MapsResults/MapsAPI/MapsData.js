const express = require("express");
const User = require("../../../models/auth.model");
const rateLimit = require("express-rate-limit");
const unirest = require("unirest")
const cheerio = require("cheerio");
const selectRandom = require("../../UserAgents")

const router = new express.Router();

const getPlaces = async (apiKey, request,res) => {
  let data = [];

  let expired = false;

  const getPlacesData = async (
    data,
    place_id,
    api_key = "",
    res
) => {
  let html = "";
    try {
      // query = encodeURI(query);
      let params = {
        data,
        place_id,
      }
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] == undefined || params[key] == null) {
          delete params[key];
        }
      });
      params = new URLSearchParams(params)
      params = params.toString();


      var response = {};
      response.status = 0;


      html = response.body;
      const $ = cheerio.load(response.body);


      let places_results = [];


      if (
        response.status == 200
      ) {
        return [
        response.status,html, places_results
        ];
      }
    } catch (error) {
      let data = {};
      data = {
        message: "There was some error in procedding the request. Please contact darshan@scrapingdog.io if this error persists.",
        status: 503
      }
      console.log("Error in search scraper: "+ error);
      return [503, data]
    }
    return [];
  };

    data = await getPlacesData(
      request.data,
      request.place_id,
      request.api_key,
      res
    );

    let html, places_results;
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
  if(status == 200)
  {
    html = data[1]
    places_results = data[2]
   }
   else if(status == 503)
   {
    let response;
    response = data[1];
    return response;
   }

    User.findById(apiKey, (err, user) => {
        user.requests = places_results.length ? user.requests + 1 : user.requests;
        user.requestsLeft =  user.quota - user.requests;
        user.apiCallsPerDay = places_results.length ? user.apiCallsPerDay + 1 : user.apiCallsPerDay;

      user.save((err) => {
        if (err) {
          // res.json("Field Not Updated")
          console.log("Error : " + err);
        }
      });
      // res.json("Field Updated")
    });

    if (request.html == "true") {
        let response = {}
        response.status = 200;
        response.html = html;
        return response;
      } else {
        Object.keys(request).forEach(key => {
          if (request[key] === "") {
            delete request[key];
          }
        });
        let response = {
          meta: request,
        };
        if (places_results.length) {
            response.places_results = places_results;
        }
        response.status = 200;
        return response;
      }
  };

const limiter = rateLimit({
  windowMs: 1, // 1 sec
  max: async (req, res) => {
    const apiKey = req.query.api_key;
    const user = await User.findById(apiKey);
    if (user.requests <= user.quota) {
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

    if(user.plan == "free" || user.isLinkedIn == false)
    {
        return res.status(403).send({
            success: false,
            message: "Please upgrade your plan to use LinkedIn API."
          })  
    }    
    if(user.requests >= user.quota){
      return res.status(404).send({
        success: false,
        message: "You have used all request credits from your quota. Please update your plan to get more credits at https://scrapingdog.io/pricing"
      })
    }
    else if(user.validity == 0)
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

const checkIP = async(req,res,next) => {
  try{
    let ip = req.headers['x-real-ip']; 
    if(ip === " 2401:4900:1b23:bb8b:5049:e1b:9fcf:db9e" || ip === "49.44.80.39" || ip === "2401:4900:51c2:bde8:248b:816:dec3:69c")
    {
      return res.status(400).send({message: "This email is not allowed to make request", success: false})
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


router.get(
  "/maps",
  checkIP,
  checkAPI,
  checkUser,
  limiter,
  async (req, res) => {
    try {
      console.log(req.headers['x-real-ip'])
      const apiKey = req.query.api_key;
      if(req.query.type == "places")
      {
      if (req.query.data || req.query.place_id) {
        const data = await getPlaces(apiKey, req.query,res);
        if (data.status == 408 || data.status == 503 || data.status == 404) {
          return res.status(data.status).send(data); 
        }
        if(data.status == 200)
        {
          delete data.status;
        if(req.query.html == "true")
        {
          res.status(200).send(data.html);
        }
        else
        {
          res.status(200).send(data);
        }
       }
      }
      else
      {
        res.status(404).send({ message: "Please make a valid API request." });
      }
     } else {
        res.status(404).send({ message: "Please make a valid API request." });
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
  }
);

module.exports = router;
