import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { lessons } from '../data/lessons';
import { categories } from '../data/categories';
import Header from '../components/Header';
import './ResultPage.css';

export default function ResultPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const lesson = lessons.find((l) => l.id === lessonId);
  const category = categories.find((c) => c.id === lesson?.categoryId);

  // Get score and time from location.state
  const finalScore = (location.state as any)?.finalScore || 0;
  const practiceTime = (location.state as any)?.practiceTime || 0;

  if (!lesson) {
    return <div>Lesson not found.</div>;
  }

  // Recommend other lessons from the same category
  const recommendedLessons = lessons
    .filter((l) => l.categoryId === lesson.categoryId && l.id !== lesson.id)
    .slice(0, 3);

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return 'Perfect! 🎉';
    if (score >= 80) return 'Excellent! 👏';
    if (score >= 70) return 'Good job! 👍';
    if (score >= 60) return 'Not bad! 💪';
    return 'You can do better! 📚';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#16c60c';
    if (score >= 60) return '#FFD700';
    return '#FFA07A';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <section className="result-hero">
          <div className="result-icon">🎯</div>
          <h1 className="result-title">Lesson Complete!</h1>
          <p className="result-subtitle">{getScoreMessage(finalScore)}</p>
        </section>

        <section className="result-stats">
          <div className="stat-card">
            <div className="stat-label">Final Score</div>
            <div className="stat-value" style={{ color: getScoreColor(finalScore) }}>
              {finalScore}pts
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Practice Time</div>
            <div className="stat-value">{formatTime(practiceTime)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">What you learned</div>
            <div className="stat-value-text">{lesson.title}</div>
          </div>
        </section>

        <section className="result-feedback">
          <h2 className="result-section-title">AI Feedback</h2>
          <div className="feedback-box">
            {finalScore >= 80 ? (
              <p>You have expressed the sign language with accurate hand gestures! Move on to the next step.</p>
            ) : finalScore >= 60 ? (
              <p>You have mastered the basics. Try to be more precise with your finger angles and positions.</p>
            ) : (
              <p>Practice slowly following the answer silhouette. Repetition is important!</p>
            )}
          </div>
        </section>

        <section className="result-actions">
          <button
            className="result-button result-button-retry"
            onClick={() => navigate(`/practice/${lesson.id}`)}
          >
            🔄 Try Again
          </button>
          <button
            className="result-button result-button-list"
            onClick={() => navigate(`/category/${lesson.categoryId}/${lesson.level}`)}
          >
            📝 Back to List
          </button>
          <button
            className="result-button result-button-home"
            onClick={() => navigate('/')}
          >
            🏠 Back to Home
          </button>
        </section>

        {recommendedLessons.length > 0 && (
          <section className="result-recommendations">
            <h2 className="result-section-title">Next Recommended Lessons</h2>
            <div className="recommended-grid">
              {recommendedLessons.map((rec) => (
                <div key={rec.id} className="recommended-card">
                  <h3 className="recommended-title">{rec.title}</h3>
                  <p className="recommended-description">{rec.description}</p>
                  <button
                    className="recommended-button"
                    onClick={() => navigate(`/lesson/${rec.id}`)}
                  >
                    Start Learning →
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
