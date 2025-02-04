//STYLES
import styles from "./Navbar.module.scss";
import React, { useState } from "react";
//CONTEXT
import { useContext } from "react";
import NavContext from "../../context/NavContext";
//REACT ROUTER
import { NavLink } from "react-router-dom";
//ICONS
import companyLogo from "../../assests/scrapingdog_logo_black.png";
import {
  MdOutlineDashboard,
  MdOutlineAnalytics,
  MdOutlineLogout,
} from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { FaTimes } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
// import Tooltip from "@material-ui/core/Tooltip";

const NavUrl = ({ url, icon, description }) => {
  const { nav, setNav } = useContext(NavContext);
  const checkWindowSize = () => {
    if (window.innerWidth < 1024) setNav(!nav);
  };

  const [isActive, setisActive] = useState(false);
  return (
    <li className={styles.li_navlink}>
      <NavLink
        to={`${url}`}
        onMouseEnter={() => {
          setisActive(true);
        }}
        onMouseLeave={() => {
          setisActive(false);
        }}
        className={isActive ? styles.active : undefined}
        onClick={() => checkWindowSize()}
      >
        {icon}
        <span className={styles.description}>{description}</span>
      </NavLink>
    </li>
  );
};

const Navbar = () => {
  const { nav, setNav } = useContext(NavContext);

  return (
    <div
      className={`${styles.navbar_container} ${
        nav ? styles.navbar_mobile_active : ""
      }`}
    >
      <nav className={nav ? undefined : styles.nav_small}>
        {/* LOGO */}
        <div className={styles.logo}>
          <img
            src={companyLogo}
            className={styles.logo}
            alt="scrapingdog logo"
            onClick={() => {
              window.open("https://scrapingdog.io", "_blank");
            }}
          />
          <h2
            className={styles.name}
            onClick={() => {
              window.open("https://scrapingdog.io", "_blank");
            }}
          >
            scrapingdog
          </h2>
          <FaTimes
            className={styles.mobile_cancel_icon}
            onClick={() => {
              setNav(!nav);
            }}
          />
        </div>

        {/* MENU */}
        <ul className={styles.menu_container}>
          {/* FIRST CATEGORY */}
          <span className={styles.categories}>
            {nav ? "Pages" : <BsThreeDots />}
          </span>

          <NavUrl
            url="/"
            icon={<MdOutlineDashboard />}
            description="Dashboard"
          />
          <NavUrl
            url="usage"
            icon={<MdOutlineAnalytics />}
            description="Usage"
          />
          <NavUrl url="account" icon={<CgProfile />} description="Account" />
        </ul>

        {/* LOGOUT BUTTON */}
        <div
          className={`${styles.btn_logout}`}
          onClick={() => {
            setNav(!nav);
          }}
        >
          <MdOutlineLogout />
        </div>
      </nav>

      <div
        className={nav ? styles.mobile_nav_background_active : undefined}
        onClick={() => {
          setNav(!nav);
        }}
      ></div>
    </div>
  );
};

export default Navbar;
