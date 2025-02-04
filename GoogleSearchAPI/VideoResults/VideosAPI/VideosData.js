const express = require("express");
const User = require("../../../models/auth.model");
const selectRandom = require("../../UserAgents")
const router = new express.Router();
const rateLimit = require("express-rate-limit");
const unirest = require("unirest")
const cheerio = require("cheerio")

const getData = async (apiKey, request, res, user) => {
  const myData = [];
  let data = [];
  let expired = false;

  const getVideoData = async (
    query,
    gl = "us",
    page = 0,
    num = 10,
    hl = "en",
    nfpr = 0,
    uule = "",
    lr = "",
    duration = "",
    sourceid = "",
    tbs = "",
    safe = ""
  ) => {
    let html = "",
      current = [],
      nearNav = [],
      other_pages = [],
      page_no = [],
      video_results = [];
    try {
      query = encodeURI(query);
      if (sourceid == "mobile") {
        sourceid = "-mobile";
      }
      let params = {
        q : query,
        oq: query,
        gl,
        num,
        lr,
        start: page,
        hl,
        nfpr,
        uule,
        as_qdr: duration,
        sourceid: "chrome" +sourceid,
        ie : "UTF-8",
        tbm: "vid",
        tbs,
        safe
      }
      Object.keys(params).forEach(key => {
        if (params[key] === "") {
          delete params[key];
        }
      });
      params = new URLSearchParams(params)
      params = params.toString();
      let url = "https://www.google.com/search?" + params;
      
       let response = {};
       response.status = 0;

       async function timerr() {
        expired = true;
      }
      await res.setTimeout(40000, timerr)


  
      html = response.body;
  
      const patternForBase64 = /s='(?<img>[^']+)';\w+\s\w+=\['(?<id>\w+_\d+)'];/gm;    
      const patternForLinks = /"(?<id>[^":]+)":"(?<link>[^"]+)"/gm;                    
  
      const imagesWithBase64 = [...html.matchAll(patternForBase64)].map(({ groups }) => ({ id: groups.id, img: groups.img.replace(/\\x3d/g, "") }));
      const imagesWithLinks = [...html.matchAll(patternForLinks)].map(({ groups }) => ({ id: groups.id, link: groups.link }));
  
  
      const $ = cheerio.load(response.body);

  
      nearNav = nearNav.filter((x) => x !== "https://www.google.comundefined");
      other_pages = other_pages.filter(
        (x) => x !== "https://www.google.comundefined"
      );
      page_no = page_no.filter((x) => x !== "");
  
      if (response.status == 200) {
        return [
          200,
          html,
          video_results,
          current,
          nearNav,
          page_no,
          other_pages,
        ];
      }
    } catch (e) {
      let data = {};
      data = {
        message: "There was some error in procedding the request. Please contact darshan@scrapingdog.io if this error persists.",
        status: 503
      }
      console.log("Error in search scraper: "+ e);
      return [503, data]
    }
    return [];
  };

    data = await getVideoData(
      request.q,
      request.gl,
      request.page,
      request.num,
      request.hl,
      request.nfpr,
      request.uule,
      request.lr,
      request.duration,
      request.device,
      request.tbs,
      request.safe,
    );

 

   let html, video_results, current, nearNav, page_no, other_pages;

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
  html = data[1];
  video_results = data[2]
  current = data[3];
  nearNav = data[4]
  page_no = data[5]
  other_pages = data[6]
}
else if(status == 503)
{
let response;
response = data[1];
return response;
}  

  let op = [];

  for (let i = 0; i < page_no.length; i++) {
    let gl = request.gl;
    op[i] = `https://api.scrapingdog.io/videos?api_key=${apiKey}&q=${
      request.q
    }&gl=${gl ? gl : "us"}&page=${(page_no[i] - 1) * 10}`;
  }

  page_no = page_no.reduce((obj, key, index) => {
    obj[key] = other_pages[index];
    return obj;
  }, {});

  const pagination = {
    current: current[0],
    previous: nearNav[1],
    next: nearNav[0],
    page_no,
  };

  page_no = data[5];

  page_no = page_no.reduce((obj, key, index) => {
    obj[key] = op[index];
    return obj;
  }, {});

  const scrapingdog_pagination = {
    current: current[0],
    page_no,
  };

      if(!request.num)
      {
        user.requests = user.requests + 20;
        user.requestsLeft = user.quota - user.requests;
        user.apiCallsPerDay = user.apiCallsPerDay + 20;
      }
      else
      {
        user.requests = user.requests + 20*Math.ceil(request.num/10);
        user.requestsLeft = user.quota - user.requests;
        user.apiCallsPerDay = user.apiCallsPerDay + 20*Math.ceil(request.num/10);
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
      if (video_results.length) {
        data.video_results = video_results;
      }
      data.pagination = pagination;
      data.scrapingdog_pagination = scrapingdog_pagination;
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

router.get("/videos", checkIP ,checkAPI, checkUser, limiter, async (req, res) => {
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    const user = await User.findById(apiKey)
    if (req.query.q.length) {
      const data = await getData(apiKey, req.query, res, user);
      if (data.message) {
        res.status(429).send({ message: data.message });
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
    res.status(503).send({
      message:
        "Something went wrong . If you keep getting this error please mail us at darshan@scrapingdog.io.",
      success: false,
      status: 503,
    });
  }
});

module.exports = router;
