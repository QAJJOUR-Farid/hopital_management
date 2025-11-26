import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import RoleHome from "./pages/RoleHome.jsx";

function App() {
  return (
    <Router>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <Navbar />
          <div className="p-4" style={{ minHeight: "90vh", backgroundColor: "#f8f9fa" }}>
            <Routes>
              {/* <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} /> */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/home/:role" element={<RoleHome />} /> 
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
