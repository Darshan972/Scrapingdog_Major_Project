const express = require("express");
const User = require("../../../models/auth.model");
const unirest = require("unirest");
const cheerio = require("cheerio");
const selectRandom = require("../../UserAgents")
const router = new express.Router();
const rateLimit = require("express-rate-limit");

const getData = async (apiKey, request, res, user) => {
  let data = [];
  let expired = false;

  const getReviewsData = async (
    dataId,
    hl = "en",
    sort_by = "qualityScore",
    next_page_token = "",
    topic_id = ""
  ) => {
    let token = "",
      data_id = "",
      locationDetails,
      topics = [];
    const name = [],
      link = [],
      thumbnail = [],
      reviews = [],
      rating = [],
      duration = [],
      likes = [],
      snippet = [],
      visited = [],
      images = [];
  
    try {

      let response = {};
      response.status = 0;

      async function timerr() {
        expired = true;
      }

  
      const $ = cheerio.load(response.body);
      $(".gws-localreviews__google-review").each((i, el) => {
        name[i] = $(el).find(".TSUbDb").text();
  
        link[i] = $(el).find(".TSUbDb a").attr("href");
  
        thumbnail[i] = $(el).find(".lDY1rd").attr("src");
  
        reviews[i] = $(el).find(".Msppse").text();
  
        rating[i] = parseFloat($(el).find(".BgXiYe .lTi8oc").first().attr("aria-label")?.split("of ")[1]);
  
        duration[i] = $(el).find(".BgXiYe .dehysf").first().text();
  
        snippet[i] = $(el).find(".Jtu6Td").text();
  
        likes[i] = $(el).find(".QWOdjf").text();
  
        images[i] = $(el)
          .find(".EDblX .JrO5Xe")
          .toArray()
          .map($)
          .map(d => d.attr("style").substring(21 , d.attr("style").lastIndexOf(")")))
      });
      $(".na3Tfb").each((i, el) => {
        topics[i] = {
          keyword: $(el).find(".yxSNJ").text(),
          mentions: $(el).find(".fJ4aBd").text(),
        };
      });
      $(".lcorif").each((i, el) => {
        data_id = $(".loris").attr("data-fid");
        token = $(".gws-localreviews__general-reviews-block").attr(
          "data-next-page-token"
        );
        locationDetails = {
          title: $(".P5Bobd").text(),
          address: $(".T6pBCe").text(),
          avgRating: $("span.Aq14fc").text(),
          totalReviews: $("span.z5jxId").text(),
        };
      });
  
      if(topics.length)
      {
      topics.splice(0, 1);
      topics.splice(0, 1);
      }
      
      let localGuide = [], photos = [];
  
      for (let i = 0; i < reviews.length; i++) {
        if (reviews[i].includes("Local Guide")) {
          localGuide[i] = true;
          photos[i] = reviews[i].substring(
            reviews[i].indexOf("s") + 2,
            reviews[i].lastIndexOf("p") - 1
          );
          reviews[i] = reviews[i].substring(12, reviews[i].lastIndexOf("r") - 1);
        } else {
          localGuide[i] = false;
          photos[i] = reviews[i].substring(
            reviews[i].indexOf("s") + 2,
            reviews[i].lastIndexOf("p") - 1
          );
          reviews[i] = reviews[i].substring(0, reviews[i].lastIndexOf("r") - 1);
        }
      }
    
      let myData = [];
  
      for (let i = 0; i < name.length; i++) {
        myData.push({
          user: {
            name: name[i],
            link: link[i],
            thumbnail: thumbnail[i],
            localGuide: localGuide[i],
            reviews: parseFloat(reviews[i]),
            photos: parseFloat(photos[i]),
          },
          rating: rating[i],
          duration: duration[i],
          snippet: snippet[i],
          likes: parseFloat(likes[i].substring(0, likes[i].indexOf("L"))),
          images: images[i],
        });
      }
  
      if (response.status == 200) {
        return [
          200,
          locationDetails,
          topics,
         myData,
         token,
         dataId
        ];
      }
    } catch (error) {
      let data = {};
      data = {
        message: "There was some error in procedding the request. Please contact darshan@serpdog.io if this error persists.",
        status: 503
      }
      console.log("Error in reviews scraper: "+ error);
      return [503, data]
    }
    return [];
  };

    data = await getReviewsData(
      request.data_id,
      request.hl,
      request.sort_by,
      request.next_page_token,
      request.topic_id
    );
  

let locationDetails, topics, reviews, token, data_id;
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
locationDetails = data[1]
topics = data[2]
reviews = data[3]
token = data[4]
data_id = data[5]
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

    return {
      status: 200,
      location_info: locationDetails,
      topics: topics,
      reviews: reviews,
      pagination: {
        next: `https://api.serpdog.io/reviews?hl=en&next_page_token=${token}&data_id=${data_id}&api_key=${apiKey}`,
        next_page_token: token,
      },
    };
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

router.get("/reviews", checkIP ,checkAPI, checkUser ,limiter, async (req, res) => {
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    const user = await User.findById(apiKey)
    if (req.query.data_id.length) {
      const data = await getData(apiKey, req.query,res, user);
      if (data.status != 200) {
        return res.status(data.status).send(data); 
      }
      if(data.status == 200)
      {
        res.status(200).send(data);
      }
    } else {
      res.status(404).send({ message: "Please enter a valid query" });
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
