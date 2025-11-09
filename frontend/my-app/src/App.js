import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DoctorLogin from './pages/DoctorLogin';
import OwnerRegister from './pages/OwnerRegister';
import OwnerLogin from './pages/OwnerLogin';
import Home from './pages/Home';
import Vets from  './pages/Vets.js'
import './App.css';
import Shop from './pages/Shop';
import Adopt from './pages/Adopt';
import Tips from './pages/Tips';  
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
        <Route path="/shop" element={<Shop />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/tips" element={<Tips />} />

      </Routes>
    </Router>
  );
}

export default App;


