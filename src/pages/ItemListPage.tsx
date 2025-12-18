import { useNavigate, useParams } from 'react-router-dom';
import { categories } from '../data/categories';
import { lessons } from '../data/lessons';
import type { LessonLevel } from '../types';
import Header from '../components/Header';
import './ItemListPage.css';

export default function ItemListPage() {
  const { categoryId, level } = useParams<{ categoryId: string; level: LessonLevel }>();
  const navigate = useNavigate();

  const category = categories.find((c) => c.id === categoryId);
  const filteredLessons = lessons.filter(
    (l) => l.categoryId === categoryId && l.level === level
  );

  if (!category) {
    return <div>Category not found.</div>;
  }

  const levelName = level === 'word' ? 'Word' : 'Phrase';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '#90EE90';
      case 'MEDIUM':
        return '#FFD700';
      case 'HARD':
        return '#FFA07A';
      default:
        return '#e1dfdd';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'Easy';
      case 'MEDIUM':
        return 'Medium';
      case 'HARD':
        return 'Hard';
      default:
        return difficulty;
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <button className="back-button" onClick={() => navigate(`/category/${categoryId}`)}>
          ← Back
        </button>

        <section className="list-header">
          <div className="list-header-content">
            <div className="list-header-emoji">{category.emoji}</div>
            <div>
              <h1 className="list-header-title">
                {category.name} - {levelName} Learning
              </h1>
              <p className="list-header-subtitle">
                {filteredLessons.length} lessons available
              </p>
            </div>
          </div>
        </section>

        <section className="lessons-grid">
          {filteredLessons.length === 0 ? (
            <div className="no-lessons">
              <p>No lessons available yet.</p>
            </div>
          ) : (
            filteredLessons.map((lesson) => (
              <div key={lesson.id} className="lesson-card">
                <div className="lesson-card-header">
                  <h3 className="lesson-card-title">{lesson.title}</h3>
                  <span
                    className="lesson-card-difficulty"
                    style={{ backgroundColor: getDifficultyColor(lesson.difficulty) }}
                  >
                    {getDifficultyLabel(lesson.difficulty)}
                  </span>
                </div>
                <p className="lesson-card-description">{lesson.description}</p>
                <button
                  className="lesson-card-button"
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                >
                  Start Learning →
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
