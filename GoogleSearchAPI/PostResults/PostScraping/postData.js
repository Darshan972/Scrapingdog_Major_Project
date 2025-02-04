const unirest = require("unirest");
const selectRandom = require("../.././UserAgents")

const getPostsData = async (
  data_id,
  gl = "us",
  hl = "en",
  next_page_token
) => {
  let html = "";

  try {


    let response = {};
    response.status = 0;



    let data = {};

    html = response.body;
    html = html.replace(")]}'\n","")
    html = JSON.parse(html)

    if(response.status == 200 && html.length != 0)
    {

    let token = html[1] ? html[1].replace("/","-").replace("+","-").replace("*","-") : ""

    let name = html[0] ? html[0][0][0] : ""
    let logo = html[0] ? html[0][0][1] : ""
    let post_data = [];
    let description = [], date = [], image = [], link = [];




    for (let j = 0; j < post_data.length; j++) {
      Object.keys(post_data[j]).forEach(key => post_data[j][key] === undefined || post_data[j][key] === "" ? delete post_data[j][key] : {});
    }

    data.location_details = {}
    data.location_details.name = name;
    data.location_details.logo = logo;

    data.post_data = post_data;

    data.next_page_token = token
  }

     if(html.length == 0)
     {
      data = {}
      return [
        data = {
        message: "No more posts.",
        status: 400
       }
      ]
     }
    else if (response.status == 200) {
      data.status = 200;
      return [
        data
      ];
    }
    else if(response.status == 400){
      data = {};
      return[
         data = {
          message: "Invalid Requst. Please try again.",
          status: 400
         }
      ]
    }
  } catch (e) {
    console.log("Error: " + e);
  }
  return [
    data = {
      message: "Invalid Requst. Please try again.",
      status: 400
     }
  ];
 };

module.exports = getPostsData;
