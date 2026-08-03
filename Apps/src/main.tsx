// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './components/SignupPage/AuthContext';
// import Admin from './components/Admin/Admin';

createRoot(document.getElementById('root')!).render(
 
    <AuthProvider>
      <BrowserRouter>
        <App />
        {/* <Admin /> */}
        

      </BrowserRouter>
    </AuthProvider>

);
