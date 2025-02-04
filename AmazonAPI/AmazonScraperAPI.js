const express = require("express");
const unirest = require("unirest")
const cheerio = require("cheerio");
const selectRandom = require("../GoogleSearchAPI/UserAgents.js")
const User = require("../models/auth.model.js");
const rateLimit = require("express-rate-limit");
const router = new express.Router();
const url = require('url');

const getData = async (apiKey, request, res, user) => {
  let data = [];
  let expired = false;

  const getAmazonData = async (
        url
  ) => {
    let html = "";
    try {

      const parsedUrl = new URL(url);

      var response = {};
      response.status = 0;

      html = response.body;
      const $ = cheerio.load(response.body);

    //   let filters = [];

    //   $("#deliveryRefinements").each((i,el) => {
    //     $(el).find(".puis-bold-weight-text").each((i,el) => {
    //         filters.push({
    //             title: $(el).text()
    //         })
    //     })
    //     let options = [];
    //     $(el).find("ul li").each((i,el) => {
    //         options.push({
    //             text: $(el).attr("aria-label"),
    //             link: $(el).find("a").attr("href") 
    //         })
    //     })
    //     filters[i].options = options 
    // })

      let results = [];

      $(".s-widget-spacing-small .sg-col-inner").each((i,el) => {
        results.push({
            type: "search_product",
            positon: i+1,
            title: $(el).find(".a-color-base.a-text-normal").text().trim(),
            image: $(el).find(".s-image").attr("src"),
            has_prime: $(el).find(".s-align-children-center .s-image-logo-view").length ? true : false,
            is_best_sellet: $(el).find(".a-badge-text").text() == "Best Seller" ? true : false,
            is_amazon_choice: $(el).find(".a-badge-text").text() == "Amazon's Choice" ? true : false,
            is_amazon_choice: $(el).find(".a-badge-text").text() == "Limited time deal" ? true : false,         
            stars: parseInt($(el).find(".a-icon-alt").text()?.split(" ")[0]),
            total_reviews: $(el).find(".s-link-style .s-underline-text").text(),
            url: `https://${parsedUrl.host}` + $(el).find("a.a-link-normal").attr("href"),
            availability_quantity: parseInt($(el).find(".s-align-children-center+ .a-color-secondary").text()),
            price_string: $(el).find(".a-price-symbol").text() + $(el).find(".a-price-whole").text(),
            price_symobol: $(el).find(".a-price-symbol").text(),
            price: parseInt($(el).find(".a-price-whole").text().replace(/,/g,""))
        })
      })

      for (let i = 0; i < results.length; i++) {
        Object.keys(results[i]).forEach(key => results[i][key] === "" || results[i][key] === undefined ? delete results[i][key] : {});  
       }

      let pagination = [];

      let qid = new URL(`https://${parsedUrl.host}` + $(".s-pagination-button").attr("href"))
      qid = new URLSearchParams(qid.search)

      qid = qid.get("qid")

      let pagination_length = parseInt($(".s-pagination-ellipsis+ .s-pagination-disabled").text())
      let current_page = parseInt($(".s-pagination-selected").text())

      let get_params = new URL(url)
      get_params = new URLSearchParams(get_params.search)

      get_params = get_params.get("k")
      
      for (let i = 0; i < pagination_length; i++) {
        pagination[i] = `${url.split("?")[0]}?${get_params}&page=${current_page+1}&qid=${qid}&ref=sr_pg_${current_page+1}`
        pagination[i] = pagination[i].replace(/ /g , "+")
        current_page++;
      }

    if (
        response.status == 200
      ) {
        return [
          response.status,
          html,
          results,
          pagination
        ];
      }
    } catch (error) {
      let data = {};
      data = {
        message: "There was some error in procedding the request. Please contact darshan@scrapingdog.io if this error persists.",
        status: 503
      }
      console.log("Error in search scraper: " + error);
      return [503, data]
    }
    return [];
  };

  data = await getAmazonData(
    request.url
  );

  let html,results,pagination;
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
  results = data[2];
  pagination = data[3]
}
else if(status == 503)
{
let response;
response = data[1];
return response;
}



      user.requests = user.requests + 1;
      user.requestsLeft = user.quota - user.requests;
      user.apiCallsPerDay = user.apiCallsPerDay + 1;

      await user.save()
    //res.json("Field Updated")

  if (request.html == "true") {
    let data = {}
    data.status = 200
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
    data.status = 200
    if(results.length)
    {
      data.results = results
    }
    if(Object.keys(pagination).length !== 0)
    {
      data.pagination = pagination
    }
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
      if (user.email.includes("loca") || user.email.includes("loka") || user.email.includes("rus") || user.email.includes("cife") || user.email.includes("yopmail")) {
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
// const returnError = (req,res) => {
//   return res.status(504).send({
//     success: false,
//     message: "API under maintainance",
//   });
// }

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
  "/amazon_search",
  checkIP,
  checkAPI,
  checkUser,
  limiter,
  async (req, res) => {
    try {
      console.log(req.headers['x-real-ip'])
      const apiKey = req.query.api_key;
      const user = await User.findById(apiKey)
      if (req.query.url.length) {
        const amazonSearchRegex = /^https?:\/\/(www\.)?amazon\.[a-z]{2,3}(\.[a-z]{2})?\/s\?.*k=[^&\s]+.*$/;
        if(amazonSearchRegex.test(req.query.url)){
        const data = await getData(apiKey, req.query, res, user);
        if (data.status == 408 || data.status == 503) {
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
      }
      else{
        res.status(404).send({ message: "Please enter a valid URL" });
      } 
    }
    else {
        res.status(404).send({ message: "Please enter a valid URL" });
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
