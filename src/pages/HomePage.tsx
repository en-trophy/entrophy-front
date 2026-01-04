import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SidebarNav from '../components/SidebarNav';
import { backendApi } from '../services/api';
import type { Category, Lesson } from '../types';
import { getCategoryColor } from '../types';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Lesson[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const performSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await backendApi.searchLessons(searchKeyword);
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search lessons:', err);
      setSearchResults([]);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setSearchResults([]);
    setIsSearching(false);
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
          <p className="hero-subtitle">
            {isSearching ? 'Search results' : 'Select a category to start learning sign language'}
          </p>

          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search lessons (e.g., 'hello', 'thank you'...)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            <button className="search-button" onClick={performSearch}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="6" strokeWidth="2" />
                <path d="M20 20L15.5 15.5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {searchKeyword && (
              <button className="search-clear-button" onClick={handleClearSearch}>
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Search Results */}
        {isSearching && (
          <section className="search-results">
            {searchResults.length > 0 ? (
              <>
                <div className="search-results-header">
                  Found {searchResults.length} {searchResults.length === 1 ? 'lesson' : 'lessons'}
                </div>
                <div className="search-results-grid">
                  {searchResults.map((lesson) => (
                    <button
                      key={lesson.id}
                      className="search-result-card"
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                    >
                      <div className="search-result-header">
                        <h3 className="search-result-title">{lesson.title}</h3>
                        <span className="search-result-type">{lesson.type}</span>
                      </div>
                      <div className="search-result-category">{lesson.categoryName}</div>
                      {lesson.videoUrl && (
                        <div className="search-result-video">
                          <video
                            src={lesson.videoUrl}
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                        </div>
                      )}
                      {lesson.imageUrl && !lesson.videoUrl && (
                        <div className="search-result-image">
                          <img src={lesson.imageUrl} alt={lesson.title} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="search-no-results">
                No lessons found for "{searchKeyword}"
              </div>
            )}
          </section>
        )}

        {/* Categories Grid */}
        {!isSearching && (
          <section className="categories-grid">
          {categories.map((category) => {
            const lessonCount = lessonCounts.get(category.id) || 0;
            const hasLessons = lessonCount > 0;

            return (
              <button
                key={category.id}
                className={`category-card ${!hasLessons ? 'disabled' : ''}`}
                style={{ backgroundColor: getCategoryColor(category.code) }}
                onClick={() => {
                  if (!hasLessons) return;
                  // Alphabet category (id: 8) goes directly to word page
                  if (category.id === 8) {
                    navigate(`/category/8/word`);
                  } else {
                    navigate(`/category/${category.id}`);
                  }
                }}
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
        )}

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
