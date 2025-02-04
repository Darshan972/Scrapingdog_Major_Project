import styles from './Container.module.scss';
import React from 'react';
const Container = ({ stickyNav, content }) => {
    return (
        <div className={styles.container}>
            {stickyNav}
            {content}
        </div>
    );
};

export default Container;