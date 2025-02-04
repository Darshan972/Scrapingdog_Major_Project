import React, { useEffect, useRef } from "react";
import { isAuth } from "../helpers/auth";
import { getCookie } from "../helpers/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Pricing.module.scss";
const Pricing = () => {
  const buttonValue = useRef();

  const navigate = useNavigate();

  const setBtnValue = (e) => {
    e.preventDefault();
    buttonValue.current = e.target.value;
    checkoutHandler(buttonValue.current);
  };

  let baseURL =
    process.env.NODE_ENV === "production"
      ? "" // production
      : "http://localhost:5000";

  const checkoutHandler = async (btnValue) => {
    const res = await axios.post(`${baseURL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      credentials: "same-origin",
      btnValue,
      api_key: getCookie("api_key")
    });
    if (res.status == 200) {
      const url = res.data.url;
      window.location.href = url;
    }
  };

  useEffect(() => {
    if (!isAuth()) {
      navigate("/login");
    }
    document.title = "scrapingdog | Pricing";
    document.querySelector("meta[name = 'description']").setAttribute('content' , "Pricing Page for scrapingdog");
    document.querySelector("meta[name = 'og:description']").setAttribute('content',"Pricing Page for scrapingdog");
    document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.scrapingdog.io/pricing");

  });
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>API Pricing</h2>
      <div className={styles.priceRow}>
        <div className={styles.priceCol}>
          <p>LITE</p>
          <h3>
            30$ <span> / month</span>
          </h3>
          <ul>
            <li>
              <span>160000</span> Requests Credits
            </li>
            <li>5 Req / sec</li>
            <li>All APIs</li>
            <li>8k Google Credits</li>
            <li>Location Based Results</li>
            <li>Real Time Results</li>
            <li>Results Format JSON</li>
            <li>Chat and Email Support</li>
          </ul>
          <form>
            <button
              value=""
              type="submit"
              className="btn"
              name="product"
              onClick={(e) => setBtnValue(e)}
            >
              Upgrade Now
            </button>
          </form>
        </div>
        <div className={styles.priceCol}>
          <p>STANDARD</p>
          <h3>
            100$ <span> / month</span>
          </h3>
          <ul>
            <li>
              <span>800000</span> Requests Credits
            </li>
            <li>10 Req / sec</li>
            <li>All APIs</li>
            <li>40k Google Credits</li>
            <li>Location Based Results</li>
            <li>Real Time Results</li>
            <li>Results Format JSON</li>
            <li>Chat and Email Support</li>
          </ul>
          <form>
            <button
              value=""
              type="submit"
              className="btn"
              name="product"
              onClick={setBtnValue}
            >
              Upgrade Now
            </button>
          </form>
        </div>
        <div className={styles.priceCol}>
          <p>PRO</p>
          <h3>
            200$ <span> / month</span>
          </h3>
          <ul>
            <li>
              <span>2600000</span> Requests Credits
            </li>
            <li>50 Req / sec</li>
            <li>All APIs</li>
            <li>120k Google Credits</li>
            <li>Location Based Results</li>
            <li>Real Time Results</li>
            <li>Results Format JSON</li>
            <li>Chat and Email Support</li>
          </ul>
          <form>
            <button
              value=""
              type="submit"
              className="btn"
              name="product"
              onClick={setBtnValue}
            >
              Upgrade Now
            </button>
          </form>
        </div>
        </div>
    </div>
  );
};

export default Pricing;
