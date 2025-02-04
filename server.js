const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
var favicon = require("serve-favicon");
const User = require("./models/auth.model");
const nodecron = require("node-cron");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const unirest = require("unirest")
const getOrganicData = require("./GoogleSearchAPI/SearchResults/SearchAPI/OrganicData");
const getVideoData = require("./GoogleSearchAPI/VideoResults/VideosAPI/VideosData");
const getSearchSuggestions = require("./GoogleSearchAPI/SearchResults/SearchAPI/SearchSuggustions");
const getNewsData = require("./GoogleSearchAPI/NewsResults/NewsAPI/NewsData");
const getImageData = require("./GoogleSearchAPI/ImageResults/ImageAPI/ImageData");
const getDataId = require("./GoogleSearchAPI/DataIdResult/DataIdAPI/DataId")
const getReviewsData = require("./GoogleSearchAPI/ReviewsResults/ReviewsAPI/ReviewsData")
const getShoppingData = require("./GoogleSearchAPI/ShoppingResults/ShoppingAPI/ShoppingData");
const getProductData = require("./GoogleSearchAPI/ShoppingResults/ShoppingAPI/ProductData")
const getLeadbagData = require("./LeadbagAPI/leadbagAPI");
const getJobsData = require("./GoogleSearchAPI/JobsResults/JobsAPI/JobsData");
const getPostsData = require("./GoogleSearchAPI/PostResults/PostAPI/PostData")
const getScholarData = require("./GoogleSearchAPI/ScholarResults/ScholarAPI/OrganicScholar")
const getFinanceData = require("./GoogleSearchAPI/FinanceResults/FinanceAPI")
const getMapsData = require("./GoogleSearchAPI/MapsResults/MapsAPI/MapsData")
const getYelpData = require("./YelpSearchAPI/YelpAPI")
const getYelpOfficialData = require("./YelpSearchAPI/YelpAPI2")
const getLinkedInData = require("./LinkedInScraperAPI/LinkedInAPI/linkedInScraperAPI")
const getZillowData = require("./ZillowAPI/ZillowAPI")
const getAmazonSearchData = require("./AmazonAPI/AmazonScraperAPI")
const getWalmartData = require("./WalmartAPI/WalmartProductAPI")
const getAmazonProductData = require("./AmazonAPI/AmazonProductScraper")
const getBingData = require("./BingAPI/bingAPI.js")
const getReverseLookUpEmail = require("./ReverseLookupEmail/ReverseLookupEmailAPI")
const getScraperAPI = require("./Web Scraping API/WebScraperAPI")
const getCompanyData = require("./CompaniesAPI/companiesAPI")
const getAccountData = require("./AccountAPI/accountAPI");
const selectRandom = require("./GoogleSearchAPI/UserAgents")
const AWS = require("aws-sdk");



// Config dotev

require("dotenv").config({
  path: "./config/config.env",
});

const app = express();

// Connect to database
connectDB();

// body parser
// app.use(bodyParser.json({
//   // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
//   verify: function(req,res,buf) {
//       var url = req.originalUrl;
//       if (url.startsWith('/webhook')) {
//           req.rawBody = buf.toString()
//       }
//   }}));

app.use(bodyParser.json({
  verify: function (req, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith('/webhook')) {
          req.rawBody = buf.toString()
      }
  }
}));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Load routes
const authRouter = require("./routes/auth.route");
// const userRouter = require("./routes/user.route");
const stripeRouter = require("./routes/stripe.route");
const updateRouter = require("./routes/update.route");
const usageRouter = require("./routes/usage.route.js");
const creditsRouter = require("./routes/credits.route");

app.use(cors());
app.use(morgan("dev"));

// Use Routes
app.use(authRouter);
// app.use(userRouter);
app.use(stripeRouter);
app.use(updateRouter);
app.use(usageRouter);
app.use(creditsRouter);

app.use(getOrganicData);
app.use(getSearchSuggestions);
app.use(getVideoData);
app.use(getNewsData);
app.use(getReviewsData);
app.use(getDataId);
app.use(getImageData);
app.use(getShoppingData);
app.use(getProductData)
app.use(getLeadbagData);
app.use(getJobsData);
app.use(getPostsData)
app.use(getScholarData)
app.use(getMapsData)
app.use(getFinanceData)
app.use(getYelpData)
app.use(getYelpOfficialData)
app.use(getLinkedInData)
app.use(getZillowData)
app.use(getScraperAPI)
app.use(getAmazonSearchData)
app.use(getAmazonProductData)
app.use(getWalmartData)
app.use(getBingData)
app.use(getCompanyData)
app.use(getReverseLookUpEmail)
app.use(getAccountData);



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

      if(user.requests >= user.quota){
        return res.status(404).send({
          success: false,
          message: "You have used all request credits from your quota. Please update your plan to get more credits at https://scrapingdog.io/pricing"
        })
      }
      else
      {
        next();
      }
    } else {
      return res.status(404).send({
        success: false,
        message: "User not found or API key is wrong. Please register at https://api.scrapingdog.io/register to get your API Key.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).send({
      success: false,
      message: "User not found or API key is wrong. Please register at https://api.scrapingdog.io/register to get your API Key.",
    });
  }
};

