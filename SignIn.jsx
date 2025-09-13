import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Snackbar, Alert } from '@mui/material';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from 'lucide-react';

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [poste, setPoste] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const userEmail = userCredential.user.email;
      
      if (userEmail) {
        const userDocRef = doc(db, 'authorizedUsers', userEmail);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const poste = userData.poste;

          if (poste) {
            localStorage.setItem('userPoste', poste);
            localStorage.setItem('userEmail', userEmail);
            setPoste(poste);
            setOpenSnackbar(true);
            
            setTimeout(() => {
              navigate('/mainapp');
            }, 1500);
          } else {
            setError('No role defined for this user.');
          }
        } else {
          setError('Unauthorized user.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="background-effects">
        <div className="effect effect-1"></div>
        <div className="effect effect-2"></div>
        <div className="energy-line" style={{top: '20%', width: '100%'}}></div>
        <div className="energy-line" style={{top: '40%', width: '80%', left: '10%'}}></div>
        <div className="energy-line" style={{top: '60%', width: '90%', left: '5%'}}></div>
        <div className="energy-line" style={{top: '80%', width: '70%', left: '15%'}}></div>
      </div>
      
      <div className="container">
        <div className="login-card">
          <div className="header">
            <div className="logo">
              <Zap size={40} className="animated-lamp" />
            </div>
            <h1>Energy</h1>
            <p className="subtitle">Access your energy management portal</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={14} /> Email Address
              </label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com" 
                required 
              />
              <div className="input-icon">
                <Mail size={16} />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <Lock size={14} /> Password
              </label>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••" 
                required 
              />
              <div className="input-icon">
                <Lock size={16} />
              </div>
              <div 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                style={{cursor: 'pointer'}}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>
            
            <div className="options">
              <label className="remember">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                /> 
                Remember me
              </label>
              <Link to="/forget-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            
            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
                    <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" fill="currentColor"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          
          </div>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setOpenSnackbar(false)} 
          sx={{ 
            width: '100%',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            color: '#2ecc71',
            border: '1px solid rgba(46, 204, 113, 0.5)',
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': {
              color: '#2ecc71'
            }
          }}
        >
          <span className="font-mono">✅ ACCESS GRANTED: <strong>{poste}</strong></span>
        </Alert>
      </Snackbar>

      <style jsx>{`
        .signin-container {
          background: linear-gradient(135deg, #0a1a12, #1c3b2a, #2a5c42);
          color: #fff;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        
        .container {
          width: 100%;
          max-width: 450px;
          z-index: 10;
        }
        
        .login-card {
          background: rgba(18, 25, 20, 0.85);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .login-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(72, 187, 120, 0.1),
            rgba(18, 25, 20, 0.1),
            rgba(46, 204, 113, 0.1)
          );
          transform: rotate(10deg);
          z-index: -1;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #48bb78, #2ecc71);
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 20px;
          box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .animated-lamp {
          color: #fff;
          animation: lampGlow 2s infinite alternate;
          filter: drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px #ffeb3b);
        }
        
        @keyframes lampGlow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.1);
            opacity: 0.9;
            filter: drop-shadow(0 0 8px #fff) drop-shadow(0 0 15px #ffeb3b) drop-shadow(0 0 20px #ff9800);
          }
        }
        
        .logo::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, transparent 30%, rgba(255, 235, 59, 0.2) 70%);
          animation: lightPulse 3s infinite alternate;
        }
        
        @keyframes lightPulse {
          0% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.7;
          }
        }
        
        h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(to right, #48bb78, #2ecc71);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .subtitle {
          color: #a0b8ac;
          font-size: 14px;
        }
        
        .form-group {
          margin-bottom: 25px;
          position: relative;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #a0b8ac;
          display: flex;
          align-items: center;
        }
        
        label svg {
          margin-right: 10px;
          color: #48bb78;
        }
        
        input[type="email"],
        input[type="password"] {
          width: 100%;
          padding: 15px 15px 15px 45px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 18px;
          transition: all 0.3s ease;
        }
        
        input[type="email"]:focus,
        input[type="password"]:focus {
          outline: none;
          border-color: #2ecc71;
          box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2);
        }
        
        .input-icon {
          position: absolute;
          left: 15px;
          top: 42px;
          color: #48bb78;
        }
        
        .password-toggle {
          position: absolute;
          right: 15px;
          top: 42px;
          color: #a0b8ac;
          cursor: pointer;
        }
        
        .options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          font-size: 14px;
        }
        
        .remember {
          display: flex;
          align-items: center;
          color: #a0b8ac;
        }
        
        input[type="checkbox"] {
          margin-right: 8px;
          accent-color: #2ecc71;
        }
        
        .forgot-password {
          color: #48bb78;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .forgot-password:hover {
          color: #2ecc71;
        }
        
        .login-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #48bb78, #2ecc71);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
        }
        
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 204, 113, 0.6);
        }
        
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .login-btn svg {
          transition: transform 0.3s ease;
        }
        
        .login-btn:hover:not(:disabled) svg:last-child {
          transform: translateX(5px);
        }
        
        .error-message {
          color: #e74c3c;
          padding: 12px;
          margin-bottom: 15px;
          background-color: rgba(231, 76, 60, 0.1);
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .divider {
          display: flex;
          align-items: center;
          margin: 25px 0;
          color: #a0b8ac;
        }
        
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .divider span {
          padding: 0 15px;
          font-size: 14px;
        }
        
        .alternative-actions {
          text-align: center;
          color: #a0b8ac;
          font-size: 14px;
        }
        
        .signup-link {
          color: #48bb78;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .signup-link:hover {
          color: #2ecc71;
          text-decoration: underline;
        }
        
        .background-effects {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          overflow: hidden;
        }
        
        .effect {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
        }
        
        .effect-1 {
          width: 300px;
          height: 300px;
          background: linear-gradient(#48bb78, #2ecc71);
          top: -150px;
          left: -150px;
          animation: pulse 15s infinite alternate;
        }
        
        .effect-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(#2ecc71, #0a1a12);
          bottom: -250px;
          right: -250px;
          animation: pulse 20s infinite alternate;
        }
        
        .energy-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, #48bb78, transparent);
          opacity: 0.3;
          animation: energyFlow 3s infinite linear;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.15;
          }
          100% {
            transform: scale(1);
            opacity: 0.1;
          }
        }
        
        @keyframes energyFlow {
          0% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 0.1;
          }
        }
        
        @media (max-width: 480px) {
          .login-card {
            padding: 25px;
          }
          
          h1 {
            font-size: 28px;
          }
          
          .options {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .forgot-password {
            margin-top: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default SignIn;