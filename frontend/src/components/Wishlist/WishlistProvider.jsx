import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { WishlistProvider } from './WishlistContext';

ReactDOM.render(
  <WishlistProvider>
    <App />
  </WishlistProvider>,
  document.getElementById('root')
);