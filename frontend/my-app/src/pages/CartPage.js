import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaCreditCard } from "react-icons/fa"; // Using icons for better visuals
import Navbar from "./Navbar";
function CartPage() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  const USER_ID = 1; // Hardcoded user_id

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/cart/${USER_ID}`);
      setCart(res.data);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const updateQty = async (cartId, qty) => {
    if (qty < 1) return;

    try {
      await axios.put("http://127.0.0.1:5000/cart/update", {
        cart_id: cartId,
        quantity: qty,
      });
      loadCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const deleteItem = async (cartId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/cart/delete/${cartId}`);
      loadCart();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const checkout = async () => {
    if (cart.length === 0) {
      setMessage("Your cart is empty. Please add items to checkout.");
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:5000/cart/clear/${USER_ID}`);
      setMessage("🎉 Payment Successful! Order Placed.");
      setCart([]);
    } catch (error) {
      console.error("Checkout error:", error);
      setMessage("❌ Error processing checkout. Please try again.");
    }
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="cart-container">
      <Navbar />
      <h2 className="cart-header">🛒 Your Shopping Cart</h2>

      {/* Message Alert */}
      {message && (
        <div className={`cart-message ${message.startsWith('🎉') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Cart Content: List and Summary */}
      {cart.length === 0 && !message.startsWith('🎉') ? (
        <div className="empty-cart-message">
          <p>Your cart is currently empty.</p>
        </div>
      ) : (
        <div className="cart-layout">
          
          {/* Cart Items List */}
          <div className="cart-items-list">
            {cart.map((item) => (
              <div className="cart-item-card" key={item.cart_id}>
                
                {/* Image */}
                <div className="item-image-wrapper">
                  <img
                    src={`http://127.0.0.1:5000/uploads/${item.image_path}`}
                    alt={item.name}
                    className="item-image"
                  />
                </div>
                
                {/* Details and Controls */}
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">Price: ₹{item.price}</p>
                  
                  <div className="item-controls">
                    <div className="quantity-control">
                      <button
                        className="qty-btn minus"
                        onClick={() => updateQty(item.cart_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        className="qty-btn plus"
                        onClick={() => updateQty(item.cart_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      className="remove-btn"
                      onClick={() => deleteItem(item.cart_id)}
                    >
                      <FaTrashAlt size={14} /> Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="item-subtotal">
                  <p className="subtotal-label">Subtotal</p>
                  <h4 className="subtotal-amount">₹{(item.price * item.quantity)}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Panel */}
          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-total">
              <span className="total-label">Grand Total:</span>
              <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <button
              className="checkout-btn"
              onClick={checkout}
              disabled={cart.length === 0}
            >
              <FaCreditCard size={18} /> Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;