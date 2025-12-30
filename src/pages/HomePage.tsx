import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SidebarNav from '../components/SidebarNav';
import { backendApi } from '../services/api';
import type { Category } from '../types';
import { getCategoryColor } from '../types';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [categoriesData, lessonsData] = await Promise.all([
        backendApi.getCategories(),
        backendApi.getLessons(),
      ]);

      // 카테고리별 레슨 개수 계산
      const counts = new Map<number, number>();
      lessonsData.forEach((lesson) => {
        counts.set(lesson.categoryId, (counts.get(lesson.categoryId) || 0) + 1);
      });

      setCategories(categoriesData);
      setLessonCounts(counts);
      setError(null);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const content = (() => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px' }}>
          Loading categories...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px', color: '#d13438' }}>
          {error}
        </div>
      );
    }

    return (
      <>
        <section className="hero-section">
          <h2 className="hero-title">What would you like to learn?</h2>
          <p className="hero-subtitle">Select a category to start learning sign language</p>
        </section>

        <section className="categories-grid">
          {categories.map((category) => {
            const lessonCount = lessonCounts.get(category.id) || 0;
            const hasLessons = lessonCount > 0;

            return (
              <button
                key={category.id}
                className={`category-card ${!hasLessons ? 'disabled' : ''}`}
                style={{ backgroundColor: getCategoryColor(category.code) }}
                onClick={() => hasLessons && navigate(`/category/${category.id}`)}
                disabled={!hasLessons}
              >
                <div className="category-emoji">{category.iconEmoji}</div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                {!hasLessons && (
                  <p className="category-no-data">No lessons available yet</p>
                )}
              </button>
            );
          })}
        </section>

        <footer className="home-footer">
          <p className="home-footer-text">
            AI Sign Language Tutor for Improving Deaf Education Accessibility
          </p>
        </footer>
      </>
    );
  })();

  return (
    <div className="page">
      <div className="page-layout">
        <SidebarNav />

        <main className="page-content">
          <div className="page-container">
            <Header />
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
