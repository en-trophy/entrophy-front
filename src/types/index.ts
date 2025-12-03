// Joint 좌표 (0~1로 정규화된 좌표)
export interface Joint {
  id: number;
  x: number; // 0~1 (왼쪽 0, 오른쪽 1)
  y: number; // 0~1 (위 0, 아래 1)
}

// 정답 포즈 (정적인 수어 동작)
export interface StaticPose {
  handType: 'LEFT' | 'RIGHT';
  motionType: 'STATIC';
  joints: Joint[];
}

// 프레임 (모션용)
export interface PoseFrame {
  frameIndex: number;
  joints: Joint[];
}

// 모션 포즈 (움직이는 수어 동작, 예: "안녕")
export interface MotionPose {
  handType: 'LEFT' | 'RIGHT';
  motionType: 'MOTION';
  frameIntervalMs: number; // 프레임 간격 (밀리초)
  frames: PoseFrame[];
}

// 포즈 타입 (정적 또는 모션)
export type Pose = StaticPose | MotionPose;

// AI 서버 응답 (사용자 관절 데이터)
export interface UserPoseResponse {
  userJoints: Joint[];
  score?: number;
  jointErrors?: JointError[];
}

// 관절별 오차 정보
export interface JointError {
  id: number;
  error: number; // 오차 거리
}

// 학습할 단어 정보
export interface LearningWord {
  id: string;
  word: string; // 예: "사랑해", "안녕"
  pose: Pose;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description?: string;
}

// 학습 세션 결과
export interface LearningSession {
  wordId: string;
  maxScore: number;
  attempts: number;
  completed: boolean;
  timestamp: number;
}

// 카테고리 (홈 화면에서 선택)
export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string; // 카드 배경색
}

// 레슨 레벨 (단어 vs 문장)
export type LessonLevel = 'word' | 'phrase';

// 레슨 정보 (LearningWord 확장)
export interface Lesson {
  id: string;
  categoryId: string;
  level: LessonLevel;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  tips: string; // 손모양 팁, 사용 상황
  pose: Pose;
  thumbnail?: string;
}
