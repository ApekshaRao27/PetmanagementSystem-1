import React, { useContext } from "react";
import CartContext from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div style={styles.card}>
      <img src={product.image} alt={product.name} style={styles.image} />
      
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <p style={styles.desc}>{product.description}</p>

      <button style={styles.btn} onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}

const styles = {
  card: {
    width: "250px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    textAlign: "center",
    background: "#fff",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  desc: {
    fontSize: "14px",
    color: "#666"
  },
  btn: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    background: "#2b7cff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default ProductCard;
