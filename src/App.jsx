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
import Footer from './components/Footer';
import Loader from './components/Loader';

function AppContent() {
  const { isLoading } = useContext(Web3Context);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/claim" element={<Claim />} />
            <Route path="/vote" element={<Voting />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
        <Footer />
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
