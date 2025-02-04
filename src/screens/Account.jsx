import React , {useEffect} from "react";
import { getCookie } from "../helpers/auth";
import styles from "./Account.module.scss";

const Account = () => {
useEffect(() => {
document.title = "scrapingdog | Account"
document.querySelector("meta[name = 'description']").setAttribute('content' , "User account detail's page. Contact scrapingdog for further help.");
document.querySelector("meta[name = 'og:description']").setAttribute('content' , "User account detail's page. Contact scrapingdog for further help.");
document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.scrapingdog.io/account")
})

  return (
    <div>
      <div className={styles.wrapper}>
    <div className={styles.left}>
        <h4 className = {styles.heading}>Hello , {getCookie('user')} !</h4>
    </div>
    <div className={styles.right}>
        <div className={styles.info}>
            <h3>Information</h3>
            <div className={styles.info_data}>
                 <div className={styles.data}>
                    <h4>Email</h4>
                    <p>{getCookie('email')}</p>
                 </div>
                 <div className={styles.data}>
                   <h4>Plan</h4>
                    <p>{getCookie('plan')}</p>
              </div>
            </div>
        </div>
      
      <div className={styles.projects}>
            <h3>Request Cancellation</h3>
            <div className={styles.projects_data}>
                 <div className={styles.data}>
                   <a className = {styles.btn} href = "">Cancel</a>
                 </div>
            </div>
        </div>
        <h3>For any other queries please contact us at <a href="mailto:darshan@scrapingdog.io" style={{color: "rgb(110, 106, 235)"}}>darshan@scrapingdog.io</a></h3>
    </div>
</div>
    </div>
  );
};

export default Account;
