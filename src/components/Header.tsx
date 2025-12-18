import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/equal_sign_logo.png" alt="EqualSign Logo" width="100" height="100" />
          <h1 className="header-title">EqualSign</h1>
        </div>
        <p className="header-subtitle">Learn sign language with AI</p>
      </div>
      <div className="header-badge">
        <span className="header-badge-text">Powered by</span>
        <span className="header-badge-azure">Microsoft Azure</span>
      </div>
    </header>
  );
}
