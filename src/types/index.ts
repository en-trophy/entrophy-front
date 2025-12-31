// Joint 좌표 (0~1로 정규화된 좌표)
export interface Joint {
  id: number;
  x: number;
  y: number;
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

// 모션 포즈 (움직이는 수어 동작)
export interface MotionPose {
  handType: 'LEFT' | 'RIGHT';
  motionType: 'MOTION';
  frameIntervalMs: number;
  frames: PoseFrame[];
}

// 포즈 타입
export type Pose = StaticPose | MotionPose;

// AI 서버 응답
export interface UserPoseResponse {
  userJoints: Joint[];
  score?: number;
  jointErrors?: JointError[];
}

// 관절별 오차 정보
export interface JointError {
  id: number;
  error: number;
}

// 학습할 단어 정보
export interface LearningWord {
  id: string;
  word: string;
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

// 카테고리
export interface Category {
  id: number;
  code: string;
  name: string;
  iconEmoji: string;
  description: string;
  color?: string;
}

// 레슨 레벨
export type LessonLevel = 'word' | 'phrase';

// 레슨 정보
export interface Lesson {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  signLanguage: string;
  difficulty: number;
  type: string;
  imageUrl?: string;
  videoUrl?: string;
  description?: string;
  tips?: string;
  pose?: Pose;
}

// Difficulty 매핑
export function mapDifficulty(level: number): 'EASY' | 'MEDIUM' | 'HARD' {
  if (level <= 2) return 'EASY';
  if (level <= 4) return 'MEDIUM';
  return 'HARD';
}

// 문자열을 해시값으로 변환
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Category 색상 자동 생성 (code 기반 일관성 있는 색상)
export function getCategoryColor(code: string): string {
  // code를 해시하여 0-360 사이의 색조(hue) 값 생성
  const hash = hashCode(code);
  const hue = hash % 360;

  // 파스텔 톤의 밝고 부드러운 색상 생성
  // 채도(saturation) 70%, 명도(lightness) 80%
  const color = `hsl(${hue}, 70%, 80%)`;

  console.log(`🎨 Auto color: "${code}" → hue ${hue} → ${color}`);
  return color;
}

// 인증 관련 타입
// 회원가입 요청
export interface SignupRequest {
  loginId: string;
  password: string;
  name: string;
}

// 로그인 요청
export interface LoginRequest {
  loginId: string;
  password: string;
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string;
  userId: number;
  loginId: string;
  name: string;
}

// 사용자 정보
export interface User {
  userId: number;
  loginId: string;
  name: string;
}

// 시뮬레이션 관련 타입
// 시뮬레이션 요청
export interface SimulationRequest {
  lesson_ids: number[];
}

// 대화 라인
export interface DialogueLine {
  speaker: 'AI' | 'User';
  text: string;
  target_lesson_id: number | null;
}

// 시뮬레이션 응답
export interface SimulationResponse {
  situation: string;
  image_url: string;
  dialogue: DialogueLine[];
}
