import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import DataFlow from './components/DataFlow';
import Pricing from './components/Pricing';
import SecuritySection from './components/SecuritySection';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="min-h-screen bg-background text-text-main">
      <Navbar />
      <Hero />
      <Features />
      <DataFlow />
      <SecuritySection />
      <Pricing />
      <Footer />
    </div>
  );
};

export default App;
