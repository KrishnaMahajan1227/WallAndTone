import React from 'react';
import './CartPopup.css';

const CartPopup = ({ isOpen, onClose, cartItems, handleRemoveFromCart, handleUpdateQuantity }) => {
  return (
    <div className={`cart-popup ${isOpen ? 'show' : ''}`}>
      <div className="sub-cart-overlay" onClick={onClose}></div>
      <div className="sub-cart-body">
        <div className="sub-cart-header">
          <h2>Cart</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.productId._id} className="cart-item">
              <div className="cart-item-image">
                <img
                  src={`${item.productId.mainImage}`}
                  alt={item.productId.productName}
                  className="img-fluid"
                />
              </div>
              <div className="cart-item-details">
                <h3 className="cart-item-title">{item.productId.productName}</h3>
                <p className="cart-item-price">₹ {item.productId.price}</p>
                <div className="cart-item-quantity">
                  <button
                    className="update-quantity btn btn-primary"
                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    className="update-quantity btn btn-primary"
                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="remove-from-cart btn btn-danger"
                  onClick={() => handleRemoveFromCart(item)}
                >
                  Remove from Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <p className="cart-total">
            Total: ₹{' '}
            {cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0)}
          </p>
          <button className="view-cart btn btn-primary" onClick={() => console.log('View Cart')}>
            View Cart
          </button>
          <button className="checkout btn btn-primary" onClick={() => console.log('Checkout')}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;