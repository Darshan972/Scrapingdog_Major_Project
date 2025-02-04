const unirest = require("unirest");
const cheerio = require("cheerio");
const selectRandom = require("../GoogleSearchAPI/UserAgents");
const validator = require("validator");

const getLinkedInData = async(domain) => {
try
{
    let query = `site:linkedin.com/in "${domain}"`;

let user_agent = selectRandom();
let head = {
  "User-Agent": `${user_agent}`,
}

const getParseData = async(page) => {

  let employees_data = [];

  let params = {
      q : query,
      num: 100,
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

    
let url = `https://www.google.com/search?`+params;

const makeRequest = async(q) => {
params.q = q;
url = `https://www.google.com/search?`+params
let response = {};
response.status = 0;
while(response.status !== 200)
{
response = await unirest
.get(url)
.headers(head)
.proxy("http://geonode_7yfD2HMrkO-autoReplace-True:5cd22103-de88-4dd6-bf98-99ae243a6d4f@premium-residential.geonode.com:9000")

console.log(response.status)
 }
 return response;
}

let response = await makeRequest(query)

let $ = cheerio.load(response.body)

if($(".g").length == 0)
{
  params.q = `site:www.linkedin.com/in "${domain}"`;
  response = await makeRequest(params.q);
  $ = cheerio.load(response.body)
  if($(".g").length == 0)
  {
    return [];
  }
}

let title = [],position = [],link=[];
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
title[i] = title[i].substring(0,title[i].indexOf("-")).trim()
position[i] = $(el).find(".WZ8Tjf").text();
position[i] = position[i].substring(position[i].indexOf("·")+1,position[i].lastIndexOf("·")).trim()
link[i] = $(el).find("a").attr("href")
})

for (let i = 0; i < title.length; i++) {
 employees_data.push({
  title: title[i],
  position: position[i],
  link: link[i]
 })
}

for (let j = 0; j < employees_data.length; j++) {
  Object.keys(employees_data[j]).forEach(key => employees_data[j][key] === undefined || employees_data[j][key] === "" ? delete employees_data[j][key] : {});
}

if($("#pnnext").length)
{
  console.log("hello")
employees_data = await getParseData(page+10);
}

return employees_data;

}

const permutator = (employees_data,domain) => {
 let length = employees_data.length;
 const firstName = employees_data[0].title.split(" ")[0].trim();
 const lastName = employees_data[1].title.split(" ")[1].trim();
 const permuataions = [
  `${firstName}@${domain}`,
  `${lastName}@${domain}`,
  `${firstName}${lastName}@${domain}`,
  `${firstName}.${lastName}@${domain}`,
  `${firstName.substring(0,1)}${lastName}@${domain}`,
  `${firstName.substring(0,1)}.${lastName}@${domain}`,
  `${firstName}${lastName.substring(0,1)}@${domain}`,
  `${firstName}.${lastName.substring(0,1)}@${domain}`,
  `${firstName.substring(0,1)}${lastName.substring(0,1)}@${domain}`,
  `${firstName.substring(0,1)}.${lastName.substring(0,1)}@${domain}`,
  `${lastName}${firstName}@${domain}`,
  `${lastName}.${firstName}@${domain}`,
  `${lastName}${firstName.substring(0,1)}@${domain}`,
  `${lastName}.${firstName.substring(0,1)}@${domain}`,
  `${lastName.substring(0,1)}${firstName}@${domain}`,
  `${lastName.substring(0,1)}.${firstName}@${domain}`,
  `${lastName.substring(0,1)}${firstName.substring(0,1)}@${domain}`,
  `${lastName.substring(0,1)}.${firstName.substring(0,1)}@${domain}`,
  `${firstName}-${lastName}@${domain}`,
  `${firstName.substring(0,1)}-${lastName}@${domain}`,
  `${firstName}-${lastName.substring(0,1)}@${domain}`,
  `${firstName.substring(0,1)}-${lastName.substring(0,1)}@${domain}`,
  `${lastName}-${firstName}@${domain}`,
  `${lastName}-${firstName.substring(0,1)}@${domain}`,
  `${lastName.substring(0,1)}-${firstName}@${domain}`,
  `${lastName.substring(0,1)}-${firstName.substring(0,1)}@${domain}`,
  `${firstName}_${lastName}@${domain}`,
  `${firstName.substring(0,1)}_${lastName}@${domain}`,
  `${firstName}_${lastName.substring(0,1)}@${domain}`,
  `${firstName.substring(0,1)}_${lastName.substring(0,1)}@${domain}`,
  `${lastName}_${firstName}@${domain}`,
  `${lastName}_${firstName.substring(0,1)}@${domain}`,
  `${lastName.substring(0,1)}_${firstName}@${domain}`,
  `${lastName.substring(0,1)}_${firstName.substring(0,1)}@${domain}`
   ]
   for (let i = 0; i < permuataions.length; i++) {
    permuataions[i] = validator.isEmail() ? permuataions[i] : ""; 
   }
   permuataions = permuataions.filter(function (el) {
    return el != null;
  });

}

const employees_data = await getParseData(0);


if(employees_data.length)
{
 permutator(employees_data,domain);
}

return employees_data;

}
catch(e)
{
    console.log(e)
}
return [];
}
module.exports = getLinkedInData;