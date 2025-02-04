import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha'
import CompanyLogo from '../assests/scrapingdog.png'
import styles from './Register.module.scss';

let statusText;

const Register = () => {
    const myStyle = {
        background: 'rgb(85, 79, 232)',
        borderTopRightRadius: "10px",
        borderBottomRightRadius: "10px"
      }
    const [error , setError] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password1: '',
        textChange: 'Sign Up',
    });

    let baseURL =
    process.env.NODE_ENV === "production"
      ? "" // production
      : "http://localhost:5000";

    useEffect(() => {
        document.title = "scrapingdog | Register"
        document.querySelector("meta[name = 'description']").setAttribute('content' , "SignUp for scrapingdog. Fastest SERP API.");
        document.querySelector("meta[name = 'og:description']").setAttribute('content',"SignUp for scrapingdog. Fastest SERP API.");
        document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.scrapingdog.io/register")
    })

    const { name, email, password1, textChange } = formData;
    const handleChange = text => e => {
        setFormData({ ...formData, [text]: e.target.value });
    };

    const onChange = async(value) => 
    {
        try{
        const res = await axios
        .post(`${baseURL}/captcha` , {
            method: "post",
            headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
              credentials: 'same-origin',
              body: 
                value,
        })
        
        .then(data => {
            statusText = data.status
        })

    }
    catch(e)
    {
        setError(e)
    }
    }

    const handleSubmit = e => {
        e.preventDefault();
        if (name && email && password1) {
                setFormData({ ...formData, textChange: 'Sign Up' });
                if(statusText == 200)
                {
                axios
                    .post(`${baseURL}/register`, {
                        name,
                        email,
                        password: password1,
                    })
                    .then(res => {
                        toast.success(res.data.message)
                    })
                    .catch(err => {
                        console.log("ERROR" , err.response);
                        setError(err.response.data.errors)
                    });
                }
        } else {
            setError('Please fill all fields');
        }
    };

    return (
        <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
            <img src= 'https://scrapingdog.io/blog/wp-content/uploads/2023/03/scrapingdog_website_logo.png' style = {{position: "absolute" , display: "block" , margin: "auto" ,marginTop: "2px" , width: "160px" , height: '40px', cursor: "pointer"}}></img>
            <ToastContainer theme='colored' autoClose = {2000} position="top-right"/>
            <div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1' style={{margin: "3rem" , marginTop: "70px"}}>
                <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12' style={{height: "550px" , paddingTop: "1rem"}}>
                {
                           error ? 
                           <p className = {styles.verify}>{error}</p>
                           :
                           null
                    }
                    <div className='mt-12 flex flex-col items-center' style = {{marginTop: "1.3rem"}}>
                        <form
                            className='w-full flex-1 mt-8 text-indigo-500'
                            onSubmit={handleSubmit}>
                            <div className='mx-auto max-w-xs relative '>
                                <input
                                    className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white'
                                    type='text'
                                    placeholder='Name'
                                    onChange={handleChange('name')}
                                    value={name}
                                />
                                <input
                                    className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5'
                                    style = {{color: "#667eea"}}
                                    type='email'
                                    placeholder='Email'
                                    onChange={handleChange('email')}
                                    value={email}
                                />
                                <input
                                    className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5'
                                    type='password'
                                    placeholder='Password'
                                    onChange={handleChange('password1')}
                                    value={password1}
                                />
                                <div className= {styles.captchaStyling}>
                                <ReCAPTCHA className= {styles.captcha}
                                theme = 'light'
                                    sitekey= {siteKey}
                                    onChange={onChange}
                                />
                                </div>
                                <button
                                    type='submit'
                                    className= {styles.btn}>
                                    <i className='fas fa-user-plus fa 1x w-6  -ml-2' />
                                    {textChange}
                                </button>
                            </div>
                            <div className='my-12 border-b text-center' style = {{marginTop: "1rem" , marginBottom: "1rem"}}>
                                <div className='leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2'>
                                <span className={styles.policy}>By creating account you agree to our <a className= {styles.terms}>Terms & Privacy Policy</a>.</span>
                                </div>
                            </div>
                            <div className='flex flex-col items-center'>
                                <a
                                    className= {styles.btn1}
                                    href='/login'
                                    target='_self'>
                                    <i className='fas fa-sign-in-alt fa 1x w-6  -ml-2 text-indigo-500' />
                                    Sign In
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
                <div className= 'flex-1 text-center hidden lg:flex'
                style = {myStyle}>
                    <h1 className= {styles.para}>Welcome To <br/>
                   scrapingdog !</h1>
                </div>
            </div>
        </div>
    );
};

export default Register;