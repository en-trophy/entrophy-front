import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
import { saveAuth } from '../utils/auth';
import Header from '../components/Header';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('signup') === 'true');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ loginId, password });
      saveAuth(response);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.signup({ loginId, password, name });
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setIsSignup(false);
    setPassword('');
    setName('');
  };

  return (
    <div className="login-page">
      <div className="page-container">
        <Header />

        <div className="login-content">
          <div className="login-card">
            <div className="login-logo">
              <img src="/equal_sign_logo.svg" alt="Equal Sign Logo" />
            </div>

            <div className="login-welcome">
              <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
              <p>{isSignup ? 'Sign up to start learning sign language with AI' : 'Login to continue your sign language journey'}</p>
            </div>

            <div className="login-tabs">
              <button
                className={`login-tab ${!isSignup ? 'active' : ''}`}
                onClick={() => {
                  setIsSignup(false);
                  setError('');
                }}
              >
                Login
              </button>
              <button
                className={`login-tab ${isSignup ? 'active' : ''}`}
                onClick={() => {
                  setIsSignup(true);
                  setError('');
                }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={isSignup ? handleSignup : handleLogin} className="login-form">
              {isSignup && (
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Login ID</label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter your login ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Login')}
              </button>
            </form>

            <button className="back-to-home" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={handleSuccessModalClose}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">🎉</div>
            <h2>Sign Up Successful!</h2>
            <p>Your account has been created successfully. Please log in to continue.</p>
            <button className="success-button" onClick={handleSuccessModalClose}>
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
