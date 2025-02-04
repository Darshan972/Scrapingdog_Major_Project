import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import CompanyLogo from "../assests/scrapingdog.png";
import styles from "./ResetPassword.module.scss";
import axios from "axios";
const ResetPassword = ({ match }) => {
  const myStyle = {
    background: "rgb(85, 79, 232)",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  };

  useEffect(() => {
    document.title = "scrapingdog | Reset Password";
    document.querySelector("meta[name = 'description']").setAttribute('content' , "Login to scrapingdog. Fastest SERP API.");
    document.querySelector("meta[name = 'og:description']").setAttribute('content',"Login to scrapingdog. Fastest SERP API.");
    document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.scrapingdog.io/login")
  });

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    password1: "",
    password2: "",
    token: "",
    textChange: "Submit",
  });
  const { password1, password2, textChange, token } = formData;
  let baseURL =
    process.env.NODE_ENV === "production"
      ? "" // production
      : "http://localhost:5000";

  useEffect(() => {
    let token = window.location.href.substring(43);
    if (token) {
      setFormData({ ...formData, token });
    }
  }, []);
  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value });
  };
  const handleSubmit = (e) => {
    console.log(password1, password2);
    e.preventDefault();
    if (password1 === password2 && password1 && password2) {
      setFormData({ ...formData, textChange: "Submitting" });
      axios
        .put(`${baseURL}/resetpassword`, {
          newPassword: password1,
          resetPasswordLink: token,
        })
        .then((res) => {
          setError(res.data.message);
        })
        .catch((err) => {
          setError("Something is wrong try again");
        });
    } else {
      setError("Passwords don't matches");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <img
        src={CompanyLogo}
        style={{
          position: "absolute",
          display: "block",
          margin: "auto",
          marginTop: "2px",
          width: "160px",
          height: "40px",
          cursor: "pointer",
        }}
      ></img>
      <ToastContainer autoClose={2000} theme="colored" />
      <div
        className="max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1"
        style={{ marginTop: "70px" }}
      >
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          {error ? <p className={styles.verify}>{error}</p> : null}
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Reset Your Password
            </h1>
            <div className="w-full flex-1 mt-8 text-indigo-500">
              <form
                className="mx-auto max-w-xs relative "
                onSubmit={handleSubmit}
              >
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="password"
                  onChange={handleChange("password1")}
                  value={password1}
                />
                <input
                  className="w-full mt-5 px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Confirm password"
                  onChange={handleChange("password2")}
                  value={password2}
                />
                <button className={styles.btn} type="submit">
                  <i className="fas fa-sign-in-alt  w-6  -ml-2" />
                  Submit
                </button>
              </form>
              <div className="my-12 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                   Or sign in 
                </div>
              </div>
              <div className="flex flex-col items-center">
                <a className={styles.btn1} href="/login" target="_self">
                  <i className="fas fa-sign-in-alt fa 1x w-6  -ml-2 text-indigo-500" />
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 text-center hidden lg:flex" style={myStyle}>
          <p className={styles.para}>
            Reset your <br />
            password here.
          </p>
        </div>
      </div>
      ;
    </div>
  );
};

export default ResetPassword;
