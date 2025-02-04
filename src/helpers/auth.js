import cookie from 'js-cookie'



// Set in Cookie
export const setCookie = (key, value) => {
    if (window !== 'undefiend') {
        cookie.set(key, value) 
    }
}
// remove from cookie
export const removeCookie = key => {
    if (window !== 'undefined') {
        cookie.remove(key, {
            expires: 1
        });
    }
};


// Get from cookie such as stored token
// Will be useful when we need to make request to server with token
export const getCookie = key => {
    if (window !== 'undefined') {
        return cookie.get(key);
    }
};


//Register
// Authenticate user by passing data to cookie and localstorage during signin
export const authenticate = (response, next) => {
    setCookie('token', response.data.token);
    setCookie('user', response.data.user.name);
    setCookie('email' , response.data.user.email)
    setCookie('plan' , response.data.user.plan)
    setCookie('api_key' , response.data.user._id)
    next();
};


// Access user info from localstorage
export const isAuth = () => {
    if (window !== 'undefined') {
        const cookieChecked = getCookie('token');
        if (cookieChecked) {
            if (getCookie('email') && getCookie('user')) {
                return [getCookie("user") , getCookie('email')];
            } else {
                return false;
            }
        }
    }
};

//SignOut
export const signout = next => {
    removeCookie('token');
    next();
};
// export const updateUser = (response, next) => {
//     console.log('UPDATE USER IN LOCALSTORAGE HELPERS', response);
//     if (typeof window !== 'undefined') {
//         let auth = JSON.parse(localStorage.getItem('user'));
//         auth = response.data;
//         localStorage.setItem('user', JSON.stringify(auth));
//     }
//     next();
// };