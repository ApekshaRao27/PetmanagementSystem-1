
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import Navbar from "./Navbar";

// NOTE: This component assumes you link a CSS file named 'ProductsPage.css' 
// or include the necessary <style> block in your main index.html/App.js.

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    try {
      const url = filter
        ? `http://127.0.0.1:5000/products?category=${filter}`
        : "http://127.0.0.1:5000/products";

      const res = await axios.get(url);
      setProducts(res.data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post("http://127.0.0.1:5000/cart/add", {
        user_id: 1, 
        product_id: productId,
      });
      alert("Product added to Cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  return (
    <div className="products-page-container">
      <Navbar />
      {/* 🛍️ Header and Navigation Bar (Flexbox) */}
      <header className="page-header">
        <h1 className="shop-title">Pet Shop</h1>
        <button
          className="cart-button"
          onClick={() => navigate("/cart")}
          aria-label="Go to Cart"
        >
          <FaShoppingCart size={24} />
        </button>
      </header>
      
      {/* 🏷️ Filter Section (Flexbox) */}
      <div className="filter-section">
        <label htmlFor="category-filter">Filter by Category:</label>
        <select
          id="category-filter"
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Products</option>
          <option value="food">Food 🦴</option>
          <option value="medicine">Medicines 💊</option>
          <option value="toys">Toys 🎾</option>
          <option value="accessories">Accessories 🧣</option>
        </select>
      </div>
      
      {/* 📦 Product List Grid (CSS Grid) */}
      <main className="product-list-grid">
        {products.length > 0 ? (
          products.map((p) => (
            <div className="product-card" key={p.id}>
              <div className="card-image-wrapper">
                <img
                  src={`http://127.0.0.1:5000/uploads/${p.image_path}`}
                  alt={`Image of ${p.name}`}
                  className="product-image"
                />
              </div>
              <div className="card-content">
                <h3 className="product-name">{p.name}</h3>
                <p className="product-description">{p.description}</p>
                <h4 className="product-price">₹{p.price}</h4>
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(p.id)}
                >
                  Add to Cart 🛒
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>No products found in this category.</p>
            {filter && <button className="reset-filter-btn" onClick={() => setFilter("")}>View All Products</button>}
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductsPage;