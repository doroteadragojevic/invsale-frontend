import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/adminMenu.css"; // CSS za stilizaciju

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const links = [
    { path: "/admin", label: "DASHBOARD" },
    { path: "/categories", label: "PRODUCT CATEGORIES" },
    { path: "/units", label: "PACKAGING OPTIONS" },
    { path: "/stocks", label: "INVENTORY" },
    { path: "/manufacturers", label: "SUPPLIERS" },
    { path: "/coupons", label: "DISCOUNT COUPONS" },
    { path: "/orders", label: "ORDER MANAGEMENT" },
    { path: "/reviews", label: "CUSTOMER REVIEWS" },
    { path: "/stats", label: "ANALYTICS & REPORTS" },
    { path: "/skladiste", label: "WAREHOUSE" },
    { path: "/FAQ", label: "FAQ" },
  ];

  return (

<header className="admin-header">
  <Link to="/admin">
    <img src="/olive3.png" alt="Admin Logo" className="logo-image" />
  </Link>
  
<div className="admin-logo">
  
  {links.map((link, index) => (
        <a
          key={index}
          className="header-link"
          onClick={() => navigate(link.path)}
        >
          {link.label}
        </a>
      ))}
      </div>
<div className="admin-actions">
<img 
          src="/logout2.png" 
          alt="Logout" 
          className="logout-icon" 
          onClick={handleLogout} 
        /></div>
</header>
  );
};

export default AdminHeader;
