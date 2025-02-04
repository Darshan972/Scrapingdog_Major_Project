import React, { useState , useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import CompanyLogo from '../assests/scrapingdog.png'
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./ForgetPassword.module.scss";

const ForgetPassword = ({ history }) => {
  let statusText;
  const myStyle = {
    background: "rgb(85, 79, 232)",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  };

  useEffect(() => {
    document.title = "scrapingdog | Forgot Password"
    document.querySelector("meta[name = 'description']").setAttribute('content' , "Login to scrapingdog. Fastest SERP API.");
    document.querySelector("meta[name = 'og:description']").setAttribute('content',"Login to scrapingdog. Fastest SERP API.");
    document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.scrapingdog.io/login")
})

  const[verification , setVerification] = useState(false)
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    textChange: "Submit",
  });
  const { email, textChange } = formData;

  let baseURL =
process.env.NODE_ENV === "production"
  ? "" // production
  : "http://localhost:5000";

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
    if (email) {
      setFormData({ ...formData, textChange: "Submitting" });
      if (statusText == 200) {
        axios
          .put(`${baseURL}/forgotpassword`, {
            email,
          })
          .then((res) => {
            setVerification(true)
            toast.success("Please check your email");
          })
          .catch((err) => {
            setError(err.response.data.error);
          });
      }
    } else {
      setError("Please fill all fields");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
            <img src= {CompanyLogo} style = {{position: "absolute" , display: "block" , margin: "auto" ,marginTop: "2px" , width: "160px" , height: '40px', cursor: "pointer"}}></img>
      <ToastContainer autoClose={2000} theme="colored" />
      <div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1' style={{margin: "3rem" , marginTop: "70px"}}>
                <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12' style={{height: "550px" , paddingTop: "0rem"}}>
          {error ? <p className={styles.verify}>{error}</p> : null}
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Forget Password
            </h1>
            <div className="w-full flex-1 mt-8 text-indigo-500">
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
                <div className={styles.captchaStyling}>
                  <ReCAPTCHA
                    className={styles.captcha}
                    theme="light"
                    sitekey= {siteKey}
                    onChange={onChange}
                  />
                </div>
                <button
                  type="submit"
                  className={styles.btn}
                  disabled={verification}
                >
                  Submit
                </button>
              </form>
              <div className="my-12 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign In with e-mail
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
            Forgot your password ! <br /> Wait , we will send you an email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;