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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await backendApi.getCategories();
      setCategories(data);
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
          {categories.map((category) => (
            <button
              key={category.id}
              className="category-card"
              style={{ backgroundColor: getCategoryColor(category.code) }}
              onClick={() => navigate(`/category/${category.id}`)}
            >
              <div className="category-emoji">{category.iconEmoji}</div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
            </button>
          ))}
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
