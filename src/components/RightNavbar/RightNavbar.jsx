import React, { useEffect, useState } from "react";
import { MdOutlineMenu } from "react-icons/md";
import styles from "./RightNavbar.module.scss";
import { useContext } from "react";
import NavContext from "../../context/NavContext";
import Signout from "./Submenu/Signout";
import { getCookie, isAuth } from "../../helpers/auth";
import axios from "axios";
import Plan from "./Submenu/Plan";
import Docs from "./Submenu/Docs";
import Rate from "./Submenu/Rate";


let creditsLeft, validity;
let baseURL =
  process.env.NODE_ENV === "production"
    ? "" // production
    : "http://localhost:5000";
const RightNavbar = () => {
  const [state, setState] = useState(0);

  const handleReq = (e) => {
    e.preventDefault();
    console.log("preventing");
  };

  const { nav, setNav } = useContext(NavContext);
  return (
    <div className={styles.container}>
      {/*BURGER*/}
      <div
        className={styles.burger_container}
        onClick={(e) => {
          handleReq(e);
          setNav(!nav);
        }}
      >
        <MdOutlineMenu />
      </div>
      <Rate />
      {/*Actions*/}
      <div className={styles.actions}></div>
      <Docs />
      <Plan />
      <Signout />
    </div>
  );
};

export default RightNavbar;
