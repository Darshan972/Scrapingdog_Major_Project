const express = require("express");
const User = require("../../../models/auth.model");
const rateLimit = require("express-rate-limit");
const coffee_json = require("../Search_Files/coffee.json")
const unirest = require("unirest");
const cheerio = require("cheerio");
const selectRandom = require("../../UserAgents");

const router = new express.Router();

const getData = async (apiKey, request,res, user) => {
  let data = [];
  let expired = false;

  const getOrganicData = async (query,gl = "us",page,num,hl = "en",nfpr,uule = "",lr = "",duration = "",sourceid = "",tbs="",safe="",api_key="") => {
    let html = "",current = [],nearNav = [],other_pages = [],page_no = [],knowledge_graph = {},shopping_results = [], popular_destinations = {} ,relatedSearches = [],peopleAlsoAskedFor = [],organic_results = [], inline_videos = [],  inline_images = [] , twitter_results = {},recipes_results = [],local_results = [],events_results = [], broaden_searches = [],answer_box = {},answer_box_list = [],top_stories=[],ads=[],inline_people_also_search_for = [], related_searches_boxes = [],top_sights = {},sports_results = {}  ,image_sizes = [], inline_images_related_searches = [], popular_products = [];
    let pagination, scrapingdog_pagination, search_information = {}, immersive_products = [];
    let proxy = "";
    try {
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
        tbs,
        safe,
        sourceid: "chrome" +sourceid,
        ie : "UTF-8",
      }
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] == undefined || params[key] == null) {
          delete params[key];
        }
      });
      params = new URLSearchParams(params)
      params = params.toString();
  
      //https://www.google.com/search?gl=us&ie=UTF-8&ei=Avd26BDDZtqyKuGGj5uDyj&&hl=en&q=steam%20drm&ved=nf2bfl8Cg01QxSeHMuCIF46fd8qzN8x3R5O2A80p&psi=IMmAjGrJ4LgUIW55lVr3zb
      let url = "https://www.google.com/search?" + params;
  

   
      if(response.status == 200)
      {
        let $ = cheerio.load(response.body);
        html = response.body;

        const pattern = /s='(?<img>[^']+)';\w+\s\w+=\['(?<id>\w+_\d+)'];/gm;
        const pattern2 = /\(function\(\)\{google\.lliod=true;google\.ldi=.*?;google\.pim/gm;
        const matches = html.matchAll(pattern2);
        let static_images;
        for (const match of matches) {
          if(match[0])
          {
          static_images = match[0]?.replace(/\(function\(\)\{google\.lliod=true;google\.ldi=./ , "{")?.replace(/;google\.pim/ , "")
          static_images = JSON.parse(static_images)
        }
      }

      if(static_images == undefined){
        static_images = {}
      }
        const images = [...html.matchAll(pattern)].map(({ groups }) => ({ id: groups.id, img: groups.img.replace('\\x3d', '') }))

        // search_information.organic_results_state = 
           search_information.total_results = $("#result-stats").text()
           search_information.query_displayed = $("#APjFqb").text()
           search_information.showing_results_for = $("div.card-section a b").text()
           search_information.organic_results_state = $(".card-section div").text()


      
      // if($(".g-blk .V3FYCf").length)
      // {
      //   organic_results.splice(0,1);
      // }
      
      //sports_results
      
  
      for (let j = 0; j < popular_products.length; j++) {
        Object.keys(popular_products[j]).forEach(key => popular_products[j][key] === undefined || popular_products[j][key] === "" ? delete popular_products[j][key] : {}); 
        }
  
      // let related_search_boxes = []
      // $(".iKt1P").each((i,el) => {
      //   related_search_boxes[i] = $(el).text()
      // })

      // console.log(related_search_boxes)
      
      // related_searches_boxes = related_searches_boxes.filter(function( element ) {
      //   return element !== '';
      // });
      
      //top_sights
      top_sights.categories = [];
      top_sights.sights = [];
      $(".IiH9Hf").each((i,el) => {
      let title = $(el).find(".xlY4q").text();
      let link = "https://www.google.com" + $(el).attr("href");
      top_sights.categories.push({
        title,link
      })
      })
  
      $(".nxmgsc").each((i,el) => {
        top_sights.sights.push({
          title: $(el).find(".OSrXXb").text(),
          link: "https://www.google.com" + $(el).attr("href"),
          description: $(el).find(".ZIF80").text(),
          rating: $(el).find(".WYGzTd").text(),
          reviews: $(el).find(".l6bSAe").text().substring(1,$(el).find(".l6bSAe").text().lastIndexOf(")")),
          thumbnail: $(el).find("img").attr("src"),
        })
      })
  
      $(".AaVjTc").each((i, el) => {
        current[i] = $(el).find(".YyVfkd").text();
      });
      $(".d6cvqb").each((i, el) => {
        nearNav[i] = "https://www.google.com" + $(el).find("a").attr("href");
      });
  
      $(".AaVjTc td").each((i, el) => {
        page_no[i] = $(el).find("a.fl").text();
        other_pages[i] =
          "https://www.google.com" + $(el).find("a.fl").attr("href");
      });
  
      nearNav = nearNav.filter((x) => x !== "https://www.google.comundefined");
      other_pages = other_pages.filter(
        (x) => x !== "https://www.google.comundefined"
      );
      page_no = page_no.filter((x) => x !== "");
  
  
    let page_num = page_no;
  
    let op = [];
  
    
    for (let i = 0; i < page_no.length; i++) {
      let gl2 = gl;
      op[i] = `https://api.scrapingdog.io/search?api_key=${api_key}&q=${query}&gl=${gl2 ? gl2 : "us"}&page=${(page_no[i] - 1) * 10}`;
      op[i] = op[i].replace(/ /g, '+')
    }
  
    page_no = page_no?.reduce((obj, key, index) => {
      obj[key] = other_pages[index];
      return obj;
    }, {});
  
    pagination = {
      current: current[0],
      previous: nearNav[1],
      next: nearNav[0],
      page_no,
    };
  
    page_no = page_num;
  
    page_no = page_no?.reduce((obj, key, index) => {
      obj[key] = op[index];
      return obj;
    }, {});
  
    scrapingdog_pagination = {
      current: current[0],
      page_no,
    };
  
    for (let i = 0; i < organic_results.length; i++) {
      organic_results[i].rank = i+1
    }
      
   }
  
      if (
        response.status == 200
      ) {
        return [
          response.status,
          html,
          organic_results,
          answer_box,
          events_results,
          twitter_results,
          inline_videos,
          recipes_results,
          local_results,
          relatedSearches,
          peopleAlsoAskedFor,
          pagination,
          scrapingdog_pagination,
          top_stories,
          inline_images,
          ads,
          answer_box_list,
          popular_destinations,
          broaden_searches,
          inline_people_also_search_for,
          top_sights,
          shopping_results,
          knowledge_graph,
          sports_results,
          image_sizes,
          inline_images_related_searches,
          popular_products,
          search_information,
          immersive_products
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
  
  
    data = await getOrganicData(
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
      request.api_key,
    );


  let html, search_information,organic_results,answer_box,events_results,twitter_results,inline_videos,recipes_results,local_results, relatedSearches, peopleAlsoAskedFor,
  pagination, scrapingdog_pagination, top_stories, inline_images, ads, answer_box_list, popular_destinations, broaden_searches, inline_people_also_search_for,
  top_sights, shopping_results, image_sizes, inline_images_related_searches, popular_products, immersive_products ;

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
  organic_results = data[2];
  answer_box = data[3];
  events_results = data[4];
  twitter_results = data[5];
  inline_videos = data[6];
  recipes_results = data[7]
  local_results = data[8]
  relatedSearches = data[9];
  peopleAlsoAskedFor = data[10];
  pagination = data[11];
  scrapingdog_pagination = data[12];
  top_stories = data[13];
  inline_images = data[14];
  ads = data[15];
  answer_box_list = data[16];
  popular_destinations = data[16];
  broaden_searches = data[18];
  inline_people_also_search_for = data[19];
  top_sights = data[20];
  // const related_searches_boxes = data[22];
  shopping_results = data[21];
  knowledge_graph = data[22];
  sports_results = data[23];
  image_sizes = data[24];
  inline_images_related_searches = data[25];
  popular_products = data[26];
  search_information = data[27]
  immersive_products = data[28]
 }
 else if(status == 408 || status == 503)
 {
  response = data[1];
  return response;
 }


      if(!request.num)
      {
        user.requests = organic_results.length ? user.requests + 20 : user.requests;
        user.requestsLeft =  user.quota - user.requests;
        user.apiCallsPerDay = organic_results.length ? user.apiCallsPerDay + 20 : user.apiCallsPerDay;
      }
      else
      {
        user.requests = organic_results.length ? user.requests + 20*Math.ceil((organic_results.length)/10) : user.requests;
        user.requestsLeft = user.quota - user.requests;
        user.apiCallsPerDay = organic_results.length ? user.apiCallsPerDay + 20*Math.ceil((organic_results.length)/10) : user.apiCallsPerDay;
      }
      await user.save()


    if (request.html == "true") {
      let data = {};
      data.status = 200;
      data.html = html;
      return data;
    } else {
      Object.keys(request).forEach(key => {
        if (request[key] === "") {
          delete request[key];
        }
      });
      request.q = request.q.replace("\"", "")
      let data = {
        meta: request,
      };
        if(Object.keys(search_information).length !== 0){
          data.search_information = search_information
        }
       if(image_sizes.length)
       {
        data.image_sizes = image_sizes
       }
       if(Object.keys(sports_results).length !== 0)
       {
        data.sports_results = sports_results
       }
       if(broaden_searches.length)
       {
        data.broaden_searches = broaden_searches
       }
       if(inline_people_also_search_for.length)
       {
        data.inline_people_also_search_for = inline_people_also_search_for;
       }
       if(top_sights.categories.length)
       {
        data.top_sights = top_sights
       }
       if(ads.length){
        data.ads = ads;
       }
       if(shopping_results.length)
       {
        data.shopping_results = shopping_results
       }
       if(immersive_products.length){
        data.immersive_products = immersive_products
       }
       if(popular_products.length)
       {
        data.popular_products = popular_products;
       }
       if(Object.keys(knowledge_graph).length !== 0)
       {
        data.knowledge_graph = knowledge_graph
       }
       if(events_results.length)
       {
        data.events_results = events_results
       }
       if(top_stories.length)
       {
        data.top_stories = top_stories
       }
       if(inline_images.length)
       {
        data.inline_images = inline_images;
       }
       if(inline_images_related_searches.length)
       {
        data.inline_images_related_searches = inline_images_related_searches
       }
      if(twitter_results.tweets.length)
      {
        data.twitter_results = twitter_results
      }
      if(inline_videos.length)
      {
        data.inline_videos = inline_videos
      }
      if(local_results[1])
      {
        data.local_results = local_results
      }
      if(recipes_results.length)
      {
        data.recipes_results = recipes_results
      }
      if(popular_destinations.length)
      {
        data.popular_destinations = popular_destinations;
      }

      if (peopleAlsoAskedFor.length) {
        data.peopleAlsoAskedFor = peopleAlsoAskedFor;
      }
      if(answer_box_list.length)
      {
        data.answer_box_list = answer_box_list;
      }

      if(Object.keys(answer_box).length !== 0)
      {
        data.answer_box = answer_box
      }
      // if(related_searches_boxes.length)
      // {
      //   data.related_searches_boxes = related_searches_boxes;
      // }
      data.organic_results = organic_results;
      if(relatedSearches.length)
      {
        data.relatedSearches = relatedSearches;
      }
      if(Object.keys(pagination).length !== 0)
      {
        data.pagination = pagination
      }
      if(Object.keys(scrapingdog_pagination).length !== 0)
      {
        data.scrapingdog_pagination = scrapingdog_pagination;
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
// const returnError = (req,res) => {
//   return res.status(504).send({
//     success: false,
//     message: "API under maintainance",
//   });
// }

router.get(
  "/search",
  checkIP,
  checkAPI,
  checkUser,
  limiter,
  async (req, res) => {
    try {
      console.log(req.headers['x-real-ip'])
      const apiKey = req.query.api_key;
      const user = await User.findById(apiKey)
      if (req.query.q.length) {
        const data = await getData(apiKey, req.query,res,user);
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
