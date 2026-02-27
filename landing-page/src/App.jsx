import React from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import DataFlow from './components/DataFlow';
import SecuritySection from './components/SecuritySection';
import Pricing from './components/Pricing';
import Footer from './components/Footer';

const App = () => (
  <div>
    <Navbar />
    <Hero />
    <Features />
    <DataFlow />
    <SecuritySection />
    <Pricing />
    <Footer />
  </div>
);

export default App;
