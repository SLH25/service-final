import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar"
import Footer from './components/Footer';
import HomePage from './components/HomePage/HomePage';
import ServicePage from './components/ServicePage/ServicePage';
import ServiceDetail from './components/ServicePage/ServiceDetail';
import PrestatairePage from './components/PrestatairePage/PrestatairePage';
import PrestataireProfile from './components/PrestatairePage/PrestataireProfile';
import AboutPage from './components/AboutPage/AboutPage';
import ContactPage from './components/Contact Page/ContactPage';
import SignupPage from './components/SignupPage/SignupPage';
import LoginPage from './components/SignupPage/LoginPage';
import Profile from './components/profile';
import {Logout} from './components/Logout';
import SearchPage from './components/SearchPage/SearchPage';
import AdminConnect from './components/Admin/AdminConnect';
import TermsPage from './components/Legal/TermsPage';
import { useAuth } from './components/SignupPage/AuthContext';

/** Protected route wrapper: redirects to /login if not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userStatus } = useAuth();
  if (!userStatus) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}


function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Initialize dark mode from localStorage, default to false (light mode)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist the preference
    localStorage.setItem("darkMode", String(dark));
  }, [dark]);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {!isAdminRoute && <Navbar dark={dark} setDark={setDark} />}

      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/services' element={<ServicePage />} />
        <Route path='/services/:id' element={<ServiceDetail />} />
        <Route path='/prestataires' element={<PrestatairePage />} />
        <Route path='/prestataires/:id' element={<PrestataireProfile />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/conditions-utilisation' element={<TermsPage />} />
        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/logout' element={<ProtectedRoute><Logout /></ProtectedRoute>} />
        <Route path='/search' element={<SearchPage />} />
        <Route path='/admin' element={<AdminConnect dark={dark} setDark={setDark} />} />
      </Routes>
    
      {!isAdminRoute && <Footer />}
    </div>
   
  )
}

export default App
