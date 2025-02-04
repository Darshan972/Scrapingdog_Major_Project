const cheerio = require("cheerio")
const unirest = require("unirest")
const selectRandom = require("../.././UserAgents.js")


const getScholarData = async(query,cites,as_ylo,as_yhi,scisbd,cluster,hl="en",lr,start=0,num=10,as_sdt,safe,filter,as_vis,api_key) => {
try
{
  let html = "", current = [], nearNav = [], other_pages = [], page_no = [];
      let params = {
        q : query,
        cites,
        as_ylo,
        as_yhi,
        as_sdt,
        scisbd,
        cluster,
        lr,
        start,
        num,
        hl,
        safe,
        filter,
        as_vis,
        sourceid: "chrome",
        ie : "UTF-8",
      }
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] == undefined || params[key] == null) {
          delete params[key];
        }
      });

      params = new URLSearchParams(params)
      params = params.toString();
      let url = `https://scholar.google.com/scholar?` + params;

      var response = {};
      response.status = 0;


      html = response.body
      const $ = cheerio.load(response.body)

let scholar_results = [];

function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] == "") {
      delete obj[propName];
    }
  }
  return obj
}

let related_searches = [];



for (let i = 0; i < scholar_results.length; i++) {
    Object.keys(scholar_results[i]).forEach(key => scholar_results[i][key] === "" || scholar_results[i][key] === undefined ? delete scholar_results[i][key] : {});  
 }

current[0] = (start/10)+1


$("#gs_nml .gs_nma").each((i,el) => {
  page_no[i] = $(el).text()
  other_pages[i] = "https://www.scholar.google.com" + $(el).attr("href")
})

other_pages = other_pages.filter(x => x !== "https://www.scholar.google.comundefined")
page_no = page_no.filter(x => x!== "")

let page_num = page_no;

let op = [];

for (let i = 0; i < page_no.length; i++) {
  op[i] = `https://api.scrapingdog.io/scholar?api_key=${api_key}&q=${query}&page=${(page_no[i] - 1) * 10}`;
}

page_no = page_no?.reduce((obj, key, index) => {
  obj[key] = other_pages[index];
  return obj;
}, {});

const pagination = {
  current: current[0],
  page_no,
};

page_no = page_num;

page_no = page_no?.reduce((obj, key, index) => {
  obj[key] = op[index];
  return obj;
}, {});

const scrapingdog_pagination = {
  current: current[0],
  page_no,
};

 if (
  response.status==200
) {
  return [
    html,
    scholar_results,
    related_searches,
    pagination,
    scrapingdog_pagination
  ];
}
} catch (e) {
console.log(e);
}
return [];
};
module.exports = getScholarData;