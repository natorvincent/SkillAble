// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
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
import PersonalHygieneLevel4 from './components/lesson/PersonalHygieneLevel4';
import PersonalHygieneLevel5 from './components/lesson/PersonalHygieneLevel5';
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

// Custom hook to check auth status without causing re-renders
function useAuthStatus() {
  const [authStatus, setAuthStatus] = useState(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    return {
      isLoggedIn: !!(token && userEmail),
      isAdmin: localStorage.getItem("isAdmin") === "true",
      userRole: userRole || "STUDENT"
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

// Component to handle route-specific logic
function RouteHandler({ children, requireAuth = false, requireRole = null }) {
  const { isLoggedIn, userRole } = useAuthStatus();
  const location = useLocation();

  // If auth is not required, just render the children
  if (!requireAuth) {
    return children;
  }

  // If auth is required but user is not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If specific role is required but user doesn't have it
  if (requireRole && userRole !== requireRole) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'TEACHER') return <Navigate to="/teacherdashboard" replace />;
    if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/studentdashboard" replace />;
  }

  // User is authenticated and has required role (if any)
  return children;
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <Router>
      <Routes>
        {/* Public routes (accessible without login) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Auth routes */}
        <Route path="/login" element={
          <RouteHandler>
            <Login />
          </RouteHandler>
        } />
        
        <Route path="/register" element={
          <RouteHandler>
            <Register />
          </RouteHandler>
        } />
        
        {/* Dashboard routes - NO authentication checks to prevent loops */}
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/teacherdashboard" element={<TeacherDashboard />} />
        
        {/* Protected routes */}
        <Route path="/account" element={
          <RouteHandler requireAuth>
            <AccountPage />
          </RouteHandler>
        } />
        
        <Route path="/badges" element={
          <RouteHandler requireAuth>
            <BadgesPage />
          </RouteHandler>
        } />

        <Route path="/module/:moduleId" element={
          <RouteHandler requireAuth>
            <ModuleDetails />
          </RouteHandler>
        } />

        <Route path="/manageStudents" element={
          <RouteHandler requireAuth requireRole="TEACHER">
            <ManageStudents />
          </RouteHandler>
        } />
        
        <Route path="/studentProgress" element={
          <RouteHandler requireAuth requireRole="TEACHER">
            <StudentProgress />
          </RouteHandler>
        } />

        {/* Cooking Routes */}
        <Route path="/lesson/cooking/level-1/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel1 />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-2/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel2 />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-3/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel3 />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-4/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel4 />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-5/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel5 />
          </RouteHandler>
        } />

        {/* Cooking Routes - without moduleId */}
        <Route path="/lesson/cooking/level-1/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel1 />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-2/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel2 />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-3/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel3 />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-4/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel4 />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-5/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel5 />
          </RouteHandler>
        } />

        {/* Cooking Routes - Fallback */}
        <Route path="/lesson/cooking/level-1" element={
          <RouteHandler requireAuth>
            <Navigate to="/lesson/cooking/level-1/1/1" replace />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-2" element={
          <RouteHandler requireAuth>
            <Navigate to="/lesson/cooking/level-2/1/2" replace />
          </RouteHandler>
        } />
          
        <Route path="/lesson/cooking/level-3" element={
          <RouteHandler requireAuth>
            <Navigate to="/lesson/cooking/level-3/1/3" replace />
          </RouteHandler>
        } />

        <Route path="/lesson/cooking/level-4" element={
          <RouteHandler requireAuth>
            <Navigate to="/lesson/cooking/level-4/1/4" replace />
          </RouteHandler>
        } />
          
        <Route path="/lesson/cooking/level-5" element={
          <RouteHandler requireAuth>
            <Navigate to="/lesson/cooking/level-5/1/5" replace />
          </RouteHandler>
        } />

        {/* Original cooking route */}
        <Route path="/lesson/cooking/:lessonId" element={
          <RouteHandler requireAuth>
            <CookingLevel1 />
          </RouteHandler>
        } />

        {/* Household Chores Routes */}
        <Route path="/lesson/household-chores/level-1/:lessonId" element={
          <RouteHandler requireAuth>
            <HouseholdLevel1 />
          </RouteHandler>
        } />
          
        <Route path="/lesson/household-chores/level-2/:lessonId" element={
          <RouteHandler requireAuth>
            <HouseholdLevel2 />
          </RouteHandler>
        } />

        <Route path="/lesson/household-chores/level-3/:lessonId" element={
          <RouteHandler requireAuth>
            <HouseholdLevel3 />
          </RouteHandler>
        } />

        <Route path="/lesson/household-chores/level-4/:lessonId" element={
          <RouteHandler requireAuth>
            <HouseholdLevel4 />
          </RouteHandler>
        } />

        <Route path="/lesson/household-chores/:lessonId" element={
          <RouteHandler requireAuth>
            <HouseholdLevel1 />
          </RouteHandler>
        } />

        {/* Personal Hygiene Level Routes */}
        <Route path="/lesson/hygiene/level-1/:lessonId" element={
          <RouteHandler requireAuth>
            <PersonalHygieneLevel1 />
          </RouteHandler>
        } />

        <Route path="/lesson/hygiene/level-2/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <PersonalHygieneLevel2 />
          </RouteHandler>
        } />

        <Route path="/lesson/hygiene/level-3/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <PersonalHygieneLevel3 />
          </RouteHandler>
        } />

        <Route path="/lesson/hygiene/level-4/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <PersonalHygieneLevel4 />
          </RouteHandler>
        } />

        <Route path="/lesson/hygiene/level-5/:moduleId/:lessonId" element={
          <RouteHandler requireAuth>
            <PersonalHygieneLevel5 />
          </RouteHandler>
        } />

        {/* Generic hygiene route */}
        <Route path="/lesson/hygiene/:lessonId" element={
          <RouteHandler requireAuth>
            <PersonalHygieneLevel1 />
          </RouteHandler>
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
        
        {/* Legacy homepage route */}
        <Route path="/homepage" element={<Navigate to="/" replace />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;