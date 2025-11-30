<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


import { BrowserRouter } from 'react-router-dom';
import AppContextProvider from "./context/AppContext.jsx";
createRoot(document.getElementById('root')).render(
  < BrowserRouter >

  <AppContextProvider>
 
    <App />

  </AppContextProvider>
   
  </BrowserRouter >,
=======
 import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

import AppContextProvider from './context/AppContext.jsx';
import CartContextProvider from './context/CartContext.jsx';
import ToastProvider from './context/ToastContext.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CartContextProvider>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </CartContextProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
>>>>>>> master
);
