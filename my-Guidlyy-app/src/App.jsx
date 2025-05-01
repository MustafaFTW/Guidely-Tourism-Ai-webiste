import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/pages/Home';
import Register from './components/auth/register';
import Login from './components/auth/login';
import AdminLogin from './components/admin/AdminLogin'; // Import the new AdminLogin component
import SearchPage from './components/pages/searchpage';
import NearbyPlaces from './components/pages/nearbyme';
import PlacesNearMe from './components/pages/placesNearMe';
import AdminDashboard from './components/admin/AdminDashboard.jsx';

// Import styles
import './components/styles/AdminDashboard.css';

// Enhanced ProtectedRoute that handles admin-specific routes
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  
  // Not authenticated at all - redirect to appropriate login
  if (!isAuthenticated) {
    return requireAdmin 
      ? <Navigate to="/admin/login" /> 
      : <Navigate to="/login" />;
  }
  
  // Authenticated but not admin, trying to access admin route
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" />;
  }
  
  // All checks passed, render the protected component
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/nearby" element={<NearbyPlaces />} />
        <Route path="/near-me" element={<PlacesNearMe />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <div>Chatbot Page</div>
          </ProtectedRoute>
        } />
        
        {/* Admin Dashboard Routes - with requireAdmin flag */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/Admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/AdminDashboard" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Catch misspelled variant */}
        <Route path="/AdminDashoboard" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;