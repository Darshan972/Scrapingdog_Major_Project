import React, { useEffect, useState } from "react";
import  Chart  from 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import axios from "axios";
import { getCookie } from "../helpers/auth";
import {CategoryScale} from 'chart.js'; 
import styles from './Usage.module.scss'

Chart.register(CategoryScale)

const Usage = () => {
  let labels = [],
    data = [];
  const [state, setState] = useState(null);
  useEffect(() => {
    document.title = "scrapingdog | Usage"
    document.querySelector("meta[name = 'description']").setAttribute('content' , "The page will tell about the number of requests you have used in recent days.");
    document.querySelector("meta[name = 'og:description']").setAttribute('content',"The page will tell about the number of requests you have used in recent days.");
    document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.scrapingdog.io/usage")
    const getData = async () => {
      let baseURL = 
      process.env.NODE_ENV === 'production'
        ? '' // production
        : 'http://localhost:5000' ;
      const res = await axios.post(`${baseURL}/usage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "same-origin",
        data: getCookie("api_key"),
      });
      for (let i = 0; i < res.data.length; i++) {
        labels[i] = res.data[i].date.substring(4,10);
        data[i] = res.data[i].req;
      }
      setState({
        labels,
        datasets: [
          {
            label: "requests",
            backgroundColor: "rgba(85, 79, 232)",
            borderColor: "rgba(0,0,0,1)",
            borderWidth: 0,
            barPercentage: 0.5,
            barThickness: 6,
            maxBarThickness: 8,
            minBarLength: 1,
            data,
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
        
              y: {
                grid: {
                  display: false,
                  color: 'rgba(217,143,7,0.1)',
                },
              },
            },
          },
        ],
      });
    };
    getData();
  }, []);

  return (
    <div>

    <div className = {styles.container}>
      {state ? (
        <Bar
          data={state}
          options={{
            title: {
              display: true,
              text: "Average Rainfall per month",
              fontSize: 20,
            },
            legend: {
              display: true,
              position: "right",
            },
          }}
        />
        ) : null }
    </div>
    <div className = {styles.para}>
      <p>
        <b>The Graph is updated at every 12:00 a.m.</b>
      </p>
    </div>
    </div>
  );
};

export default Usage;
