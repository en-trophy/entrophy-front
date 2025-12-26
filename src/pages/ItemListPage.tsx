import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendApi } from '../services/api';
import type { Category, Lesson } from '../types';
import { mapDifficulty } from '../types';
import Header from '../components/Header';
import './ItemListPage.css';

export default function ItemListPage() {
  const { categoryId, level } = useParams<{ categoryId: string; level: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [categoryId, level]);

  const loadData = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      const numericId = parseInt(categoryId, 10);

      const [categoryData, lessonsData] = await Promise.all([
        backendApi.getCategories(),
        backendApi.getLessonsByCategory(numericId),
      ]);

      const foundCategory = categoryData.find((c) => c.id === numericId);
      if (!foundCategory) {
        setError('Category not found.');
        return;
      }

      // Filter lessons by type (WORD or PHRASE)
      const filteredLessons = lessonsData.filter(
        (lesson) => lesson.type.toUpperCase() === level?.toUpperCase()
      );

      setCategory(foundCategory);
      setLessons(filteredLessons);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    const mapped = mapDifficulty(difficulty);
    switch (mapped) {
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

  const getDifficultyLabel = (difficulty: number) => {
    return mapDifficulty(difficulty);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-container">
          <Header />
          <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="page">
        <div className="page-container">
          <Header />
          <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px', color: '#d13438' }}>
            {error || 'Category not found.'}
          </div>
        </div>
      </div>
    );
  }

  const levelName = level === 'word' ? 'Word' : 'Phrase';

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <button className="back-button" onClick={() => navigate(`/category/${categoryId}`)}>
          ← Back
        </button>

        <section className="list-header">
          <div className="list-header-content">
            <div className="list-header-emoji">{category.iconEmoji}</div>
            <div>
              <h1 className="list-header-title">
                {category.name} - {levelName} Learning
              </h1>
              <p className="list-header-subtitle">
                {lessons.length} lessons available
              </p>
            </div>
          </div>
        </section>

        <section className="lessons-grid">
          {lessons.length === 0 ? (
            <div className="no-lessons">
              <p>No lessons available yet.</p>
            </div>
          ) : (
            lessons.map((lesson) => (
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
                <p className="lesson-card-description">{lesson.signLanguage}</p>
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
