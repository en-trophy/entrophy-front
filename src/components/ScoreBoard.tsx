import './ScoreBoard.css';

interface ScoreBoardProps {
  score: number;
  targetWord: string;
  feedback?: string;
}

export default function ScoreBoard({ score, targetWord, feedback }: ScoreBoardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#00d26a'; // 초록
    if (score >= 60) return '#ffb800'; // 노랑
    return '#ff4444'; // 빨강
  };

  return (
    <div className="scoreboard">
      <div className="scoreboard-word">
        <span className="scoreboard-label">Learning:</span>
        <span className="scoreboard-word-text">{targetWord}</span>
      </div>

      <div className="scoreboard-score">
        <div className="scoreboard-score-value" style={{ color: getScoreColor(score) }}>
          {score}
          <span className="scoreboard-score-unit">pts</span>
        </div>
      </div>

      {feedback && (
        <div className="scoreboard-feedback">
          <span className="scoreboard-feedback-icon">💡</span>
          <span className="scoreboard-feedback-text">{feedback}</span>
        </div>
      )}

      <div className="scoreboard-bar">
        <div
          className="scoreboard-bar-fill"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
    </div>
  );
}
