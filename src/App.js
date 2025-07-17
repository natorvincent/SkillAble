// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/login-register/Login';
import Register from './components/login-register/Register';
import LandingPage from './components/LandingPage';
import AccountPage from './components/AccountPage';
import BadgesPage from './components/AchievementsPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';
import ModuleDetails from './components/ModuleDetails';
import PersonalHygieneLevel1 from './components/lesson/PersonalHygieneLevel1';
import PersonalHygieneLevel2 from './components/lesson/PersonalHygieneLevel2';
import PersonalHygieneLevel3 from './components/lesson/PersonalHygieneLevel3';
import SortingLevel1 from './components/lesson/SortingLevel1'; 
import CookingLevel1 from './components/lesson/CookingLevel1';
import CookingLevel2 from './components/lesson/CookingLevel2';
import CookingLevel3 from './components/lesson/CookingLevel3';
import CookingLevel4 from './components/lesson/CookingLevel4';
import HouseholdLevel1 from './components/lesson/HouseholdLevel1';
import ManageStudents from './components/teacher/ManageStudents';
import StudentProgress from './components/teacher/StudentProgress';
import AchievementsPage from './components/AchievementsPage';
import AboutUsPage from './components/AboutUsPage';
import ContactPage from './components/ContactPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

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
  // Helper function to get appropriate dashboard redirect
  const getDashboardRedirect = () => {
    if (isAdmin) return "/admin";
    
    const userType = localStorage.getItem('userType');
    if (userType === 'STUDENT') return "/studentdashboard";
    if (userType === 'TEACHER') return "/teacherdashboard";
    
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Public routes (accessible without login) */}
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        <Route path="/login" element={
          isLoggedIn ? (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to={getDashboardRedirect()} replace />) : <Login />
        } />
        <Route path="/register" element={
          isLoggedIn ? <Navigate to={getDashboardRedirect()} replace /> : <Register />
        } />
        
        {/* Dashboard routes (require login and specific user type) */}
        <Route path="/studentdashboard" element={
          !isLoggedIn ? <Navigate to="/login" replace /> : 
            (localStorage.getItem('userType') === 'STUDENT' ? <StudentDashboard /> : 
             <Navigate to={getDashboardRedirect()} replace />)
        } />
        
        <Route path="/teacherdashboard" element={
          !isLoggedIn ? <Navigate to="/login" replace /> : 
            (localStorage.getItem('userType') === 'TEACHER' ? <TeacherDashboard /> : 
             <Navigate to={getDashboardRedirect()} replace />)
        } />
        
        {/* Legacy homepage route - redirect to appropriate dashboard */}
        <Route path="/homepage" element={
          !isLoggedIn ? <Navigate to="/login" replace /> : 
            <Navigate to={getDashboardRedirect()} replace />
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

          {/* Cooking Routes */}
          <Route path="/lesson/cooking/level-1/:lessonId" element={
            isLoggedIn ? <CookingLevel1 /> : <Navigate to="/login" replace />
          } />

          <Route path="/lesson/cooking/level-2/:lessonId" element={
            isLoggedIn ? <CookingLevel2 /> : <Navigate to="/login" replace />
          } />

          <Route path="/lesson/cooking/level-3/:lessonId" element={
            isLoggedIn ? <CookingLevel3 /> : <Navigate to="/login" replace /> 
          } />

          <Route path="/lesson/cooking/level-4/:lessonId" element={
            isLoggedIn ? <CookingLevel4 /> : <Navigate to="/login" replace /> 
          } />

          <Route path="/lesson/cooking/:lessonId" element={
            isLoggedIn ? <CookingLevel1 /> : <Navigate to="/login" replace />
          } />

          {/* Personal Hygiene Level Routes */}
          <Route path="/lesson/hygiene/level-1/:lessonId" element={
            isLoggedIn ? <PersonalHygieneLevel1 /> : <Navigate to="/login" replace />
          } />

          <Route path="/lesson/hygiene/level-2/:moduleId/:lessonId" element={
            isLoggedIn ? <PersonalHygieneLevel2 /> : <Navigate to="/login" replace />
          } />

          {/* Personal Hygiene Level 3 Route */}
          <Route path="/lesson/hygiene/level-3/:moduleId/:lessonId" element={
            isLoggedIn ? <PersonalHygieneLevel3 /> : <Navigate to="/login" replace />
          } />

          {/* Household Chores Routes */}
          <Route path="/lesson/household-chores/level-1/:lessonId" element={
            isLoggedIn ? <HouseholdLevel1 /> : <Navigate to="/login" replace />
          } />

          {/* Generic household chores route (backwards compatibility) */}
          <Route path="/lesson/household-chores/:lessonId" element={
            isLoggedIn ? <HouseholdLevel1 /> : <Navigate to="/login" replace />
          } />

          {/* Generic hygiene route (backwards compatibility) */}
          <Route path="/lesson/hygiene/:lessonId" element={
            isLoggedIn ? <PersonalHygieneLevel1 /> : <Navigate to="/login" replace />
          } />

          {/* New Food Sorting Route */}
          <Route path="/lesson/food-sorting/:lessonId" element={
            isLoggedIn ? <SortingLevel1 /> : <Navigate to="/login" replace />
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