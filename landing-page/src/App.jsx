import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import DataFlow from './components/DataFlow';
import Pricing from './components/Pricing';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <DataFlow />
      <Pricing />
      <Footer />
    </>
  );
}

export default App;
