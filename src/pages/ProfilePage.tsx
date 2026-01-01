import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { learningHistoryApi } from '../services/api';
import { authService } from '../services/authService';
import type { LearningHistory } from '../types';
import Header from '../components/Header';
import './ProfilePage.css';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [histories, setHistories] = useState<LearningHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'date' | 'category'>('date');
  const [user] = useState(() => authService.getUser());

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Memoize loadHistories to prevent unnecessary API calls
  const loadHistories = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await learningHistoryApi.getHistories(user.userId, selectedDate);
      setHistories(data);
    } catch (error) {
      console.error('Failed to load histories:', error);
      setHistories([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate]);

  // Load histories when date changes
  useEffect(() => {
    if (user) {
      loadHistories();
    }
  }, [loadHistories, user]);

  // Group histories by category (memoized to prevent flickering)
  const groupedHistories = useMemo(() => {
    const grouped = histories.reduce((acc, history) => {
      const key = history.categoryId;
      if (!acc[key]) {
        acc[key] = {
          categoryId: history.categoryId,
          categoryName: history.categoryName,
          items: [],
        };
      }
      acc[key].items.push(history);
      return acc;
    }, {} as Record<number, { categoryId: number; categoryName: string; items: LearningHistory[] }>);

    return Object.values(grouped);
  }, [histories]);

  // Calculate stats (memoized)
  const stats = useMemo(() => {
    if (histories.length === 0) {
      return { totalLessons: 0, averageScore: 0, totalTime: 0 };
    }

    const totalLessons = histories.length;
    const averageScore = Math.round(
      histories.reduce((sum, h) => sum + h.score, 0) / totalLessons
    );
    const totalTime = histories.reduce((sum, h) => sum + h.practiceSeconds, 0);

    return { totalLessons, averageScore, totalTime };
  }, [histories]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Navigate to previous/next day
  const changeDate = (offset: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + offset);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="page">
      <div className="page-container profile-container">
        <Header />

        {/* Profile Header */}
        <section className="profile-header">
          <div className="profile-icon">👤</div>
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-id">@{user.loginId}</p>
        </section>

        {/* View Mode Toggle */}
        <section className="view-mode-toggle">
          <button
            className={`toggle-button ${viewMode === 'date' ? 'active' : ''}`}
            onClick={() => setViewMode('date')}
          >
            📅 Date View
          </button>
          <button
            className={`toggle-button ${viewMode === 'category' ? 'active' : ''}`}
            onClick={() => setViewMode('category')}
          >
            📂 Category View
          </button>
        </section>

        {/* Date Selector (only in date view) */}
        {viewMode === 'date' && (
          <section className="date-selector">
            <button className="date-nav-button" onClick={() => changeDate(-1)}>
              ◀
            </button>
            <div className="date-display">{formatDate(selectedDate)}</div>
            <button
              className="date-nav-button"
              onClick={() => changeDate(1)}
              disabled={selectedDate >= getTodayString()}
            >
              ▶
            </button>
          </section>
        )}

        {/* Stats Summary */}
        {histories.length > 0 && (
          <section className="stats-summary">
            <div className="stat-item">
              <div className="stat-label">Total Lessons</div>
              <div className="stat-value">{stats.totalLessons}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{stats.averageScore}pts</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Time</div>
              <div className="stat-value">{formatTime(stats.totalTime)}</div>
            </div>
          </section>
        )}

        {/* Loading State - Date View only */}
        {loading && viewMode === 'date' && (
          <div className="history-loading">Loading learning history...</div>
        )}

        {/* Empty State - Date View only */}
        {!loading && viewMode === 'date' && histories.length === 0 && (
          <div className="history-empty">
            <div className="empty-icon">📚</div>
            <h3>No learning history</h3>
            <p>Start practicing to see your progress here!</p>
          </div>
        )}

        {/* Date View - List of histories */}
        {!loading && viewMode === 'date' && histories.length > 0 && (
          <section className="history-list">
            <h2 className="section-title">Learning History</h2>
            {histories.map((history) => (
              <div key={history.historyId} className="history-card">
                <div className="history-header">
                  <span className="history-category">{history.categoryName}</span>
                  <span className="history-time">{formatTime(history.practiceSeconds)}</span>
                </div>
                <h3 className="history-title">{history.lessonTitle}</h3>
                <div className="history-score">
                  Score: <span className="score-value">{history.score}</span>/100
                </div>
                {history.aiFeedback && (
                  <p className="history-feedback">{history.aiFeedback}</p>
                )}
                <div className="history-date">
                  {new Date(history.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Category View - Grouped by category */}
        {viewMode === 'category' && histories.length > 0 && (
          <section className="category-view">
            <h2 className="section-title">Learning by Category</h2>
            {groupedHistories.map((group) => (
              <div key={group.categoryId} className="category-group">
                <h3 className="category-group-title">
                  {group.categoryName} ({group.items.length})
                </h3>
                <div className="category-items">
                  {group.items.map((history) => (
                    <div key={history.historyId} className="category-item">
                      <div className="category-item-header">
                        <span className="category-item-title">{history.lessonTitle}</span>
                        <span className="category-item-score">{history.score}pts</span>
                      </div>
                      <div className="category-item-time">
                        {formatTime(history.practiceSeconds)} • {new Date(history.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Empty State - Category View */}
        {viewMode === 'category' && histories.length === 0 && (
          <div className="history-empty">
            <div className="empty-icon">📚</div>
            <h3>No learning history</h3>
            <p>Start practicing to see your progress here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
