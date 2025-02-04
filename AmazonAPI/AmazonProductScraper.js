const express = require("express");
const unirest = require("unirest")
const cheerio = require("cheerio");
const selectRandom = require("../GoogleSearchAPI/UserAgents.js")
const User = require("../models/auth.model.js");
const rateLimit = require("express-rate-limit");
const router = new express.Router();

const getData = async (apiKey, request, res, user) => {
  let data = [];
  let expired = false;

  const getAmazonData = async (
        asin, domain = "com"
  ) => {
    let html = "";
    try {

      const url = `https://amazon.${domain}/dp/${asin}`

      var response = {};
      response.status = 0;


      html = response.body;
      const $ = cheerio.load(response.body);


      let product_results = {};

      product_results.title = $("#title").text().trim();


      let arr1 = [];
      $(".prodDetSectionEntry").each((i,el) => {
        arr1[i] = $(el).text().trim()
      })

      let arr2 = [];
      $("#productDetails_detailBullets_sections1 tbody tr td").each((i,el) => {
        arr2[i] = $(el).text().trim();
        if($(el).find("#averageCustomerReviews").length){
            arr2[i] = {}
                arr2[i].ratings_count = $(el).find("#acrCustomerReviewText").text().trim()
                arr2[i].stars = $(el).find(".a-color-base").text().trim()
        }
      })


      let product_information = {};

      arr1.forEach((key, index) => {
        product_information[key] = arr2[index];
      });

      product_results.product_information = product_information

      product_results.brand = $("#bylineInfo").text().trim();
      product_results.brand_url = $("#bylineInfo").attr('href')
      product_results.description = $("#productDescription span").text().trim();
      product_results.price = $(".a-price .a-offscreen").first().text().trim()

      product_results.list_price = $(".a-price.a-text-price span.a-offscreen").text().trim()

      product_results.shipping_info = $("#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-link-normal").first().text().trim()
      product_results.availability_status = $("#availability").text().trim()

      let images = html.match(/"hiRes":"(.+?)"/g).map(match => match.slice(9, -1));

      product_results.images = images

      product_results.product_category = $("#wayfinding-breadcrumbs_feature_div .a-size-small").text()?.replace(/\n/g, "").replace(/\s+/g, " ").trim()

      product_results.average_rating = $("#acrPopover .a-color-base").first().text().trim()

      let feature_bullets = []

      $("#feature-bullets li").each((i,el) => {
        feature_bullets[i] = $(el).text().trim()
      })

      product_results.feature_bullets = feature_bullets;

      product_results.total_reviews = $("#acrCustomerReviewText").first().text().trim()

      product_results.total_answered_questions = $("#askATFLink .a-size-base").text().trim()

      let color = [];

      $(".imageSwatches li").each((i,el) => {
        color.push({
            is_selected: $(el).attr("data-dp-url") ? false : true,
            url: $(el).attr("data-dp-url") ? `https://www.amazo.${domain}/${$(el).attr("data-dp-url")}` : "",
            value: $(el).find("img").attr("alt"),
            image: $(el).find("img").attr("src")
        })
      })

      let size = [];

      $("#variation_size_name li").each((i,el) => {
        size.push({
            is_selected: $(el).attr("data-dp-url") ? false : true,
            url: $(el).attr("data-dp-url") ? `https://www.amazo.${domain}/${$(el).attr("data-dp-url")}` : "",
            value: $(el).find(".twisterTextDiv").text().trim()
        })
      })

      let style = [];

      $("#variation_style_name li").each((i,el) => {
        style.push({
            is_selected: $(el).attr("data-dp-url") ? false : true,
            url: $(el).attr("data-dp-url") ? `https://www.amazo.${domain}/${$(el).attr("data-dp-url")}` : "",
            value: $(el).find(".twisterTextDiv").text().trim()
        })
      })

      product_results.customization_options = {};
      product_results.customization_options.color = color;
      product_results.customization_options.size = size;
      product_results.customization_options.style = style;

      product_results.merchant_info = $("#merchant-info").text()?.replace(/\n/g, "")?.replace(/\s+/g, "").trim()
      product_results.ships_from = $("div.tabular-buybox-text[tabular-attribute-name = 'Ships from']").text()?.replace(/\n/g, "")?.replace(/\s+/g, "").trim()
      product_results.sold_by = $("div.tabular-buybox-text[tabular-attribute-name = 'Sold by']").first().text()?.replace(/\n/g, "")?.replace(/\s+/g, "").trim()



    if (
        response.status == 200
      ) {
        return [
          response.status,
          html,
          product_results,
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
    request.asin,
    request.domain,
  );

  let html,product_results;
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
  product_results = data[2];
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

    await user.save();

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
    if(Object.keys(product_results).length !== 0)
    {
      data.product_results = product_results
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
        return res.status(403).send({
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
  "/amazon_product",
  checkIP,
  checkAPI,
  checkUser,
  limiter,
  async (req, res) => {
    try {
      console.log(req.headers['x-real-ip'])
      const apiKey = req.query.api_key;
      let user = await User.findById(apiKey)
      if (req.query.asin.length) {
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
    else {
        res.status(404).send({ message: "Please enter a valid Amazon Product ID." });
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
