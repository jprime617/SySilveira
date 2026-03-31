import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Logistics from './pages/Logistics'; // Delivery Reports
import POS from './pages/POS'; // Point of Sale

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@ERPLite:token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/logistics" element={<PrivateRoute><Logistics /></PrivateRoute>} />
        <Route path="/pos" element={<PrivateRoute><POS /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
