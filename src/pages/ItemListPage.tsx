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
    return <div>카테고리를 찾을 수 없습니다.</div>;
  }

  const levelName = level === 'word' ? '단어' : '문장';

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
        return '쉬움';
      case 'MEDIUM':
        return '보통';
      case 'HARD':
        return '어려움';
      default:
        return difficulty;
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <button className="back-button" onClick={() => navigate(`/category/${categoryId}`)}>
          ← 뒤로 가기
        </button>

        <section className="list-header">
          <div className="list-header-content">
            <div className="list-header-emoji">{category.emoji}</div>
            <div>
              <h1 className="list-header-title">
                {category.name} - {levelName} 학습
              </h1>
              <p className="list-header-subtitle">
                {filteredLessons.length}개의 레슨이 준비되어 있습니다
              </p>
            </div>
          </div>
        </section>

        <section className="lessons-grid">
          {filteredLessons.length === 0 ? (
            <div className="no-lessons">
              <p>아직 준비된 레슨이 없습니다.</p>
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
                  학습하기 →
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
