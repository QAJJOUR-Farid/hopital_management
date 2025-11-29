import React from "react";
import Logo from "./Logo.jsx";
import { Link, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function Sidebar1({ menuItems = [] }) {
  const location = useLocation();

  return (
    <div className="vh-100 p-3" style={{ width: "250px", backgroundColor: "#343a40", color: "#fff" }}>
       <Logo />
      <h4 className="mb-4">Menu</h4>
      <ul className="nav flex-column">
        {menuItems.map(item => (
          <li className="nav-item mb-2" key={item.name}>
            <Link
              to={item.path}
              className={`nav-link text-white ${location.pathname === item.path ? "fw-bold" : ""}`}
              style={{ backgroundColor: location.pathname === item.path ? item.color : "transparent", borderRadius: "5px" }}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar1;