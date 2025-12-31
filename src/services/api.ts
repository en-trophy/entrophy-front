import type { Category, Lesson, SignupRequest, LoginRequest, LoginResponse, SimulationRequest, SimulationResponse } from '../types';

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

    return response.json();
  },
};

// AI API calls
export const aiApi = {
  // Send feedback to AI server (이미지 전송)
  async sendFeedback(lessonId: number, imageBlob: Blob): Promise<LessonFeedbackResponse> {
    const formData = new FormData();
    formData.append('file', imageBlob, 'webcam-capture.jpg');

    const response = await fetch(`${AI_API_URL}/api/lessons/${lessonId}/feedback/image`, {
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
