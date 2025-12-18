import './ScoreBoard.css';

interface ScoreBoardProps {
  score: number;
  targetWord: string;
}

export default function ScoreBoard({ score, targetWord }: ScoreBoardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#00d26a'; // 초록
    if (score >= 60) return '#ffb800'; // 노랑
    return '#ff4444'; // 빨강
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return 'Perfect! 🎉';
    if (score >= 80) return 'Good job! 👍';
    if (score >= 60) return 'Almost there! 💪';
    return 'Follow the guide slowly';
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
        <div className="scoreboard-message">{getScoreMessage(score)}</div>
      </div>

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
