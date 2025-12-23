import type { Category, Lesson } from '../types';

// 개발 환경에서는 Vite 프록시를 사용 (vite.config.ts 참조)
const BACKEND_API_URL = '';
const AI_API_URL = 'https://equal-sign-ai-fuf6dpbxbcfcdahq.koreacentral-01.azurewebsites.net';

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

// AI API calls
export const aiApi = {
  // Send feedback to AI server
  async sendFeedback(lessonId: number, request: LessonFeedbackRequest): Promise<LessonFeedbackResponse> {
    const response = await fetch(`${AI_API_URL}/api/lessons/${lessonId}/feedback`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`AI server error: ${response.status}`);
    }

    return response.json();
  },
};
