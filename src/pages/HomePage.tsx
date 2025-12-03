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
          <h2 className="hero-title">무엇을 배우고 싶으신가요?</h2>
          <p className="hero-subtitle">카테고리를 선택하여 수어 학습을 시작하세요</p>
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
            청각 장애인 교육 접근성 향상을 위한 AI 수어 튜터
          </p>
        </footer>
      </div>
    </div>
  );
}