app.get("/trends_autocomplete" , checkAPI, checkUser, limiter , async(req,res) => {
  

  const getTrendsAutocompleteData = async(query,hl) => {
    
    let suggestions = [];
    try{
    let user_agent = selectRandom();
    let header = {
      "User-Agent": `${user_agent}`,
    }

    var randomNumber = Math.floor(Math.random() * proxyArray.length);
    const proxy =  proxyArray[randomNumber];

    const response = await unirest.get(`https://trends.google.com/trends/api/autocomplete/${query}?hl=${hl}`)
    .headers(header)
    .proxy(`${proxy}`)

    console.log(response.status)

    let data = response.body
    data = data.replace(")]}',","")
    data = JSON.parse(data)
    if(data.default.topics.length)
    {
    suggestions = data.default.topics;
    for (let suggestion of suggestions) {
        suggestion.link = `https://trends.google.com/trends/explore?q=${query}`
    }
    }
    else
    {
      suggestions[0] = {}
      suggestions[0].mid = `${query}`;
      suggestions[0].title = `${query}`;
      suggestions[0].type = "Search term"
      suggestions[0].link = `https://trends.google.com/trends/explore?q=${query}`
    }
    if(suggestions.length)
    {
      return [suggestions];
    }
  }
  catch(e)
  {
    console.log("Error : " + e)
  }
  return [];
}

  const getData = async (apiKey, request) => {
    let data = [];
    let expired = false;
    setTimeout(() => {
      expired = true;
    }, 10 * 6000);
    while (data.length == 0 && !expired) {
      data = await getTrendsAutocompleteData(request.q, request.hl);
    }
  
    const suggestions = data[0];
    Object.keys(request).forEach(key => {
      if (request[key] === "") {
        delete request[key];
      }
    });
      
      User.findById(apiKey, (err, user) => {
        user.requests = user.requests + 1;
        user.requestsLeft = user.quota - user.requests;
        user.apiCallsPerDay = user.apiCallsPerDay + 1;
        user.save((err) => {
          if (err) {
            //res.json("Field Not Updated")
            console.log("Error : " + err);
          }
        });
        //res.json("Field Updated")
      });
      return {
        meta: request,
        suggestions,
      };
  };
  
  try {
    console.log(req.headers['x-real-ip'])
    const apiKey = req.query.api_key;
    if (req.query.q.length) {
      const data = await getData(apiKey, req.query);
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
    res.status(504).send({
      message:
        "Something went wrong . If you keep getting this error please mail us at darshan@scrapingdog.com.",
      success: false,
      status: 504,
    });
  }
})

// Dev Logginf Middleware
if (process.env.NODE_ENV === "production") {
  app.use(favicon(path.join(__dirname + '/build' , 'favicon.ico')))
  app.use(express.static(path.join(__dirname , "build")));
  app.get("/*" , function(req,res) {
    let ip = req.headers['x-real-ip'];
    if(ip === " 2401:4900:1b23:bb8b:5049:e1b:9fcf:db9e" || ip === "49.44.80.39" || ip === "2401:4900:51c2:bde8:248b:816:dec3:69c")
    {
      return res.status(400).send({message: "This email is not allowed to make request", success: false})
    }
    console.log(req.headers['x-real-ip'])
    res.sendFile(path.join(__dirname , "build" , "index.html"))
  })
}

  // app.use(function (req, res, next) {
  //   res.setHeader("Access-Control-Allow-Credentials", true);
  //   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  //   res.setHeader("X-Frame-Options", "sameorigin");
  //   res.setHeader(
  //     "Access-Control-Allow-Headers",
  //     "Origin, X-Requested-With, Content-Type, Accept, multipart/form-data"
  //   );
  //   res.setHeader(
  //     "Access-Control-Allow-Methods",
  //     "HEAD,GET,POST,DELETE,OPTIONS,PUT"
  //   );
  //   next();
  // });


let date_ob = new Date(); //initializing date






app.use((req, res) => {
  try {
    res.status(404).json({
      success: false,
      msg: "Page not founded",
    });
  } catch (e) {
    console.log(e);
    res.status(error.status || 500).send({
      error: {
        status: error.status || 500,
        message: error.message || "Internal Server Error",
      },
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
