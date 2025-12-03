import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'greeting',
    name: '인사',
    emoji: '👋',
    description: '만남과 헤어짐의 기본 인사',
    color: '#FFB6C1',
  },
  {
    id: 'emotion',
    name: '감정',
    emoji: '😊',
    description: '기쁨, 슬픔, 화남 등 감정 표현',
    color: '#FFD700',
  },
  {
    id: 'daily',
    name: '일상',
    emoji: '🏠',
    description: '일상생활에서 자주 쓰는 표현',
    color: '#87CEEB',
  },
  {
    id: 'family',
    name: '가족',
    emoji: '👪',
    description: '가족 관계와 호칭',
    color: '#DDA0DD',
  },
  {
    id: 'school',
    name: '학교',
    emoji: '🏫',
    description: '학교생활 관련 표현',
    color: '#90EE90',
  },
  {
    id: 'food',
    name: '식사',
    emoji: '🍽️',
    description: '음식과 식사 관련 표현',
    color: '#FFA07A',
  },
  {
    id: 'alphabet',
    name: '알파벳',
    emoji: '✋',
    description: '손가락으로 표현하는 알파벳',
    color: '#B0E0E6',
  },
  {
    id: 'number',
    name: '숫자',
    emoji: '🔢',
    description: '손가락으로 표현하는 숫자',
    color: '#F0E68C',
  },
];
