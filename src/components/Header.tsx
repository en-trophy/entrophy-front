import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="header-logo-icon">👋</div>
          <h1 className="header-title">EqualSign</h1>
        </div>
        <p className="header-subtitle">AI와 함께 배우는 수어 교육</p>
      </div>
      <div className="header-badge">
        <span className="header-badge-text">Powered by</span>
        <span className="header-badge-azure">Microsoft Azure</span>
      </div>
    </header>
  );
}
