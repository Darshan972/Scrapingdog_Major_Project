import React from 'react';
import styles from './Docs.module.scss'

const Docs = () => {
    return (
        <button className= {styles.btn}
            onClick={() => {
                window.open('https://docs.serpdog.io', "_blank")
            }}>
            Docs
        </button>
    );
};

export default Docs;