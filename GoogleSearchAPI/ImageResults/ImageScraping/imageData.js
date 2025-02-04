const unirest = require("unirest");
const cheerio = require("cheerio");
const selectRandom = require("../.././UserAgents");

const getImageData = async (
  query,
  gl = "us",
  hl = "en",
  ijn = 0,
  tbs = "",
  safe = "",
  nfpr = 0,
  uule = "",
  lr = "",
  duration = "",
  chips = "",
  sourceid = ""
) => {
  let html = "";
  let images_results = [],ads=[];
  try {
    let params = {
      q: query,
      oq: query,
      gl,
      ijn,
      lr,
      hl,
      nfpr,
      uule,
      tbm: "isch",
      as_qdr: duration,
      chips,
      tbs,
      safe,
    };
    Object.keys(params).forEach((key) => {
      if (params[key] === "") {
        delete params[key];
      }
    });
    params = new URLSearchParams(params);
    params = params.toString();


    const $ = cheerio.load(response.body);
    html = response.body;
    $("div.rg_bx").each((i, el) => {
      let link = $(el).find(".rg_meta").text();
      images_results.push({
        title: $(el).find(".iKjWAf .mVDMnf").text(),
        image: $(el).find(".rg_l .rg_ic").attr("src") ? $(el).find(".rg_l .rg_ic").attr("src") : $(el).find(".rg_l .rg_ic").attr("data-src"),
        source: $(el).find(".iKjWAf .FnqxG").text(),
        original: JSON.parse(link).ou,
        link: JSON.parse(link).ru,
        original_height: JSON.parse(link).oh,
        original_width: JSON.parse(link).ow,
        original_size: JSON.parse(link).os,
        is_product: $(el).find(".ewGfxe").length ? true : "",
        in_stock: $(el).find(".ewGfxe").length ? true : "", 
        rank: ijn == 0 ? i+1 : (i+1) + (100*ijn)
      })
    });

    for (let j = 0; j < images_results.length; j++) {
      Object.keys(images_results[j]).forEach(key => images_results[j][key] === undefined || images_results[j][key] === "" ? delete images_results[j][key] : {});
    }

    if (response.status == 200) {
      return [response.status, html,images_results,ads];
    }
  } catch (e) {
    let data = {};
    data = {
      message: "There was some error in procedding the request. Please contact darshan@scrapingdog.io if this error persists.",
      status: 500
    }
    console.log("Error in images scraper:" + e);
    return[500,data]
  }
  return [];
};
module.exports = getImageData;
