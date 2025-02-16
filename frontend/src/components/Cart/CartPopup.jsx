import React from 'react';
import './CartPopup.css';
import { X, Minus, Plus } from 'lucide-react';

const CartPopup = ({ isOpen, onClose, cartItems, handleRemoveFromCart, handleUpdateQuantity, navigate }) => {
  const calculateItemPrice = (item) => {
    const framePrice = item.frameType?.price || 0;
    const subFramePrice = item.subFrameType?.price || 0;
    const sizePrice = item.size?.price || 0;
    const basePrice = item.isCustom ? 0 : (item.productId?.price || 0);
    
    return (framePrice + subFramePrice + sizePrice + basePrice) * item.quantity;
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + calculateItemPrice(item),
    0
  );

  return (
    <div className={`cart-popup ${isOpen ? 'show' : ''}`}>
      <div className="sub-cart-overlay" onClick={onClose}></div>
      <div className="sub-cart-body">
        <div className="sub-cart-header">
          <h2>Cart</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.uniqueId} className="cart-item">
              <div className="cart-item-image">
                <img
                  src={item.isCustom ? item.image : item.productId?.mainImage}
                  alt={item.isCustom ? "Custom Artwork" : item.productId?.productName}
                  className="img-fluid"
                />
              </div>
              <div className="cart-item-details">
                <h3 className="cart-item-title">
                  {item.isCustom ? "Custom Artwork" : item.productId?.productName}
                </h3>
                <div className="cart-item-specs">
                  <p>Size: {item.size?.width} x {item.size?.height}</p>
                  <p>Frame: {item.frameType?.name || "N/A"}</p>
                  <p>Type: {item.subFrameType?.name || "N/A"}</p>
                </div>
                <div className="cart-item-price-quantity">
                  <p className="cart-item-price">₹ {calculateItemPrice(item)}</p>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpdateQuantity(item, Math.max(1, item.quantity - 1));
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpdateQuantity(item, item.quantity + 1);
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromCart(item);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹ {totalPrice}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>₹ 300</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>₹ 50</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹ {totalPrice + 300 + 50}</span>
            </div>
          </div>
          <div className="cart-actions">
            <button 
              className="view-cart-btn" 
              onClick={(e) => {
                e.preventDefault();
                onClose();
                navigate('/cart');
              }}
            >
              View Cart
            </button>
            <button 
              className="checkout-btn" 
              onClick={(e) => {
                e.preventDefault();
                onClose();
                navigate('/checkout');
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;