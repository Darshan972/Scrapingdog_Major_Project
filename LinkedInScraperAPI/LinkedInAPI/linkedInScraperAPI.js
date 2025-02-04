const express = require("express");
const User = require("../../models/auth.model");
const rateLimit = require("express-rate-limit");
const unirest = require("unirest")


const router = new express.Router();

const getData = async (apiKey, request, res, user) => {
  let data = [];
  let expired = false

  const getLinkedInData = async(type,linkId) => {
  
      try{
  
          let params = {
              type,
              linkId
            }
            
            let second_params = new URLSearchParams(params)
            second_params = second_params.toString();
  
      
            var response = {};
            response.status = 0;
            let API_URL = "https://api.scrapingdog.com/linkedin?api_key=63655678cd36805b2cb76220&";

            async function timerr() {
              expired = true;
            }
            await res.setTimeout(35000, timerr)
  
            while(response.status != 200 && expired == false)
            {
               response = await unirest
               .get(API_URL + second_params)
              
               console.log(response.status)
               if(response.status == 404)
               {
                break;
               }
               if(expired){
                break;
               }
            }
      
    if(response.status == 404)
    {
      let data = {};
      data = {
        message: "Sorry, we can't find that LinkedIn ID.",
        status: 404
      }
      return [404, data]
    }
     if(response.status == 200)
     {
      return [response.status, response.body]
     }
   } catch (error) {
     let data = {};
     data = {
       message: "There was some error in procedding the request. Please contact darshan@serpdog.io if this error persists.",
       status: 503
     }
     console.log("Error in search scraper: "+ error);
     return [503, data]
   }
   return [];
  };

    data = await getLinkedInData(
      request.type,
      request.id
    );

  let linkedin_data;

  let status = data[0];
  if(expired == true && status !== 200)
  {
    console.log("andar")
    let data = {}
    data.status = 408;
    data.message = "Request Timed Out"
    return data;
  }


if(status == 200)
{
  linkedin_data = data[1]
 }
 else if(status == 408 || status == 503 || status == 404)
 {
  let response;
  response = data[1];
  return response;
 }


      if(user.plan == "free" && user.quota == 100)
      {
        user.requests = linkedin_data.length ? user.requests + 30 : user.requests;
        user.requestsLeft =  user.quota - user.requests;
        user.apiCallsPerDay = linkedin_data.length ? user.apiCallsPerDay + 30 : user.apiCallsPerDay; 
      }
      if(user.plan == "free" && user.quota == 1000)
      {
        user.requests = linkedin_data.length ? user.requests + 300 : user.requests;
        user.requestsLeft =  user.quota - user.requests;
        user.apiCallsPerDay = linkedin_data.length ? user.apiCallsPerDay + 300 : user.apiCallsPerDay; 
      }
      else{
        user.requests = linkedin_data.length ? user.requests + 300 : user.requests;
        user.requestsLeft =  user.quota - user.requests;
        user.apiCallsPerDay = linkedin_data.length ? user.apiCallsPerDay + 300 : user.apiCallsPerDay; 
        }


        await user.save()
      // res.json("Field Updated")


      Object.keys(request).forEach(key => {
        if (request[key] === "") {
          delete request[key];
        }
      });
      let response = {}
      response.linkedin_data = linkedin_data;
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

const stoppedAPI = async(req,res) => {
  return res.status(403).send({message: "This API is temporarily stopped by us. If you want to access it, please contact at darshan@serpdog.io.", success: false})
}

router.get(
  "/linkedin",
  checkIP,
  stoppedAPI,
  checkAPI,
  checkUser,
  limiter,
  async (req, res) => {
    try {
      console.log(req.headers['x-real-ip'])
      const apiKey = req.query.api_key;
      const user = await User.findById(apiKey)
      if (req.query.type && req.query.id) {
        const data = await getData(apiKey, req.query, res, user);
        if (data.status == 408 || data.status == 503 || data.status == 404) {
          return res.status(data.status).send(data); 
        }
        if(data.status == 200)
        {
          delete data.status;
          res.status(200).send(data.linkedin_data);
       }
      } else {
        res.status(404).send({ message: "Please make a valid API request." });
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
  }
);

module.exports = router;
