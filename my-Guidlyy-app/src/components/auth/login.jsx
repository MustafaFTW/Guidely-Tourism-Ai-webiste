import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuidlyLogo from './GuidlyLogo1.png'; // Adjust the path as necessary

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation that fields aren't empty
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    // Show loading state briefly
    setLoading(true);
    
    // Simple timeout to simulate processing
    setTimeout(() => {
      // Simply redirect to home page
      navigate('/');
    }, 500);
  };

  // Custom styles to match the home page aesthetic
  const styles = {
    loginPage: {
      backgroundColor: 'white',
      minHeight: '100vh',
      color: '#333',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '15px 40px',
      display: 'flex',
      alignItems: 'center'
    },
    logo: {
      height: '40px'
    },
    mainSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      flex: '1'
    },
    formContainer: {
      maxWidth: '450px',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      padding: '30px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: '16px',
      color: '#70757a',
      marginBottom: '30px',
      textAlign: 'center'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      transition: 'border-color 0.3s',
      outline: 'none',
      backgroundColor: '#f5f5f5', // Light gray background instead of black
      color: '#333' // Dark text for contrast
    },
    forgotPassword: {
      textAlign: 'right',
      marginBottom: '25px'
    },
    forgotLink: {
      color: '#1a73e8',
      textDecoration: 'none'
    },
    registerLink: {
      color: '#1a73e8',
      textDecoration: 'none',
      display: 'inline-block',
      marginTop: '5px'
    },
    submitBtn: {
      backgroundColor: '#1a73e8',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      width: '100%',
      fontSize: '16px',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.loginPage}>
      {/* Header */}
      <header style={styles.header}>
        <Link to="/">
          <img src={GuidlyLogo} alt="Guidely Logo" style={styles.logo} />
        </Link>
      </header>

      {/* Main Section */}
      <main style={styles.mainSection}>
        <div style={styles.formContainer}>
          <h1 style={styles.title}>Sign in to Guidely</h1>
          <p style={styles.subtitle}>Enter your credentials to access your account</p>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.forgotPassword}>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
            </div>
            
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div style={{textAlign: 'center', marginTop: '20px'}}>
              Don't have an account? <Link to="/register" style={styles.registerLink}>Register</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;