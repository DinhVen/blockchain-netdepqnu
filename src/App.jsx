import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Claim from './pages/Claim';
import Voting from './pages/Voting';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import CandidateSignup from './pages/CandidateSignup';
import CandidateDetail from './pages/CandidateDetail';
import Results from './pages/Results';
import FAQ from './pages/FAQ';
import Reviews from './pages/Reviews';
import NotFound from './pages/NotFound';
import Loader from './components/Loader';
import BackToTop from './components/BackToTop';
import FAQButton from './components/FAQButton';
import { useContext } from 'react';
import { Web3Context } from './context/Web3Context';

const AppContent = () => {
  const { isLoading } = useContext(Web3Context);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {isLoading && <Loader />}
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/claim" element={<Claim />} />
          <Route path="/buy-token" element={<Claim />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/candidate-signup" element={<CandidateSignup />} />
          <Route path="/candidate/:id" element={<CandidateDetail />} />
          <Route path="/results" element={<Results />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
      <FAQButton />
    </div>
  );
};

function App() {
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
