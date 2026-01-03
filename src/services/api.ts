import type { Category, Lesson, SignupRequest, LoginRequest, LoginResponse, SimulationRequest, SimulationResponse, LearningHistoryRequest, LearningHistoryResponse, LearningHistory } from '../types';
import { authService } from './authService';

// 환경 변수로 API URL 관리 (.env.development, .env.production 파일 참조)
// 프로덕션 배포 시 환경 변수가 없으면 기본값 사용
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://equal-sign-backend-api-haejb5bdhnezc2c2.koreacentral-01.azurewebsites.net'
    : '');
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://equal-sign-ai-fuf6dpbxbcfcdahq.koreacentral-01.azurewebsites.net';

export interface LessonFeedbackRequest {
  target_word_id: number;
  raw_landmarks: {
    face_landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>;
    pose_landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>;
    left_hand_landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>;
    right_hand_landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>;
  };
}

export interface LessonFeedbackResponse {
  isCorrect: boolean;
  score: number;
  feedback: string;
}

// Backend API calls (프론트엔드에서 사용)
export const backendApi = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${BACKEND_API_URL}/api/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Get all lessons
  async getLessons(): Promise<Lesson[]> {
    const response = await fetch(`${BACKEND_API_URL}/api/lessons`);
    if (!response.ok) throw new Error('Failed to fetch lessons');
    return response.json();
  },

  // Get specific lesson by ID
  async getLesson(id: number): Promise<Lesson> {
    const response = await fetch(`${BACKEND_API_URL}/api/lessons/${id}`);
    if (!response.ok) throw new Error('Failed to fetch lesson');
    return response.json();
  },

  // Get lessons by category
  async getLessonsByCategory(categoryId: number): Promise<Lesson[]> {
    const response = await fetch(`${BACKEND_API_URL}/api/lessons/category/${categoryId}`);
    if (!response.ok) throw new Error('Failed to fetch lessons by category');
    return response.json();
  },

  // Get answer frames count for a lesson
  async getAnswerFramesCount(lessonId: number): Promise<{ lessonId: number; frameCount: number }> {
    const response = await fetch(`${BACKEND_API_URL}/api/lessons/${lessonId}/answer-frames/count`);
    if (!response.ok) throw new Error('Failed to fetch answer frames count');
    return response.json();
  },
};

// Auth API calls
export const authApi = {
  // Sign up new user
  async signup(request: SignupRequest): Promise<void> {
    const response = await fetch(`${BACKEND_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Signup failed');
    }
  },

  // Login user
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }

    const data = await response.json();

    // 토큰 및 사용자 정보 저장
    authService.setToken(data.accessToken);
    authService.setUser({
      userId: data.userId,
      loginId: data.loginId,
      name: data.name,
    });

    return data;
  },

  // Logout user
  logout() {
    authService.logout();
  },
};

// AI API calls
export const aiApi = {
  // Send feedback to AI server (single or multiple images)
  async sendFeedback(lessonId: number, images: Blob | Blob[]): Promise<LessonFeedbackResponse> {
    const formData = new FormData();

    // 배열로 정규화
    const imageArray = Array.isArray(images) ? images : [images];

    // 단일 프레임: /image 엔드포인트, 멀티 프레임: /images 엔드포인트
    const endpoint = imageArray.length === 1
      ? `/api/lessons/${lessonId}/feedback/image`
      : `/api/lessons/${lessonId}/feedback/images`;

    if (imageArray.length === 1) {
      // 단일 프레임
      formData.append('file', imageArray[0], 'webcam-capture.jpg');
    } else {
      // 멀티 프레임 - 'files' 필드로 여러 개 append
      imageArray.forEach((imageBlob, index) => {
        formData.append('files', imageBlob, `webcam-capture-frame${index + 1}.jpg`);
      });
    }

    const response = await fetch(`${AI_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        // Content-Type은 자동으로 multipart/form-data로 설정됨
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AI server error: ${response.status}`);
    }

    return response.json();
  },

  // Create simulation scenario
  async createSimulation(request: SimulationRequest): Promise<SimulationResponse> {
    const response = await fetch(`${AI_API_URL}/api/simulation`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create simulation: ${response.status}`);
    }

    return response.json();
  },
};

// Learning History API calls
export const learningHistoryApi = {
  // 학습 기록 저장
  async createHistory(request: LearningHistoryRequest): Promise<LearningHistoryResponse> {
    const response = await fetch(`${BACKEND_API_URL}/api/learning-histories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to save learning history');
    }

    return response.json();
  },

  // 학습 기록 조회 (날짜별)
  async getHistories(userId: number, date: string): Promise<LearningHistory[]> {
    const response = await fetch(
      `${BACKEND_API_URL}/api/learning-histories?userId=${userId}&date=${date}`,
      {
        headers: {
          ...authService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch learning histories');
    }

    return response.json();
  },
};
