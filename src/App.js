// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/login-register/Login';
import Register from './components/login-register/Register';
import LandingPage from './components/LandingPage';
import Homepage from './components/Homepage';
import AccountPage from './components/AccountPage';
import BadgesPage from './components/AchievementsPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';
import ModuleDetails from './components/ModuleDetails';
import PersonalHygieneLevel1 from './components/lesson/PersonalHygieneLevel1';
import CookingLevel1 from './components/lesson/CookingLevel1';
import CookingLevel2 from './components/lesson/CookingLevel2'; // Add this import
import ManageStudents from './components/teacher/ManageStudents';
import StudentProgress from './components/teacher/StudentProgress';
import AchievementsPage from './components/AchievementsPage';

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

    window.addEventListener('storage', handleStorageChange);
    
    window.addEventListener('localStorageChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, [key, defaultValue]);

  return value;
}

function App() {
  const isLoggedIn = useLocalStorage('isLoggedIn', false);
  const isAdmin = useLocalStorage('isAdmin', false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
        
        <Route path="/achievements" element={
          !isLoggedIn ? <Navigate to="/login" replace /> : 
            (isAdmin ? <Navigate to="/admin" replace /> : <AchievementsPage/>)
        } />

        <Route path="/module/:moduleId" element={
          isLoggedIn ? <ModuleDetails /> : <Navigate to="/login" replace />
        } />

        <Route path="/manageStudents" element={
          isLoggedIn ? <ManageStudents /> : <Navigate to="/login" replace />
        } />
        <Route path="/studentProgress" element={
          isLoggedIn ? <StudentProgress /> : <Navigate to="/login" replace />
        } />

        {/* Cooking Level Routes */}
        <Route path="/lesson/cooking/level-1" element={
          isLoggedIn ? <CookingLevel1 /> : <Navigate to="/login" replace />
        } />
        
        <Route path="/lesson/cooking/level-2" element={
          isLoggedIn ? <CookingLevel2 /> : <Navigate to="/login" replace />
        } />

        {/* Generic cooking route (backwards compatibility) */}
        <Route path="/lesson/cooking/:lessonId" element={
          isLoggedIn ? <CookingLevel1 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/hygiene/:lessonId" element={
          isLoggedIn ? <PersonalHygieneLevel1 /> : <Navigate to="/login" replace />
        } />

        {/* Admin Routes */}
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