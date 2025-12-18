import { useNavigate, useParams } from 'react-router-dom';
import { lessons } from '../data/lessons';
import { categories } from '../data/categories';
import Header from '../components/Header';
import './LessonDetailPage.css';

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const lesson = lessons.find((l) => l.id === lessonId);

  if (!lesson) {
    return <div>Lesson not found.</div>;
  }

  const category = categories.find((c) => c.id === lesson.categoryId);

  const handleStartPractice = () => {
    navigate(`/practice/${lesson.id}`);
  };

  const handleGoBack = () => {
    navigate(`/category/${lesson.categoryId}/${lesson.level}`);
  };

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <button className="back-button" onClick={handleGoBack}>
          ← Back to List
        </button>

        <section className="lesson-detail">
          <div className="lesson-detail-header">
            <div className="lesson-detail-category">
              {category?.emoji} {category?.name} / {lesson.level === 'word' ? 'Word' : 'Phrase'}
            </div>
            <h1 className="lesson-detail-title">{lesson.title}</h1>
            <span className="lesson-detail-difficulty">{lesson.difficulty}</span>
          </div>

          <div className="lesson-detail-content">
            <div className="lesson-detail-section">
              <h2 className="lesson-section-title">Description</h2>
              <p className="lesson-section-text">{lesson.description}</p>
            </div>

            <div className="lesson-detail-section">
              <h2 className="lesson-section-title">Learning Tips</h2>
              <p className="lesson-section-text lesson-tips">{lesson.tips}</p>
            </div>

            <div className="lesson-detail-preview">
              <h2 className="lesson-section-title">Answer Preview</h2>
              <div className="preview-placeholder">
                <div className="preview-icon">👁️</div>
                <p className="preview-text">The correct silhouette will be shown during the actual lesson</p>
              </div>
            </div>

            <button className="start-practice-button" onClick={handleStartPractice}>
              Start Learning 🚀
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
