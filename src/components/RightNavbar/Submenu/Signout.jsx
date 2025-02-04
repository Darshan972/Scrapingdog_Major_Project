import React from 'react';
import { signout } from '../../../helpers/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styles from './Signout.module.scss'

const Signout = () => {
    const navigate = useNavigate();
    return (
        <button className= {styles.btn}
            onClick={() => {
                signout(() => {
                    navigate('/login', { replace: true });
                    toast.error('Signout Successfully');
                });
            }}>
            Signout
        </button>
    );
};

export default Signout;