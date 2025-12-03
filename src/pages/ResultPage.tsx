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

  // location.state에서 점수와 시간 가져오기
  const finalScore = (location.state as any)?.finalScore || 0;
  const practiceTime = (location.state as any)?.practiceTime || 0;

  if (!lesson) {
    return <div>레슨을 찾을 수 없습니다.</div>;
  }

  // 같은 카테고리의 다른 레슨 추천
  const recommendedLessons = lessons
    .filter((l) => l.categoryId === lesson.categoryId && l.id !== lesson.id)
    .slice(0, 3);

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return '완벽합니다! 🎉';
    if (score >= 80) return '훌륭해요! 👏';
    if (score >= 70) return '잘했어요! 👍';
    if (score >= 60) return '괜찮아요! 💪';
    return '조금 더 연습해보세요! 📚';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#16c60c';
    if (score >= 60) return '#FFD700';
    return '#FFA07A';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <section className="result-hero">
          <div className="result-icon">🎯</div>
          <h1 className="result-title">학습 완료!</h1>
          <p className="result-subtitle">{getScoreMessage(finalScore)}</p>
        </section>

        <section className="result-stats">
          <div className="stat-card">
            <div className="stat-label">최종 점수</div>
            <div className="stat-value" style={{ color: getScoreColor(finalScore) }}>
              {finalScore}점
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">학습 시간</div>
            <div className="stat-value">{formatTime(practiceTime)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">학습한 내용</div>
            <div className="stat-value-text">{lesson.title}</div>
          </div>
        </section>

        <section className="result-feedback">
          <h2 className="result-section-title">AI 피드백</h2>
          <div className="feedback-box">
            {finalScore >= 80 ? (
              <p>정확한 손동작으로 수어를 표현하셨습니다! 다음 단계로 넘어가보세요.</p>
            ) : finalScore >= 60 ? (
              <p>기본은 잘 익히셨어요. 손가락 각도와 위치를 좀 더 정확하게 해보세요.</p>
            ) : (
              <p>천천히 정답 실루엣을 따라하며 연습해보세요. 반복이 중요합니다!</p>
            )}
          </div>
        </section>

        <section className="result-actions">
          <button
            className="result-button result-button-retry"
            onClick={() => navigate(`/practice/${lesson.id}`)}
          >
            🔄 다시 연습하기
          </button>
          <button
            className="result-button result-button-list"
            onClick={() => navigate(`/category/${lesson.categoryId}/${lesson.level}`)}
          >
            📝 목록으로
          </button>
          <button
            className="result-button result-button-home"
            onClick={() => navigate('/')}
          >
            🏠 홈으로
          </button>
        </section>

        {recommendedLessons.length > 0 && (
          <section className="result-recommendations">
            <h2 className="result-section-title">다음 추천 레슨</h2>
            <div className="recommended-grid">
              {recommendedLessons.map((rec) => (
                <div key={rec.id} className="recommended-card">
                  <h3 className="recommended-title">{rec.title}</h3>
                  <p className="recommended-description">{rec.description}</p>
                  <button
                    className="recommended-button"
                    onClick={() => navigate(`/lesson/${rec.id}`)}
                  >
                    학습하기 →
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
