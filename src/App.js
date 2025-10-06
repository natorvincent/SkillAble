// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/login-register/Login';
import Register from './components/login-register/Register';
import LandingPage from './components/LandingPage';
import AccountPage from './components/AccountPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';
import ModuleDetails from './components/ModuleDetails';
import PersonalHygieneLevel1 from './components/lesson/PersonalHygieneLevel1';
import PersonalHygieneLevel2 from './components/lesson/PersonalHygieneLevel2';
import PersonalHygieneLevel3 from './components/lesson/PersonalHygieneLevel3';
import SortingLevel1 from './components/lesson/SortingLevel1'; 
import SortingLevel2 from './components/lesson/SortingLevel2'; 
import SortingLevel3 from './components/lesson/SortingLevel3'; 
import SortingLevel4 from './components/lesson/SortingLevel4'; 
import SortingLevel5 from './components/lesson/SortingLevel5'; 
import CookingLevel1 from './components/lesson/CookingLevel1';
import CookingLevel2 from './components/lesson/CookingLevel2';
import CookingLevel3 from './components/lesson/CookingLevel3';
import CookingLevel4 from './components/lesson/CookingLevel4';
import CookingLevel5 from './components/lesson/CookingLevel5';
import HouseholdLevel1 from './components/lesson/HouseholdLevel1';
import HouseholdLevel2 from './components/lesson/HouseholdLevel2';
import HouseholdLevel3 from './components/lesson/HouseholdLevel3';
import HouseholdLevel4 from './components/lesson/HouseholdLevel4';
import ManageStudents from './components/teacher/ManageStudents';
import StudentProgress from './components/teacher/StudentProgress';
import BadgesPage from './components/BadgesPage';
import AboutUsPage from './components/AboutUsPage';
import ContactPage from './components/ContactPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

