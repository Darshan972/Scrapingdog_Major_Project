import React from 'react';
import {createRoot} from 'react-dom/client';
import {
    BrowserRouter,
    Route,
    Routes as Switch,
} from 'react-router-dom';
import App from './App.jsx';
import Login from './screens/Login.jsx';
import Register from './screens/Register.jsx';
import Activate from './screens/Activate.jsx';
import Success from './screens/Stripe/Success'
import Failure from './screens/Stripe/Failure'
import ForgetPassword from './screens/ForgetPassword.jsx';
import ResetPassword from './screens/ResetPassword.jsx';
import 'react-toastify/dist/ReactToastify.css';
import Pricing from './screens/Pricing.jsx';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <BrowserRouter>
        <Switch>
            <Route path='/login' exact element={<Login />} />
            <Route path='/register' exact element={<Register />} />
            <Route
                path='/users/password/forget'
                exact
                element={<ForgetPassword />}
            />
            <Route
                path='/users/password/reset/:token'
                exact
                element={<ResetPassword />}
            />
            <Route path='/users/activate/:token' exact element ={<Activate />} />
            <Route path = '/pricing' exact element = {<Pricing/>}/>
            <Route path = '/success' exact element = {<Success/>}/>
            <Route path = '/fail' exact element = {<Failure/>}/>
            <Route path='*' element={<App />} />
        </Switch>
    </BrowserRouter>
);