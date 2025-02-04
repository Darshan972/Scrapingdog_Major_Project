import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { authenticate, isAuth } from "../helpers/auth";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./Login.module.scss";

let statusText;

const Login = () => {
  const myStyle = {
    background: "rgb(85, 79, 232)",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  };
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password1: "",
    textChange: "Sign In",
  });

  let baseURL =
    process.env.NODE_ENV === "production"
      ? "" // production
      : "http://localhost:5000";

  useEffect(() => {
    if (isAuth()) {
      navigate("/");
    }
    document.title = "scrapingdog | Login";
    document.querySelector("meta[name = 'description']").setAttribute('content' , "Login to scrapingdog. Fastest SERP API.");
    document.querySelector("meta[name = 'og:description']").setAttribute('content',"Login to scrapingdog. Fastest SERP API.");
    document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.scrapingdog.io/login")
  });
  const { email, password1, textChange } = formData;
  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value });
  };

  const onChange = async (value) => {
    try {
      const res = await axios
        .post(`${baseURL}/captcha`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          credentials: "same-origin",
          body: value,
        })

        .then((data) => {
          statusText = data.status;
        });
    } catch (e) {
      setError(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password1) {
      setFormData({ ...formData, textChange: "Submitting" });
      if (statusText == 200) {
        axios
          .post(`${baseURL}/login`, {
            email,
            password: password1,
          })
          .then((res) => {
            authenticate(res, () => {
              isAuth() && isAuth().role === "admin"
                ? navigate("/admin")
                : navigate("/");
            });
          })
          .catch((err) => {
            setError(err.response.data.errors);
          });
      }
    } else {
      setError("Please fill all fields correctly");
    }
  };
  return (
<div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <img
        src= 'https://scrapingdog.io/blog/wp-content/uploads/2023/03/scrapingdog_website_logo.png'
        style={{
          position: "absolute",
          display: "block",
          margin: "auto",
          marginTop: "2px",
          width: "140px",
          height: "35px",
          cursor: "pointer",
        }}
      ></img>
      <ToastContainer autoClose={2000} theme="colored" />
      <div
        className="max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1"
        style={{ margin: "3rem", marginTop: "70px" }}
      >
        <div
          className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12"
          style={{ height: "550px", paddingTop: "1rem" }}
        >
          {error ? <p className={styles.verify}>{error}</p> : null}
          <div
            className="mt-12 flex flex-col items-center"
            style={{ marginTop: "1rem" }}
          >
            <div className="w-full flex-1 mt-8 text-indigo-500">
              <div className="flex flex-col items-center">
                <a className={styles.btn2} href="/register" target="_self">
                  <i className="fas fa-user-plus fa 1x w-6  -ml-2" />
                  Sign Up
                </a>
              </div>
              <div className="my-12 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign In with e-mail
                </div>
              </div>
              <form
                className="mx-auto max-w-xs relative "
                onSubmit={handleSubmit}
              >
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange("email")}
                  value={email}
                />
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange("password1")}
                  value={password1}
                />
                <div className={styles.captchaStyling}>
                  <ReCAPTCHA
                    className={styles.captcha}
                    theme="light"
                    sitekey= {siteKey}
                    onChange={onChange}
                  />
                </div>
                <button className={styles.btn1} type="submit">
                  <i className="fas fa-sign-in-alt fa 1x w-6  -ml-2 text-indigo-500" />
                  Sign In
                </button>
                <Link to="/users/password/forget" className={styles.forgetPass}>
                  Forget password?
                </Link>
              </form>
            </div>
          </div>
        </div>
        <div className="flex-1 text-center hidden lg:flex" style={myStyle}>
          <h1 className={styles.para}>
            Welcome Back ! <br />
            It's a pleasure to see you again.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Login;