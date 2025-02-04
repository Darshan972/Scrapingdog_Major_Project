import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Plan.module.scss'

const Plan = () => {
    const navigate = useNavigate();
    return (
        <button className= {styles.btn}
            onClick={() => {
                    navigate('/pricing');
            }}>
            Upgrade
        </button>
    );
};

export default Plan;