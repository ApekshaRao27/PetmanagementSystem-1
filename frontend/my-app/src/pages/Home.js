import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <nav style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#ffcc80",
        padding: "15px",
        fontWeight: "bold",
        fontSize: "18px",
      }}>
        <Link to="/vets" style={{ textDecoration: "none", color: "#333" }}>Vets</Link>
        <Link to="/adopt" style={{ textDecoration: "none", color: "#333" }}>Adopt</Link>
        <Link to="/shop" style={{ textDecoration: "none", color: "#333" }}>Shop</Link>
        <Link to="/tips" style={{ textDecoration: "none", color: "#333" }}>Tips</Link>
      </nav>

      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Welcome to Pet Management 🐾</h2>
        <p>Select an option from the navbar to explore features!</p>
      </div>
    </div>
  );
}

export default Home;
