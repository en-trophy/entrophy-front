import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './SessionTimeoutChecker.css';

export default function SessionTimeoutChecker() {
  const navigate = useNavigate();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    // 세션 만료 체크 - 매 10초마다
    const checkSessionExpiry = () => {
      if (authService.isAuthenticated() && authService.isSessionExpired()) {
        console.log('⏰ Session expired - logging out');
        setShowExpiredModal(true);
      }
    };

    // 초기 체크
    checkSessionExpiry();

    // 10초마다 체크
    const interval = setInterval(checkSessionExpiry, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleModalClose = () => {
    // 로그아웃 처리
    authService.logout();
    setShowExpiredModal(false);
    // 홈 화면으로 리다이렉트
    navigate('/');
    // 페이지 새로고침하여 로그아웃 상태 반영
    window.location.href = '/';
  };

  if (!showExpiredModal) return null;

  return (
    <div className="session-expired-modal-overlay" onClick={handleModalClose}>
      <div className="session-expired-modal" onClick={(e) => e.stopPropagation()}>
        <div className="session-expired-icon">⏰</div>
        <h2>Session Expired</h2>
        <p>Your session has expired. Please log in again to continue.</p>
        <button className="session-expired-button" onClick={handleModalClose}>
          Go to Home
        </button>
      </div>
    </div>
  );
}
