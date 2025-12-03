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

  const lesson = lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    const timer = setInterval(() => {
      setPracticeTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!lesson) {
    return <div>레슨을 찾을 수 없습니다.</div>;
  }

  const handleComplete = () => {
    navigate(`/result/${lesson.id}`, {
      state: {
        finalScore: score,
        practiceTime,
      },
    });
  };

  const handleExit = () => {
    const confirmed = window.confirm('학습을 종료하시겠습니까? 진행 상황은 저장되지 않습니다.');
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
            ← 나가기
          </button>
          <div className="practice-timer">⏱️ {Math.floor(practiceTime / 60)}:{(practiceTime % 60).toString().padStart(2, '0')}</div>
        </div>

        <ScoreBoard score={score} targetWord={lesson.title} />

        <Camera targetPose={lesson.pose} onScoreUpdate={setScore} />

        <div className="practice-controls">
          <div className="practice-tips">
            <strong>💡 팁:</strong> {lesson.tips}
          </div>
          <button className="practice-complete-button" onClick={handleComplete}>
            학습 완료
          </button>
        </div>

        <div className="practice-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#00d26a' }} />
            <span>정확</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ffb800' }} />
            <span>보통</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ff4444' }} />
            <span>오차</span>
          </div>
        </div>
      </div>
    </div>
  );
}
