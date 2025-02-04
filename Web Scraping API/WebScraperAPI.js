const express = require("express");
const User = require("../models/auth.model");
const unirest = require("unirest")

const rateLimit = require("express-rate-limit");

const router = new express.Router();

const getData = async (apiKey, request,res,req,user) => {
  let data = [];

  let expired = false;

const getScrapingDogData = async(url, country = "",premium="",dynamic="true",wait="0",custom_headers = "") => {

    try{

        if(user.plan == "free"){
          dynamic = "false"
        }

        let params = {
            url,
            country,
            premium,
            dynamic,
            wait,
            custom_headers
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
          let API_URL = "";
            API_URL = `https://api.scraperapi.com/scrape?api_key=APIKEY&${params}`;
          async function timerr() {
            expired = true;
          }
          await res.setTimeout(40000, timerr)
          while(response.status != 200 && expired == false)
          {
              if(custom_headers == "true")
              {
                response = await unirest
                .get(API_URL)
                .headers(JSON.stringify(req.headers))
              }
              else{
              response = await unirest
              .get(API_URL)
              }
             console.log(response.status)
             if(response.status == 404)
             {
              break;
             }
             if(response.status == 410){
                break;
             }
             if(expired == true)
             {
              return;
             }
          }
    
    if(response.status == 400){
      let data = {};
      data = {
        message: "Bad Request",
        status: 400
      }
      return [400, data]
    }
    if(response.status == 401){
      let data = {};
      data = {
        message: "Unauthorized",
        status: 401
      }
      return [401, data]
    }
    if(response.status == 402){
      let data = {};
      data = {
        message: "Payment Required",
        status: 402
      }
      return [402, data]
    }
    if(response.status == 403){
      let data = {};
      data = {
        message: "Forbidden",
        status: 403
      }
      return [403, data]
    }
    if(response.status == 405){
      let data = {};
      data = {
        message: "Method Not available",
        status: 405
      }
      return [405, data]
    }
    if(response.status == 406){
      let data = {};
      data = {
        message: "Not Acceptable",
        status: 406
      }
      return [406, data]
    }
    if(response.status == 407){
      let data = {};
      data = {
        message: "Proxy Authentication Required",
        status: 407
      }
      return [407, data]
    }
    if(response.status == 409){
      let data = {};
      data = {
        message: "Conflict error",
        status: 409
      }
      return [409, data]
    }
    if(response.status == 411){
      let data = {};
      data = {
        message: "Length Required",
        status: 411
      }
      return [411, data]
    }
    if(response.status == 414){
      let data = {};
      data = {
        message: "URI Too Long",
        status: 414
      }
      return [414, data]
    }
    if(response.status == 431){
      let data = {};
      data = {
        message: "Request header fields too large.",
        status: 431
      }
      return [431, data]
    }
    if(response.status == 451){
      let data = {};
      data = {
        message: "Unavailable for legal reasons",
        status: 451
      }
      return [451, data]
    }
    if(response.status == 429){
      let data = {};
      data = {
        message: "Request Timed Out",
        status: 429
      }
      return [429, data]
    }      
    if(response.status == 408){
      let data = {};
      data = {
        message: "Request Timed Out",
        status: 408
      }
      return [408, data]
    } 
   if(response.status == 404)
   {
    let data = {};
    data = {
      message: "Sorry, we are not able to find that URL.",
      status: 404
    }
    return [404, data]
   }
   if(response.status == 410)
   {
    let data = {};
    data = {
      message: "Somehting went wrong, you will not be charged for this request. You can also you 'premium=true' to use premium proxies for this request. If you keep getting this error please contact us at darshan@scrapingdog.io.",
      status: 410
    }
    return [410, data]
   }
   if(response.status == 500){
    let data = {};
    data = {
      message: "Internal Server Error",
      status: 500
    }
    return [500, data]
   }
   if(response.status == 501){
    let data = {};
    data = {
      message: "Not Implemented",
      status: 501
    }
    return [501, data]
   }
   if(response.status == 502){
    let data = {};
    data = {
      message: "Bad Gateway",
      status: 502
    }
    return [502, data]
   }
   if(response.status == 503){
    let data = {};
    data = {
      message: "	Service Unavailable",
      status: 503
    }
    return [503, data]
   }
   if(response.status == 504){
    let data = {};
    data = {
      message: "Gateway Timeout",
      status: 504
    }
    return [504, data]
   }
   if(response.status == 505){
    let data = {};
    data = {
      message: "HTTP Version Not Supported",
      status: 505
    }
    return [505, data]
   }
   if(response.status == 200)
   {
    return [response.status, response.body]
   }
 } catch (error) {
   let data = {};
   data = {
     message: "There was some error in procedding the request. Please contact darshan@scrapingdog.io if this error persists.",
     status: 503
   }
   console.log("Error in Zilow scraper: "+ error);
   return [503, data]
 }
 return [];
};

    data = await getScrapingDogData(
      decodeURIComponent(request.url),
      request.country,
      request.premium,
      request.render_js,
      request.wait,
      request.custom_headers
    );

  let scraped_data;

let status;
  if(expired == true)
  {
    console.log("andar")
    let data = {}
    data.status = 408;
    data.message = "Request Timed Out"
    return data;
  }
if(expired == false)
{
status = data[0];
}
if(status == 200)
{
    scraped_data = data[1]
 }
 else if(status != 200)
 {
  let response = data[1];
  return response;
 }



        if(request.premium == "true" || request.premium == undefined || request.premium == null && request.render_js == "true")
        {
            user.requests = user.requests + 25 ;
            user.requestsLeft =  user.quota - user.requests;
            user.apiCallsPerDay =  user.apiCallsPerDay + 25;
        }
        if(request.premium == "true" || request.premium == undefined || request.premium == null && request.render_js == "false")
        {
            user.requests = user.requests + 10 ;
            user.requestsLeft =  user.quota - user.requests;
            user.apiCallsPerDay =  user.apiCallsPerDay + 10;
        }
        if(request.premium == "false" && request.render_js == "true")
        {
            user.requests = user.requests + 5 ;
            user.requestsLeft =  user.quota - user.requests;
            user.apiCallsPerDay =  user.apiCallsPerDay + 5;
        }
        if(request.premium == "false" && request.render_js == "false")
        {
            user.requests = user.requests + 1 ;
            user.requestsLeft =  user.quota - user.requests;
            user.apiCallsPerDay =  user.apiCallsPerDay + 1;
        }


        await user.save()
      // res.json("Field Updated")


      Object.keys(request).forEach(key => {
        if (request[key] === "") {
          delete request[key];
        }
      });
      let response = {}
      response.scraped_data = scraped_data;
      response.status = 200;
      return response;
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
      if (user.requests >= user.quota) {
        return res.status(404).send({
          success: false,
          message: "You have used all request credits from your quota. Please update your plan to get more credits at https://scrapingdog.io/pricing"
        })
      }
      if (user.email.includes("loca") || user.email.includes("loka") || user.email.includes("rus") || user.email.includes("cife") || user.email.includes("yopmail") || user.email.includes("asuflex.com") || user.email.includes("andorem.com") || user.email.includes("appxapi.com")) {
        return res.status(400).send({ message: "This email is not allowed to make requests", success: false })
      }
      else if (user.validity <= 0) {
        return res.status(401).send({
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

const checkIP = async(req,res,next) => {
  try{
    let ip = req.headers['x-real-ip']; 
    if(ip === "2401:4900:1b23:bb8b:5049:e1b:9fcf:db9e" || ip === "49.44.80.39" || ip === "152.166.130.234" || ip === "2401:4900:51c2:bde8:248b:816:dec3:69c" || ip === "186.148.91.98" || ip === "181.37.188.118" || ip === "207.244.64.33" || ip === "2605:fe80:2100:a010:6::1" || ip === '68.168.126.122')
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


router.get(
  "/scrape",
  checkIP,
  checkAPI,
  checkUser,
  limiter,
  async (req, res) => {
    try {
      console.log(req.headers['x-real-ip'])
      const apiKey = req.query.api_key;
      const user = await User.findById(req.query.api_key);
      if (req.query.url) {
        let url = decodeURIComponent(req.query.url)
        url = new URL(url)
        if(url.hostname.includes("google.com"))
        {
          return res.status(403).send({ message: "Please use our official Google Search API at https://docs.scrapingdog.io/google-search-api to scrape Google Search Results." , status: 403});
        }
        if(url.hostname.includes("zillow.com"))
        {
          return res.status(403).send({ message: "Please use our official Zillow Scraper API at https://docs.scrapingdog.io/zillow-scraper-api to scrape Zillow data." , status: 403});
        }
        if(url.hostname.includes("yelp.com"))
        {
          return res.status(403).send({ message: "Please use our official Yelp Scraper API at https://docs.scrapingdog.io/yelp-scraper-api to scrape Yelp data." , status: 403});
        }
        if(url.hostname.includes("linkedin.com"))
        {
          return res.status(403).send({ message: "We don't support Linkedin scraping yet." , status: 403});
        }
        if(url.hostname.includes("bing.com"))
        {
          return res.status(403).send({ message: "Stay tuned till we launch Bing Search API. For any queries, you can contact: darshan@scrapingdog.io" , status: 403});
        }
        if(req.query.premium == "true" && user.plan == "free"){
            return res.status(403).send({ message: "This service is only available for paid plan users." , status: 403});
        }
        if(req.query.render_js == "true" && user.plan == "free"){
            return res.status(403).send({ message: "This service is only available for paid plan users." , status: 403});
        }
        if(user.plan == "free" && req.query.country){
            return res.status(403).send({ message: "This service is only available for paid plan users." , status: 403});
        }
        const data = await getData(apiKey, req.query,res,req,user);
        if (data.status != 200) {
          return res.status(data.status).send(data); 
        }
        if(data.status == 200)
        {
          delete data.status;
          res.status(200).send(data.scraped_data);
       }
      } else {
        res.status(400).send({ message: "Please enter a valid URL or contact at darshan@scrapingdog.io if you keep getting this error." });
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
