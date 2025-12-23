import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { lessons } from '../data/lessons';
import Camera from '../components/Camera';
import ScoreBoard from '../components/ScoreBoard';
import Header from '../components/Header';
import './PracticePage.css';

export default function PracticePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [practiceTime, setPracticeTime] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const lesson = lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    const timer = setInterval(() => {
      setPracticeTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!lesson) {
    return <div>Lesson not found.</div>;
  }

  const handleSuccess = () => {
    setShowSuccessModal(true);
  };

  const handleComplete = () => {
    navigate(`/result/${lesson.id}`, {
      state: {
        finalScore: score,
        practiceTime,
      },
    });
  };

  const handleExit = () => {
    const confirmed = window.confirm('Are you sure you want to exit? Your progress will not be saved.');
    if (confirmed) {
      navigate(`/lesson/${lesson.id}`);
    }
  };

  return (
    <div className="practice-page">
      <div className="practice-container">
        <Header />

        <div className="practice-header">
          <button className="practice-exit-button" onClick={handleExit}>
            ← Exit
          </button>
          <div className="practice-timer">⏱️ {Math.floor(practiceTime / 60)}:{(practiceTime % 60).toString().padStart(2, '0')}</div>
        </div>

        <ScoreBoard score={score} targetWord={lesson.title} />

        <Camera
          targetPose={lesson.pose}
          lessonId={lessonId}
          onScoreUpdate={setScore}
          onSuccess={handleSuccess}
        />

        <div className="practice-controls">
          <div className="practice-tips">
            <strong>💡 Tip:</strong> {lesson.tips}
          </div>
          <button className="practice-complete-button" onClick={handleComplete}>
            Complete Learning
          </button>
        </div>

        <div className="practice-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#00d26a' }} />
            <span>Accurate</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ffb800' }} />
            <span>Moderate</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ff4444' }} />
            <span>Error</span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={handleComplete}>
          <div className="success-modal">
            <div className="success-icon">🎉</div>
            <h2>Success!</h2>
            <p>You've successfully performed the sign language!</p>
            <button className="success-button" onClick={handleComplete}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
