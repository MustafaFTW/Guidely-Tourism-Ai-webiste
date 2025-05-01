// Authentication utility functions

// Log out current user (works for both regular and admin users)
export const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    // You can add other user data to remove here
  };
  
  // Check if user is authenticated
  export const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };
  
  // Check if user is an admin
  export const isAdmin = () => {
    return localStorage.getItem('userRole') === 'admin';
  };
  
  // Login as regular user
  export const loginUser = (email, password) => {
    // In a real app, this would validate against your backend
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'user');
    return true;
  };
  
  // Login as admin
  export const loginAdmin = (username, password) => {
    // In a real app, this would validate against your backend
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      return true;
    }
    return false;
  };