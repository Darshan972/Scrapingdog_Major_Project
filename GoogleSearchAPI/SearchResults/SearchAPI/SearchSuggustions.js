const express = require("express");
const User = require("../../../models/auth.model");
const cheerio = require("cheerio");
const unirest = require("unirest");
const rateLimit = require("express-rate-limit");
const selectRandom = require("../../UserAgents");
const router = new express.Router();

const getData = async (apiKey, request,res) => {
  let data = [];

    let expired = false;

    const searchSuggestions = async (query, hl = "en_us", gl = "us",res) => {
      try {
    
        let proxyArray = ["http://geonode_7yfD2HMrkO-autoReplace-True:5cd22103-de88-4dd6-bf98-99ae243a6d4f@premium-residential.geonode.com:9000","http://dars29832dosm92375:QwArG7q6aTS48by7@isp2.hydraproxy.com:9989"]; 
         let response = {};
         response.status = 0;
    
        //  let expired = false;
        //  setTimeout(() => {
        //    expired = true;
        //  }, 10*4000);
     
        async function timerr() {
          expired = true;
        }
        await res.setTimeout(40000, timerr)
    
        while(response.status != 200 && expired == false)
        {
          let user_agent = selectRandom();
          let head = {
            "User-Agent": `${user_agent}`,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1"
            }
        var randomNumber = Math.floor(Math.random() * proxyArray.length);
        proxy =  proxyArray[randomNumber];
        if(proxy == "https://app.scrapingbee.com/api/v1/?api_key=8LZN70YWC47XPNR5JE8M3P6IGFEIFVYCKWL770HLREU2TUCJRHYJB71Q1LV5VDZ8L7SMFMQWNGOW3GQ3&url=")
        {
          head = {
            "User-Agent": `${user_agent}`,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1"
              }
          // proxy = proxy + url + "&render_js=false&custom_google=true&forward_headers_pure=True"
          response = await unirest
          .get(url)
          .headers(head)
        }
        else if(proxy == "https://scraper.geonode.com/api/scraper/scrape/realtime")
        {
          let data = JSON.stringify({
            "url": `${url}`,
            "configurations": {
              "js_render": false,
              "response_format": "html",
              "mode": null,
              "waitForSelector": null,
              "device_type": null,
              "keep_headers": false,
              "debug": false,
              "country_code": null,
              "cookies": [],
              "localStorage": [],
              "HTMLMinifier": {
                "useMinifier": false
              },
              "optimizations": {
                "skipDomains": [],
                "loadOnlySameOriginRequests": true
              },
              "retries": {
                "useRetries": true,
                "maxRetries": 1
              }
            }
          });
          var username = 'geonode_7yfD2HMrkO'
          var password = '5cd22103-de88-4dd6-bf98-99ae243a6d4f'
          var str = `${username}:${password}`;
          const base64Str = Buffer.from(str, 'utf8').toString('base64');
          var config = {
            method: 'post',
            url: 'https://scraper.geonode.com/api/scraper/scrape/realtime',
            headers: { 
              'Authorization': `Basic ${base64Str}`, 
              'Content-Type': 'application/json'
            },
            data : data
          };
          response = await unirest.post(config.url).headers(config.headers).send(config.data);
        }
        else if(proxy == "https://api.scrapingdog.com/google?api_key=63655678cd36805b2cb76220&url=")
        {
          response = await unirest.get(proxy + url)
        }
        else if(proxy == "https://api.scrapingant.com/v2/general?x-api-key=9f5e3bcfe775475bb7128e9e85bed0d3&browser=false&url=")
        {
          response = await unirest.get(proxy + encodeURIComponent(url))
        }
        else{
           response = await unirest
           .get("https://www.google.com/complete/search?&hl=" +hl +"&q=" +query +"&gl=" +gl +"&client=chrome")
           .headers(head)
           .proxy(`${proxy}`)
        }
           console.log(response.status)
           if(response.status == 200)
           {
            break;
           }
           if(expired)
           {
            return;
           }
        }
        let data = JSON.parse(response.body);
    
        let suggestions = [];
        for (let i = 0; i < data[1].length; i++) {
          suggestions.push({
            value: data[1][i],
            relevance: data[4]["google:suggestrelevance"][i],
            type: data[4]["google:suggesttype"][i],
          });
        }
        const verbatimRvance = data[4]["google:verbatimrelevance"]
    
        if (
          response.status == 200
        ) {
          return [
          response.status,suggestions, verbatimRvance
          ];
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

    data = await searchSuggestions(request.q, request.hl, request.gl,res);


  let suggestions, verbatim_relevance, status;

  if(expired == true)
  {
    let data = {}
    data.status = 408;
    data.message = "Request Timed Out"
    return data;
  }
  else{
  status = data[0];
  }

if(status == 200)
{
  suggestions = data[1]
  verbatim_relevance = data[2]
 }
 else if(status != 200)
 {
  let response;
  response = data[1];
  return response;
 }


  Object.keys(request).forEach(key => {
    if (request[key] === "") {
      delete request[key];
    }
  });

    User.findById(apiKey, (err, user) => {
      user.requests = user.requests + 20;
      user.requestsLeft = user.quota - user.requests;
      user.apiCallsPerDay = user.apiCallsPerDay + 20;
      user.save((err) => {
        if (err) {
          //res.json("Field Not Updated")
          console.log("Error : " + err);
        }
      });
      //res.json("Field Updated")
    });
    let response = {};
    response.meta = request;
    response.suggestions = suggestions;
    response.verbatim_relevance = verbatim_relevance 
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
  message: "Too many requests, please try again.",
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

router.get("/autocomplete", checkIP ,checkAPI, checkUser ,limiter, async (req, res) => {
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    if (req.query.q.length) {
      const data = await getData(apiKey, req.query,res);
      if (data.status == 408 || data.status == 503) {
        return res.status(data.status).send(data); 
      }
      if(data.status == 200)
      {
        delete data.status;
        res.status(200).send(data);
     }
    } else {
      res.status(404).send({ message: "Please enter a valid query", status: 404 });
    }
  }  catch (error) {
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
