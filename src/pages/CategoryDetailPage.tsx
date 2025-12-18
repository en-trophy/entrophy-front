import { useNavigate, useParams } from 'react-router-dom';
import { categories } from '../data/categories';
import { lessons } from '../data/lessons';
import Header from '../components/Header';
import './CategoryDetailPage.css';

export default function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return <div>Category not found.</div>;
  }

  // 해당 카테고리의 레슨 수 계산
  const wordCount = lessons.filter(
    (l) => l.categoryId === categoryId && l.level === 'word'
  ).length;
  const phraseCount = lessons.filter(
    (l) => l.categoryId === categoryId && l.level === 'phrase'
  ).length;

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <section className="category-hero" style={{ backgroundColor: category.color }}>
          <div className="category-hero-emoji">{category.emoji}</div>
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
