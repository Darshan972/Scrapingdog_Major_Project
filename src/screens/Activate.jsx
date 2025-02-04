import React, {useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import {  isAuth } from '../helpers/auth';
import {  useNavigate } from 'react-router-dom';
import styles from './Activate.module.scss'

const Activate = ({ match }) => {
    const navigate = useNavigate();
    const myStyle = {
        background: 'rgb(85, 79, 232)',
        borderTopRightRadius: "10px",
        borderBottomRightRadius: "10px"
      }
    const [formData, setFormData] = useState({
        name: '',
        token: '',
        show: true,
    });

    let baseURL =
process.env.NODE_ENV === "production"
  ? "" // production
  : "http://localhost:5000";

    useEffect(() => {
        if(!isAuth()){
        document.title = "scrapingdog | Activate";
        document.querySelector("meta[name = 'description']").setAttribute('content' , "Login to scrapingdog. Fastest SERP API.");
        document.querySelector("meta[name = 'og:description']").setAttribute('content',"Login to scrapingdog. Fastest SERP API.");
        document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.scrapingdog.io/login");

        let token = window.location.href.substring(37)
        let { name } = jwtDecode(token);

        if (token) {
            setFormData({ ...formData, name, token });
        }
        axios
            .post(`${baseURL}/activation`, {
                token,
            })
            .then(res => {
                setFormData({
                    ...formData,
                    show: false,
                });
                navigate('/')
            })
            .catch(err => {
                toast.error(err.response.data.errors);
            });
        // form.current.submit();
    }
    else{
        navigate('/')
    }
    }, [match]);
    const { name, token, show } = formData;

    return (
        <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
            <ToastContainer autoClose={2000} theme = "colored"/>
            <div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1'>
                <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12'>
                    <div className='mt-12 flex flex-col items-center'>
                        <h1 className='text-2xl xl:text-3xl font-extrabold'>
                            Welcome {name}
                        </h1>

                        <form
                             
                            className='w-full flex-1 mt-8 text-indigo-500'
                            >
                            <div className='flex flex-col items-center'>
                                <a
                                    className= {styles.btn}
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
                    <p className= {styles.para}>Activate your account ! </p>
                </div>
            </div>
            ;
        </div>
    );
};

export default Activate;