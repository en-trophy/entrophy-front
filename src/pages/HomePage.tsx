import { useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';
import Header from '../components/Header';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <section className="hero-section">
          <h2 className="hero-title">What would you like to learn?</h2>
          <p className="hero-subtitle">Select a category to start learning sign language</p>
        </section>

        <section className="categories-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              className="category-card"
              style={{ backgroundColor: category.color }}
              onClick={() => navigate(`/category/${category.id}`)}
            >
              <div className="category-emoji">{category.emoji}</div>
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
      </div>
    </div>
  );
}
