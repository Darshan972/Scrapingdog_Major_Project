const unirest = require("unirest");
const cheerio = require("cheerio");
const selectRandom = require("../.././UserAgents")

const getLinkedInData = async(company,gl = "us",num,page) => {
    let employees_data = [], current = [] , nearNav = [], page_no=[], other_pages = [];
try
{
    let query = `site:${gl}.linkedin.com/in '${company}'`;
    if(gl == "us")
    {
        query = `site:linkedin.com/in '${company}'`;
    }
    let params = {
        q : query,
        gl,
        num,
        start: page,
        sourceid: "chrome",
        ie : "UTF-8"
      }
      Object.keys(params).forEach(key => {
        if (params[key] === "") {
          delete params[key];
        }
      });
      params = new URLSearchParams(params)
      params = params.toString();

const url = `https://www.google.com/search?`+params;

let user_agent = selectRandom();
let head = {
  "User-Agent": `${user_agent}`,
}
let countryName = "UnitedStates";
var getCountryNames = new Intl.DisplayNames(['en'], {type: 'region'});
try{
countryName = getCountryNames.of(gl.toUpperCase()).trim()
}
catch(e)
{
  countryName = "UnitedStates";
}

const response = await unirest
.get(url)
.headers(head)
.proxy(`http://dars29832dosm92375:QwArG7q6aTS48by7@isp2.hydraproxy.com:9989`);

console.log(response.status)

const $ = cheerio.load(response.body)

let title = [],position = [],about = [],link=[];
$(".g").each((i,el) => {
  title[i] = $(el).find(".DKV0Md").text();
  if(title[i].includes(" - LinkedIn") || title[i].includes(" | LinkedIn"))
  {
    title[i] = title[i].replace(" - LinkedIn" , "")
    title[i] = title[i].replace(" | LinkedIn", "")
    title[i] = title[i].replace(' profiles ', '')
    title[i] = title[i].replace('LinkedIn', '')
    title[i] = title[i].replace('"', '');
    title[i] = title[i].replace("&gt;" , '');
  }
  position[i] = $(el).find(".WZ8Tjf").text();
  about[i] = $(el).find(".lEBKkf").text();
  link[i] = $(el).find("a").attr("href")
})

for (let i = 0; i < title.length; i++) {
   employees_data.push({
    title: title[i],
    position: position[i],
    about: about[i],
    link: link[i]
   })
}

$(".AaVjTc").each((i,el) => {
    current[i] = $(el).find(".YyVfkd").text()
})
$(".d6cvqb").each((i,el) => {
    nearNav[i] = "https://www.google.com" +$(el).find("a").attr("href")
})


$(".AaVjTc td").each((i,el) => {
    page_no[i] = $(el).find("a.fl").text()
    other_pages[i] = "https://www.google.com" + $(el).find("a.fl").attr("href")
})

nearNav = nearNav.filter(x => x !== "https://www.google.comundefined")
other_pages = other_pages.filter(x => x !== "https://www.google.comundefined")
page_no = page_no.filter(x => x!== "")

if(response.status == 200)
{
    return [
            employees_data,
            current,
            page_no,
            other_pages
           ];
}
}
catch(e)
{
    console.log(e)
}
return [];
}
module.exports = getLinkedInData;