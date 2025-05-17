import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/login-register/Login';
import Register from './components/login-register/Register';
import LandingPage from './components/LandingPage';
import Homepage from './components/Homepage';
import AccountPage from './components/AccountPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';

// Create a custom hook to listen for localStorage changes
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue === null ? defaultValue : storedValue === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const newValue = localStorage.getItem(key);
      setValue(newValue === null ? defaultValue : newValue === 'true');
    };

    // Set up event listener for changes in localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for local changes (within same window)
    window.addEventListener('localStorageChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, [key, defaultValue]);

  return value;
}

function App() {
  // Use the custom hook to track auth status
  const isLoggedIn = useLocalStorage('isLoggedIn', false);
  const isAdmin = useLocalStorage('isAdmin', false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Set loaded state after a short delay to ensure consistent rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show nothing until auth state is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={
          isLoggedIn ? (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/homepage" replace />) : <Login />
        } />
        <Route path="/register" element={
          isLoggedIn ? <Navigate to="/homepage" replace /> : <Register />
        } />
        
        <Route path="/homepage" element={
          !isLoggedIn ? <Navigate to="/login" replace /> : 
            (isAdmin ? <Navigate to="/admin" replace /> : <Homepage />)
        } />
        <Route path="/account" element={
          isLoggedIn ? <AccountPage /> : <Navigate to="/login" replace />
        } />
        
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;