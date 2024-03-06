// hooks/useUsernameCookie.js
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

const useUsernameCookie = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['username']);
    const [username, setUsername] = useState('');

    console.log("cookies", cookies);

    useEffect(() => {
        if (cookies.username) {
            setUsername(cookies.username);
        }
    }, [cookies.username]);

    return { username, setUsername, setCookie, removeCookie };
};

export default useUsernameCookie;
