import { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider, Web3Context } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import EmailGate from './components/EmailGate';
import Home from './pages/Home';
import Claim from './pages/Claim';
import Voting from './pages/Voting';
import Admin from './pages/Admin';
import CandidateSignup from './pages/CandidateSignup';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import CandidateDetail from './pages/CandidateDetail';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import Loader from './components/Loader';
import BackToTop from './components/BackToTop';
import AnimatedBackground from './components/AnimatedBackground';
import './styles/animations.css';

function AppContent() {
  const { isLoading } = useContext(Web3Context);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 animate-gradient"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="absolute inset-0 mesh-gradient"></div>
          <div className="absolute inset-0 grid-pattern"></div>
          <AnimatedBackground />
        </div>

        <Navbar />
        <div className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/claim" element={<Claim />} />
            <Route path="/vote" element={<Voting />} />
            <Route path="/candidate/:id" element={<CandidateDetail />} />
            <Route path="/results" element={<Results />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/apply" element={<CandidateSignup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
        <BackToTop />
      </div>
      {isLoading && <Loader message="Đang xử lý giao dịch..." />}
    </>
  );
}

function App() {
  const [emailVerified, setEmailVerified] = useState(() => {
    return Boolean(localStorage.getItem('qnu-email-verified'));
  });

  if (!emailVerified) {
    return (
      <ThemeProvider>
        <EmailGate onVerified={() => setEmailVerified(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Web3Provider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
