import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendApi } from '../services/api';
import type { Lesson } from '../types';
import { mapDifficulty } from '../types';
import Header from '../components/Header';
import './LessonDetailPage.css';

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      const numericId = parseInt(lessonId, 10);
      const data = await backendApi.getLesson(numericId);
      setLesson(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load lesson:', err);
      setError('Failed to load lesson. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (lesson) {
      navigate(`/practice/${lesson.id}`);
    }
  };

  const handleGoBack = () => {
    if (lesson) {
      navigate(`/category/${lesson.categoryId}/${lesson.type}`);
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

  if (error || !lesson) {
    return (
      <div className="page">
        <div className="page-container">
          <Header />
          <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px', color: '#d13438' }}>
            {error || 'Lesson not found.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-container">
        <Header />

        <button className="back-button" onClick={handleGoBack}>
          ← Back to List
        </button>

        <section className="lesson-detail">
          <div className="lesson-detail-header">
            <div className="lesson-detail-category">
              {lesson.categoryName} / {lesson.type === 'word' ? 'Word' : 'Phrase'}
            </div>
            <h1 className="lesson-detail-title">{lesson.title}</h1>
            <span className="lesson-detail-difficulty">{mapDifficulty(lesson.difficulty)}</span>
          </div>

          <div className="lesson-detail-content">
            <div className="lesson-detail-section">
              <h2 className="lesson-section-title">Sign Language</h2>
              <p className="lesson-section-text">{lesson.signLanguage}</p>
            </div>

            {lesson.videoUrl && (
              <div className="lesson-detail-section">
                <h2 className="lesson-section-title">Video Tutorial</h2>
                <video src={lesson.videoUrl} controls className="lesson-video" />
              </div>
            )}

            {lesson.imageUrl && (
              <div className="lesson-detail-preview">
                <h2 className="lesson-section-title">Practice Preview</h2>
                <div className="preview-image-container">
                  <img
                    src={lesson.imageUrl}
                    alt={`${lesson.title} sign language preview`}
                    className="preview-image"
                  />
                </div>
              </div>
            )}

            <button className="start-practice-button" onClick={handleStartPractice}>
              Start Learning
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