// Simplified localStorage hook without state to prevent re-renders
function useAuthStatus() {
  const [authStatus, setAuthStatus] = useState(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole"); // Use userRole instead of userType
    return {
      isLoggedIn: !!(token && userEmail),
      isAdmin: localStorage.getItem("isAdmin") === "true",
      userRole: userRole || "STUDENT" // Changed from userType to userRole
    };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole");
      setAuthStatus({
        isLoggedIn: !!(token && userEmail),
        isAdmin: localStorage.getItem("isAdmin") === "true",
        userRole: userRole || "STUDENT"
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);

  return authStatus;
}

function App() {
  const { isLoggedIn, isAdmin, userRole } = useAuthStatus(); // Changed from userType to userRole
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to get appropriate dashboard redirect - FIXED
  const getDashboardRedirect = () => {
    if (isAdmin) return "/admin";
    if (userRole === 'TEACHER') return "/teacherdashboard";
    if (userRole === 'STUDENT') return "/studentdashboard";
    return "/"; // Fallback to landing page
  };

  // Don't render until loaded to prevent flash
  if (!isLoaded) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  console.log("App.js Routing - Current state:", {
    isLoggedIn,
    userRole,
    currentPath: window.location.pathname,
    token: !!localStorage.getItem('token'),
    userEmail: localStorage.getItem('userEmail')
  });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Public routes (accessible without login) */}
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Auth routes with FIXED navigation logic */}
        <Route path="/login" element={
          isLoggedIn ? <Navigate to={getDashboardRedirect()} replace /> : <Login />
        } />
        
        <Route path="/register" element={
          isLoggedIn ? <Navigate to={getDashboardRedirect()} replace /> : <Register />
        } />
        
        {/* Dashboard routes - REMOVED authentication checks to prevent loops */}
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/teacherdashboard" element={<TeacherDashboard />} />
        
        {/* Legacy homepage route - redirect to appropriate dashboard */}
        <Route path="/homepage" element={
          isLoggedIn ? <Navigate to={getDashboardRedirect()} replace /> : <Navigate to="/login" replace />
        } />
        
        <Route path="/account" element={
          isLoggedIn ? <AccountPage /> : <Navigate to="/login" replace />
        } />
        
        <Route path="/badges" element={
          isLoggedIn ? <BadgesPage /> : <Navigate to="/login" replace />
        } />

        <Route path="/module/:moduleId" element={
          isLoggedIn ? <ModuleDetails /> : <Navigate to="/login" replace />
        } />

        <Route path="/manageStudents" element={
          isLoggedIn && userRole === 'TEACHER' ? <ManageStudents /> : <Navigate to="/login" replace />
        } />
        
        <Route path="/studentProgress" element={
          isLoggedIn && userRole === 'TEACHER' ? <StudentProgress /> : <Navigate to="/login" replace />
        } />

        {/* Cooking Routes - WITH lessonId parameter */}
        <Route path="/lesson/cooking/level-1/:moduleId/:lessonId" element={
          isLoggedIn ? <CookingLevel1 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/cooking/level-2/:moduleId/:lessonId" element={
          isLoggedIn ? <CookingLevel2 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/cooking/level-3/:moduleId/:lessonId" element={
          isLoggedIn ? <CookingLevel3 /> : <Navigate to="/login" replace /> 
        } />

        <Route path="/lesson/cooking/level-4/:moduleId/:lessonId" element={
          isLoggedIn ? <CookingLevel4 /> : <Navigate to="/login" replace /> 
        } />

        <Route path="/lesson/cooking/level-5/:moduleId/:lessonId" element={
          isLoggedIn ? <CookingLevel5 /> : <Navigate to="/login" replace /> 
        } />

        {/* Cooking Routes - WITHOUT moduleId (fallback for backward compatibility) */}
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

        <Route path="/lesson/cooking/level-5/:lessonId" element={
          isLoggedIn ? <CookingLevel5 /> : <Navigate to="/login" replace /> 
        } />

        {/* Cooking Routes - Fallback without parameters (redirects to default lesson) */}
        <Route path="/lesson/cooking/level-1" element={
          isLoggedIn ? <Navigate to="/lesson/cooking/level-1/1/1" replace /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/cooking/level-2" element={
          isLoggedIn ? <Navigate to="/lesson/cooking/level-2/1/2" replace /> : <Navigate to="/login" replace />
        } />
          
        <Route path="/lesson/cooking/level-3" element={
          isLoggedIn ? <Navigate to="/lesson/cooking/level-3/1/3" replace /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/cooking/level-4" element={
          isLoggedIn ? <Navigate to="/lesson/cooking/level-4/1/4" replace /> : <Navigate to="/login" replace />
        } />
          
        <Route path="/lesson/cooking/level-5" element={
          isLoggedIn ? <Navigate to="/lesson/cooking/level-5/1/5" replace /> : <Navigate to="/login" replace />
        } />

        {/* Original cooking route - redirect to level 1 */}
        <Route path="/lesson/cooking/:lessonId" element={
          isLoggedIn ? <CookingLevel1 /> : <Navigate to="/login" replace />
        } />

        {/* Household Chores Routes */}
        <Route path="/lesson/household-chores/level-1/:lessonId" element={
          isLoggedIn ? <HouseholdLevel1 /> : <Navigate to="/login" replace />
        } />
          
        <Route path="/lesson/household-chores/level-2/:lessonId" element={
          isLoggedIn ? <HouseholdLevel2 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/household-chores/level-3/:lessonId" element={
          isLoggedIn ? <HouseholdLevel3 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/household-chores/level-4/:lessonId" element={
          isLoggedIn ? <HouseholdLevel4 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/household-chores/:lessonId" element={
          isLoggedIn ? <HouseholdLevel1 /> : <Navigate to="/login" replace />
        } />



        {/* Personal Hygiene Level Routes */}
        <Route path="/lesson/hygiene/level-1/:lessonId" element={
          isLoggedIn ? <PersonalHygieneLevel1 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/hygiene/level-2/:moduleId/:lessonId" element={
          isLoggedIn ? <PersonalHygieneLevel2 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/hygiene/level-3/:moduleId/:lessonId" element={
          isLoggedIn ? <PersonalHygieneLevel3 /> : <Navigate to="/login" replace />
        } />

        {/* Generic hygiene route (backwards compatibility) */}
        <Route path="/lesson/hygiene/:lessonId" element={
          isLoggedIn ? <PersonalHygieneLevel1 /> : <Navigate to="/login" replace />
        } />

        {/* Food Sorting Route */}
        <Route path="/lesson/food-sorting/level-1/:lessonId" element={
          isLoggedIn ? <SortingLevel1 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/food-sorting/level-2/:lessonId" element={
          isLoggedIn ? <SortingLevel2 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/food-sorting/level-3/:lessonId" element={
          isLoggedIn ? <SortingLevel3 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/food-sorting/level-4/:lessonId" element={
          isLoggedIn ? <SortingLevel4 /> : <Navigate to="/login" replace />
        } />

        <Route path="/lesson/food-sorting/level-5/:lessonId" element={
          isLoggedIn ? <SortingLevel5 /> : <Navigate to="/login" replace />
        } />

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
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;