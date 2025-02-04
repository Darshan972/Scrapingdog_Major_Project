const express = require("express");
const unirest = require("unirest")
const cheerio = require("cheerio");
const selectRandom = require("../UserAgents.js")
const User = require("../../models/auth.model");
const rateLimit = require("express-rate-limit");
const regexp = require("cors-anywhere/lib/regexp-top-level-domain.js");
const router = new express.Router();

const getData = async (apiKey, request, res, user) => {
  let data = [];
  let expired = false;

  const getFinanceData = async (
    query,
    hl = "en",
    api_key = ""
  ) => {
    let html = "",
      markets = {}
    try {


      let url = `https://www.google.com/finance/quote/${query}?hl=${hl}`;
      var response = {};
      response.status = 0;


      html = response.body;
      const $ = cheerio.load(response.body);      
    //   const regex = new RegExp(`/\<script nonce="[^"]+">AF_initDataCallback\({key: 'ds:\d{1,2}', hash: '\d{1,2}', data:\[\[\[\["${query.split(":")[0]}","${query.split(":")[1]}"].*?sideChannel: \{\}\}\);<\/script>`, "gm")


    //   let m;

    //   while ((m = regex.exec(html)) !== null) {
    //     // This is necessary to avoid infinite loops with zero-width matches
    //     if (m.index === regex.lastIndex) {
    //       regex.lastIndex++;
    //     }
        
    //     // The result can be accessed through the `m`-variable.
    //     m.forEach((match, groupIndex) => {
    //         console.log(`Found match, group ${groupIndex}: ${match}`);
    //     });
    // }


      $(".AHyjFe").each((i,el) => {
        markets[`${$(el).text()}`] = []
        $(".lkR3Y").each((j,elm) => {
            markets[`${$(el).text()}`].push({
               stock: $(elm).find("a").attr("href")?.replace("./quote/",""),
               link: $(elm).find("a").attr("href") ? "https://www.google.com/finance/quote" + $(elm).find("a").attr("href") : "",
               scrapingdog_link: $(elm).find("a").attr("href") ? `https://api.scrapingdog.io/finance?api_key=${api_key}&q=${$(elm).find("a").attr("href")?.replace("./quote/","")}&hl=${hl}` : "",
               name: $(elm).find(".pKBk1e").first().text(),
               price: $(elm).find(".YMlKec").first().text(),
               price_movement: {
                percentage: $(elm).find(".V7hZne").first().text(),
                value: $(elm).find(".BAftM .P2Luy").first().text(),
                movement: $(elm).find(".BAftM .P2Luy").first().text().includes("-") ? "down" : "up"
               }
            })
        })
      })

      let market_news = []

      $(".yY3Lee").each((i,el) => {
        market_news.push({
            link: $(el).find("a").attr("href"),
            snippet: $(el).find(".Yfwt5").text(),
            source: $(el).find(".sfyJob").text(),
            time: $(el).find(".Adak").text()
        })
      })

      let summary = {}

      summary.title = $(".zzDege").text();
      summary.stock = query.split(":")[0]
      summary.exchange = query.split(":")[1]
      summary.price = $(".fxKbKc").text()
      summary.extracted_price = parseFloat(summary.price?.substring(1)?.replace(/,/g, ""))
      let extracted_price = parseFloat(summary.price?.substring(1)?.replace(/,/g, ""))

      let previous_price = parseFloat(parseFloat($(".vvDK2c+ .gyFHrc .P6K39c").text()?.substring(1)?.replace(/,/g, "")).toFixed(2));
      let difference = parseFloat((extracted_price - previous_price).toFixed(2))
      percentage = (difference/previous_price)*100;
      summary.price_movement = {
        percentage: parseFloat(percentage.toFixed(2)),
        value: difference,
        movement: difference > 0 ? "Up" : "Down"
      }
      summary.time = $(".ygUjEc").text()?.split("·")[0]

      let knowledge_graph = {};
      let key_stats = {};

      key_stats.tags = [];

      $(".w2tnNd").each((i,el) => {
        key_stats.tags.push({
            title: $(el).text(),
            link: $(el).text() ? "https://www.finance.com/markets/" + $(el).text() : "",
        })
      })

      key_stats.stats = []

      $(".gyFHrc").each((i,el) => {
        key_stats.stats.push({
          label:  $(el).find(".mfs7Fc").text(),
          value: $(el).find(".P6K39c").text()
        })
      })

      knowledge_graph.key_stats = key_stats

      let about = [];
      $(".Yickn .sMVRZe").each((i,el) => {
        about.push({
         title: $(el).find(".joOfYc").text(),
         description: $(el).find(".bLLb2d").not("a").text()?.replace(/\n/g, ""),
         link_text: $(el).find(".bLLb2d .tBHE4e").text(),
         link: $(el).find(".bLLb2d .tBHE4e").attr("href")
        })
        let info = [];
        if($(el).find(".gyFHrc").length){
            $(el).find(".gyFHrc").each((i,el) => {
                info.push({
                    label: $(el).find(".mfs7Fc").text(),
                    value: $(el).find(".P6K39c").text(),
                    link: $(el).find("a.tBHE4e").length ? $(el).find("a.tBHE4e").attr("href") : ""
                })
            })
        }
        for (let j = 0; j < info.length; j++) {
            Object.keys(info[j]).forEach(key => info[j][key] === undefined || info[j][key] === "" ? delete info[j][key] : {});
          }
        about.push({
            info
        })
      })

      knowledge_graph.about = about

      let financials = [];

      $(".UulDgc .ECi4Zd").each((i,el) => {
        financials.push({
            title: $(el).find(".gjKCb").text(),
        })
        let results = []
        let table = [];
        $(el).find(".roXhBd").each((i,el) => {
            table.push({
                title: $(el).find(".rsPbEe").text(),
                value: $(el).find(".QXDnM").text(),
                change: $(el).find(".gEUVJe").text()
            })
        })
        table?.shift();
        results.push({
            date: $(el).find("#option-0 .VfPpkd-vQzf8d").last().text(),
            table
        })

        financials[i].results = results
    })

    let discover_more = [];
    let items = [];

    $(".RCcRmb").each((i,el) => {
        discover_more[i] = {}
        discover_more[i].title = $(el).text();
        if(discover_more[i].title.includes("You may be interested in")){
            const regex = /You may be interested in/;
            const substring = discover_more[i]?.title?.match(regex)[0];
            discover_more[i].title = substring
        }
    })


    $(".o5xQnf").each((i,el) => {
        $(el).find(".PieIgb").each((i,el) => {
            items.push({
                stock: $(el).find("a").attr("href")?.replace("./quote/",""),
                scrapingdog_link: $(el).find("a").attr("href") ? `https://api.scrapingdog.io/finance?api_key=${api_key}&q=${$(el).find("a").attr("href")?.replace("./quote/","")}&hl=${hl}` : "",
                name: $(el).find(".RwFyvf").text(),
                link: $(el).find("a").attr("href") ? "https://www.google.com/finance" + $(el).find("a").attr("href")?.replace(".","") : "",
                price: parseFloat($(el).find(".YMlKec").first().text()?.replace(/,/g,"")),
                price_movement: {
                 percentage: parseFloat($(el).find(".JwB6zf").first().text().replace("%","")),
                 movement: $(el).find("span.NydbP").attr("aria-label").includes("Down") ? "down" : "up"
                }
            })
        })
        discover_more[i].items = items
    })



     

      if (
        response.status == 200
      ) {
        return [
          response.status,
          html,
          markets,
          market_news,
          summary,
          knowledge_graph,
          financials,
          discover_more
        ];
      }
    } catch (error) {
      let data = {};
      data = {
        message: "There was some error in procedding the request. Please contact darshan@scrapingdog.io if this error persists.",
        status: 503
      }
      console.log("Error in finance scraper: " + error);
      return [503, data]
    }
    return [];
  };

  data = await getFinanceData(
    request.q,
    request.hl,
    request.api_key
  );

  let html, markets, market_news, summary, knowledge_graph, financials, discover_more;
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
  markets = data[2]
  market_news = data[3]
  summary = data[4]
  knowledge_graph = data[5]
  financials = data[6]
  discover_more = data[7]
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
    if (Object.keys(markets).length) {
      data.market = markets;
    }
    if(market_news.length !== 0){
        data.market_news = market_news
    }
    if(Object.keys(summary).length !== 0){
        data.summary = summary
    }
    if(Object.keys(knowledge_graph) !== 0){
        data.knowledge_graph = knowledge_graph
    }
    if(financials.length !== 0){
        data.financials = financials;
    }
    if(discover_more.length !== 0){
        data.discover_more = discover_more;
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
  "/finance",
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
