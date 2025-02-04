import React from 'react'
import styles from './Success.module.scss'
import { useNavigate } from 'react-router-dom'

const Success = () => {
  document.title = "Serpdog | Success"
  document.querySelector("meta[name = 'description']").setAttribute('content' , "Payment succeeded page.");
  document.querySelector("meta[name = 'og:description']").setAttribute('content' , "Payment succeeded page.");
  document.head.querySelector("link[rel = 'canonical']").setAttribute("href" , "https://api.serpdog.io/pricing")
  const navigate = useNavigate();
  return (
    <div className= {styles.container}>
      <h1 className= {styles.heading}>Congratulations!</h1>
      <div className= {styles.paraContainer}>
        <p className= {styles.paragraph}>
          You have been succesfully subscribed to our paid plan.
        </p>
        <p className= {styles.paragraph}>
        For further queries contact us at <a href="mailto:darshan@serpdog.io" style={{color: "rgb(110, 106, 235)"}}>darshan@serpdog.io</a>
        </p>
        <p className= {styles.para}>Return back to dashboard</p>
        <button className= {styles.btn} onClick = {() => navigate('/' , {replace : true}) }>
        Dashboard
      </button>
      </div>      
    </div>
  )
}

export default Success ; 