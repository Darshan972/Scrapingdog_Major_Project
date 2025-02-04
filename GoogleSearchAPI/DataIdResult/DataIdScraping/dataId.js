const unirest = require("unirest");
const cheerio = require("cheerio");
const selectRandom = require("../.././UserAgents")

const getDataId = async (query,gl) => {
  let obj1 = {};
  let obj2 = {};
  let arr = [];
  try {
    let scraping_url = "https://www.google.com/search?q=" + query+"&gl="+gl+"&sourceid=chrome&ie=UTF-8";
    let countryName = "UnitedStates";
    var getCountryNames = new Intl.DisplayNames(['en'], {type: 'region'});
    try{
    countryName = getCountryNames.of(gl.toUpperCase()).trim()
    }
    catch(e)
    {
      countryName = "UnitedStates";
    }
    let user_agent = selectRandom();
    let head = {
      "User-Agent": `${user_agent}`,
    }

      var data = {};
      data.status = 0;


    const $ = cheerio.load(data.body);
    obj2["dataId"] = $("span.hqzQac a").attr("data-fid");
    obj2["title"] = $(".I6TXqe h2").text()
    $("div.QsDR1c").each((i, el) => {
      if (i === 2) {
        return false;
      }
      let completestring = $(el).text().split(":");
      obj1[completestring[0]] = completestring[1];
      arr.push(obj1);
      obj1 = {};
    });
    arr.push(obj2);
    if (arr.length) {
      return arr;
    }
  } catch (e) {
    console.log(e);
  }
  return [];
};

module.exports = getDataId;
