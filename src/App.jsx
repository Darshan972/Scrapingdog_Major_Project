import "./App.module.scss";
import React, { useEffect, useState } from "react";
import { Route, Routes as Switch, useNavigate } from "react-router-dom";
import { isAuth } from "./helpers/auth";
import Navbar from "./components/Navbar/Navbar";
import Container from "./components/Container/Container";
import RightNavbar from "./components/RightNavbar/RightNavbar";
import Dashboard from "./screens/Dashboard";
import Usage from "./screens/Usage";
import Account from "./screens/Account";
import Documentation from "./screens/Documentation";
import NavContext from "./context/NavContext";

function App() {
  const navigate = useNavigate();
  const [nav, setNav] = useState(false);
  const value = { nav, setNav };

  useEffect(() => {
    if (!isAuth()) {
      navigate("/login");
    }
  });

  return (
    <div className="App">
      <NavContext.Provider value={value}>
        <Navbar />
        <Container
          stickyNav={<RightNavbar/>}
          content={
            <Switch>
              <Route exact path="/usage" element={<Usage />} />
              <Route exact path="/account" element={<Account />} />
              <Route exact path="/documentation" element={<Documentation />} />
              <Route exact path="/" element={<Dashboard />} />
              <Route path="*" element={<main>NOT FOUND</main>} />
            </Switch>
          }
        />
      </NavContext.Provider>
    </div>
  );
}

export default App;