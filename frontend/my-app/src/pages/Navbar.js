import  React from "react";
import { Link } from "react-router-dom";
function Navbar() {
    return( <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          backgroundColor: "#e3d1d5ff",
          padding: "15px",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        <Link to="/home" style={{ textDecoration: "none", color: "#333" }}>Home</Link>
        <Link to="/vets" style={{ textDecoration: "none", color: "#333" }}>
          Vets
        </Link>
        <Link to="/adopt" style={{ textDecoration: "none", color: "#333" }}>
          Adopt
        </Link>
        <Link to="/products" style={{ textDecoration: "none", color: "#333" }}>
          Shop
        </Link>
        <Link to="/lost-found" style={{ textDecoration: "none", color: "#333" }}>
         Lost & Found
        </Link>
      </nav>
    );      
}

export default Navbar;