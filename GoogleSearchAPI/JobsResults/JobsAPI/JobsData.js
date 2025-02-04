const cheerio = require("cheerio");
const unirest = require("unirest");
const selectRandom = require("../../UserAgents");
const express = require("express");
const User = require("../../../models/auth.model");
const router = new express.Router();
const rateLimit = require("express-rate-limit");

  const getData = async (apiKey, request,res, user) => {
    let data = [];

    let expired = false;

    const getJobsData = async (q,uule = "",gl="us",hl="en",start=0,chips="",lrad="",res) => {
      try {
      
          let params = {
          q,
          gl,
          hl,
          chips,
          lrad,
          start: start,
          uule,
          sourceid: "chrome",
          ie : "UTF-8"
        }
  
        Object.keys(params).forEach(key => {
          if (params[key] === "") {
            delete params[key];
          }
        });
        params = new URLSearchParams(params)
        params = params.toString();
  
  
  
          let $ = cheerio.load(response.body);
  
          let html = response.body
  
          let jobs_results = [];
          $(".iFjolb").each((i,el) => {
              jobs_results.push({
                  title: $(el).find(".PUpOsf").text(),
                  company_name: $(el).find(".vNEEBe").text(),
                  location: $(el).find(".vNEEBe+ .Qk80Jf").text(),
                  via: $(el).find(".Qk80Jf+ .Qk80Jf").text(),
                  description: $(el).find(".HBvzbc").text()?.replace(/\n/g, ""),
                  url: $(el).find(".PwjeAc .KGjGe").attr("data-share-url")
              })
              if($(el).find(".KKh3md").length)
              {
                  jobs_results[i].extensions = [];
                  $(el).find(".KKh3md .LL4CDc").each((j,el) => {
                      jobs_results[i].extensions[j] = $(el).text()
                  })
                  jobs_results[i].extensions = jobs_results[i].extensions?.slice(jobs_results[i].extensions?.length/2)
              }
          })
  
          if (
            response.status == 200
          ) {
            return [
            response.status,html, jobs_results
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

      
    data = await getJobsData(request.q, request.uule,request.gl,request.hl, request.page, request.chips, request.lrad,res);


    let html, jobs_data;
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
    jobs_data = data[2]
   }
   else if(status == 503)
   {
    let response;
    response = data[1];
    return response;
   }
  
        user.requests = user.requests + 20;
        user.requestsLeft = user.quota - user.requests;
        user.apiCallsPerDay = user.apiCallsPerDay + 20;
  
        await user.save()

        if (request.html == "true") {
        let data = {}
        data.status = 200;
        data.html = html;
        return data;
      } else {
        Object.keys(request).forEach(key => {
          if (request[key] === "") {
            delete request[key];
          }
        });
        let data = {
          meta: request,
        };
        if (jobs_data.length) {
          data.jobs_results = jobs_data;
        }
        data.status = 200;
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
        return res.status(403).send({
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

router.get("/jobs", checkIP ,checkAPI, checkUser, limiter, async (req, res) => {
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    const user = await User.findById(apiKey)
    if (req.query.q.length) {
      const data = await getData(apiKey, req.query,res, user);
      if (data.status == 408 || data.status == 503) {
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
    } else {
      res.status(404).send({ message: "Please enter a valid query" });
    }
  }  catch (error) {
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
