import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendApi } from '../services/api';
import type { Category, Lesson } from '../types';
import { getCategoryColor } from '../types';
import Header from '../components/Header';
import './CategoryDetailPage.css';

export default function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [categoryId]);

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

      setCategory(foundCategory);
      setLessons(lessonsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
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

  // 임시: type 구분 없이 전체 레슨 수 표시
  const totalCount = lessons.length;
  const wordCount = totalCount;
  const phraseCount = totalCount;

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <section className="category-hero" style={{ backgroundColor: getCategoryColor(category.code) }}>
          <div className="category-hero-emoji">{category.iconEmoji}</div>
          <h1 className="category-hero-title">{category.name}</h1>
          <p className="category-hero-description">{category.description}</p>
        </section>

        <section className="level-selection">
          <h2 className="level-title">Choose a learning level</h2>

          <div className="level-grid">
            <button
              className="level-card"
              onClick={() => navigate(`/category/${categoryId}/word`)}
              disabled={wordCount === 0}
            >
              <div className="level-card-icon">📝</div>
              <h3 className="level-card-title">Word Learning</h3>
              <p className="level-card-description">
                Learn basic words one by one
              </p>
              <div className="level-card-count">{wordCount} lessons</div>
            </button>

            <button
              className="level-card"
              onClick={() => navigate(`/category/${categoryId}/phrase`)}
              disabled={phraseCount === 0}
            >
              <div className="level-card-icon">💬</div>
              <h3 className="level-card-title">Phrase Learning</h3>
              <p className="level-card-description">
                Practice expressing complete sentences
              </p>
              <div className="level-card-count">{phraseCount} lessons</div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
