const cheerio = require("cheerio");
const unirest = require("unirest");
const selectRandom = require("../../UserAgents");

    const getJobsData = async (q,uule = "",gl="us",hl="en",start=0,chips="",lrad="",res) => {
    try {
    
        let params = {
        q,
        gl,
        hl,
        chips,
        lrad,
        start: start,
        uule,
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



        let $ = cheerio.load(response.body);

        let html = response.body
        let jobs_results = [];
        $(".iFjolb").each((i,el) => {
            jobs_results.push({
                title: $(el).find(".PUpOsf").text(),
                company_name: $(el).find(".vNEEBe").text(),
                location: $(el).find(".vNEEBe+ .Qk80Jf").text(),
                via: $(el).find(".Qk80Jf+ .Qk80Jf").text(),
                description: $(el).find(".HBvzbc").text(),
                url: $(el).find("div.KGjGe").attr("data-jsname")
            })
            if($(el).find(".KKh3md").length)
            {
                jobs_results[i].extensions = [];
                $(el).find(".KKh3md .LL4CDc").each((j,el) => {
                    jobs_results[i].extensions[j] = $(el).text()
                })
            }
            if($(el).find("div.PwjeAc").length)
            {
              console.log(true)
            }
        })


        if (
          response.status == 200
        ) {
          return [
          response.status,html, jobs_results
          ];
        }
        else if(expired && response.status != 200)
        {
          let data = {};
          data = {
            message: "Request Time Out.",
            status: 408
          }
          return [408, data]
        }
      } catch (error) {
        let data = {};
        data = {
          message: "There was some error in procedding the request. Please contact darshan@serpdog.io if this error persists.",
          status: 503
        }
        console.log("Error in search scraper: "+ error);
        return [503, data]
      }
      return [];
    };
    module.exports = getJobsData;