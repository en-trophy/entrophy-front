import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendApi } from '../services/api';
import type { Lesson } from '../types';
import Camera from '../components/Camera';
import ScoreBoard from '../components/ScoreBoard';
import Header from '../components/Header';
import './PracticePage.css';

export default function PracticePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [score, setScore] = useState(0);
  const [practiceTime, setPracticeTime] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{
    message: string;
    score: number;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    // isAnalyzing이 true이거나 isChecking이 false면 타이머 정지
    if (isAnalyzing || !isChecking) return;

    const timer = setInterval(() => {
      setPracticeTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnalyzing, isChecking]);

  const loadLesson = async () => {
    if (!lessonId) return;

    try {
      const numericId = parseInt(lessonId, 10);
      const data = await backendApi.getLesson(numericId);
      setLesson(data);
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    console.log('🎉 Success! Pausing timer');
    setShowSuccessModal(true);
    setIsChecking(false); // 타이머 멈춤
  };

  const handleStart = () => {
    console.log('✅ Start Practice button clicked!');
    setIsChecking(true);
  };

  const handleFeedback = (feedback: string, score: number) => {
    console.log('📢 Feedback received, pausing timer');
    setCurrentFeedback({ message: feedback, score });
    setShowFeedbackModal(true);
    setIsChecking(false);
  };

  const handleRetry = () => {
    console.log('🔄 Try Again button clicked, restarting timer');
    setShowFeedbackModal(false);
    setIsChecking(true);
  };

  const handleComplete = () => {
    if (lesson) {
      navigate(`/result/${lesson.id}`, {
        state: {
          finalScore: score,
          practiceTime,
        },
      });
    }
  };

  const handleExit = () => {
    if (lesson) {
      navigate(`/lesson/${lesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="practice-page">
        <div className="practice-container">
          <Header />
          <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="practice-page">
        <div className="practice-container">
          <Header />
          <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px', color: '#d13438' }}>
            Lesson not found.
          </div>
        </div>
      </div>
    );
  }

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

        <ScoreBoard score={score} targetWord={lesson.title} feedback={currentFeedback?.message} />

        <div style={{ position: 'relative' }}>
          <Camera
            targetPose={null}
            lessonId={lesson.id.toString()}
            onScoreUpdate={setScore}
            onSuccess={handleSuccess}
            onFeedback={handleFeedback}
            isRunning={isChecking}
            onAnalyzingChange={setIsAnalyzing}
          />

          {/* Start Button Overlay */}
          {!isChecking && !showSuccessModal && !showFeedbackModal && (
            <div className="practice-start-overlay">
              <button className="practice-start-button" onClick={handleStart}>
                Start Practice
              </button>
            </div>
          )}
        </div>

        <div className="practice-controls">
          <button className="practice-hint-button" onClick={() => setShowHint(!showHint)}>
            💡 {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          <button className="practice-complete-button" onClick={handleComplete}>
            Complete Learning
          </button>
        </div>

        {/* Hint Section */}
        {showHint && (
          <div className="practice-hint-section">
            {lesson.videoUrl ? (
              <div className="hint-video-container">
                <video
                  src={lesson.videoUrl}
                  controls
                  autoPlay
                  loop
                  className="hint-video"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : lesson.imageUrl ? (
              <div className="hint-image-container">
                <img
                  src={lesson.imageUrl}
                  alt={`${lesson.title} hint`}
                  className="hint-image"
                />
              </div>
            ) : (
              <div className="hint-no-media">
                No visual hint available for this lesson.
              </div>
            )}
          </div>
        )}
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

      {/* Feedback Modal */}
      {showFeedbackModal && currentFeedback && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="feedback-icon">💡</div>
            <h2>Feedback</h2>
            <p className="feedback-score">Score: {currentFeedback.score}/100</p>
            <p className="feedback-message">{currentFeedback.message}</p>
            <button className="retry-button" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
