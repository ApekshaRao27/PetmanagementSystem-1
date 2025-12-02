import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DoctorLogin from './pages/DoctorLogin';
import OwnerRegister from './pages/OwnerRegister';
import OwnerLogin from './pages/OwnerLogin';
import Home from './pages/Home';
import Vets from  './pages/VetsPage.js'
import './App.css';
import Adopt from './pages/Adopt';
import LostFound from './pages/LostFound'; 
import CartPage from './pages/CartPage';
import ProductsPage from './pages/ProductsPage.js';
import DoctorDashboard from './pages/DoctorDashboard.js';
import Navbar from './pages/Navbar';
function App() {
  return (
    
    <Router>
    
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/owner-register" element={<OwnerRegister />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/vets" element={<Vets/>}/>
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;


