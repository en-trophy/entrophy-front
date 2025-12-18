import type { LearningWord } from '../types';

// Sample answer pose data
// In a real project, this would be fetched from a backend API
export const sampleWords: LearningWord[] = [
  {
    id: 'love',
    word: 'Love',
    difficulty: 'EASY',
    description: 'A gesture of placing a fist over the chest',
    pose: {
      handType: 'RIGHT',
      motionType: 'STATIC',
      joints: [
        { id: 0, x: 0.5, y: 0.6 },   // Wrist
        { id: 1, x: 0.48, y: 0.55 }, // Thumb 1
        { id: 2, x: 0.46, y: 0.5 },  // Thumb 2
        { id: 3, x: 0.44, y: 0.45 }, // Thumb 3
        { id: 4, x: 0.42, y: 0.4 },  // Thumb tip
        { id: 5, x: 0.52, y: 0.5 },  // Index finger 1
        { id: 6, x: 0.54, y: 0.45 }, // Index finger 2
        { id: 7, x: 0.56, y: 0.4 },  // Index finger 3
        { id: 8, x: 0.58, y: 0.35 }, // Index finger tip
        { id: 9, x: 0.5, y: 0.48 },  // Middle finger 1
        { id: 10, x: 0.5, y: 0.42 }, // Middle finger 2
        { id: 11, x: 0.5, y: 0.36 }, // Middle finger 3
        { id: 12, x: 0.5, y: 0.3 },  // Middle finger tip
        { id: 13, x: 0.48, y: 0.48 }, // Ring finger 1
        { id: 14, x: 0.46, y: 0.42 }, // Ring finger 2
        { id: 15, x: 0.44, y: 0.36 }, // Ring finger 3
        { id: 16, x: 0.42, y: 0.3 },  // Ring finger tip
        { id: 17, x: 0.46, y: 0.5 },  // Pinky finger 1
        { id: 18, x: 0.43, y: 0.45 }, // Pinky finger 2
        { id: 19, x: 0.4, y: 0.4 },   // Pinky finger 3
        { id: 20, x: 0.37, y: 0.35 }, // Pinky finger tip
      ],
    },
  },
  {
    id: 'hello',
    word: 'Hello',
    difficulty: 'EASY',
    description: 'A hand-waving gesture',
    pose: {
      handType: 'RIGHT',
      motionType: 'MOTION',
      frameIntervalMs: 400,
      frames: [
        {
          frameIndex: 0,
          joints: [
            { id: 0, x: 0.5, y: 0.5 },
            { id: 1, x: 0.48, y: 0.45 },
            { id: 2, x: 0.46, y: 0.4 },
            { id: 3, x: 0.44, y: 0.35 },
            { id: 4, x: 0.42, y: 0.3 },
            { id: 5, x: 0.52, y: 0.4 },
            { id: 6, x: 0.54, y: 0.3 },
            { id: 7, x: 0.56, y: 0.2 },
            { id: 8, x: 0.58, y: 0.1 },
            { id: 9, x: 0.5, y: 0.38 },
            { id: 10, x: 0.5, y: 0.28 },
            { id: 11, x: 0.5, y: 0.18 },
            { id: 12, x: 0.5, y: 0.08 },
            { id: 13, x: 0.48, y: 0.38 },
            { id: 14, x: 0.46, y: 0.28 },
            { id: 15, x: 0.44, y: 0.18 },
            { id: 16, x: 0.42, y: 0.08 },
            { id: 17, x: 0.46, y: 0.4 },
            { id: 18, x: 0.43, y: 0.3 },
            { id: 19, x: 0.4, y: 0.2 },
            { id: 20, x: 0.37, y: 0.1 },
          ],
        },
        {
          frameIndex: 1,
          joints: [
            { id: 0, x: 0.55, y: 0.5 },
            { id: 1, x: 0.53, y: 0.45 },
            { id: 2, x: 0.51, y: 0.4 },
            { id: 3, x: 0.49, y: 0.35 },
            { id: 4, x: 0.47, y: 0.3 },
            { id: 5, x: 0.57, y: 0.4 },
            { id: 6, x: 0.59, y: 0.3 },
            { id: 7, x: 0.61, y: 0.2 },
            { id: 8, x: 0.63, y: 0.1 },
            { id: 9, x: 0.55, y: 0.38 },
            { id: 10, x: 0.55, y: 0.28 },
            { id: 11, x: 0.55, y: 0.18 },
            { id: 12, x: 0.55, y: 0.08 },
            { id: 13, x: 0.53, y: 0.38 },
            { id: 14, x: 0.51, y: 0.28 },
            { id: 15, x: 0.49, y: 0.18 },
            { id: 16, x: 0.47, y: 0.08 },
            { id: 17, x: 0.51, y: 0.4 },
            { id: 18, x: 0.48, y: 0.3 },
            { id: 19, x: 0.45, y: 0.2 },
            { id: 20, x: 0.42, y: 0.1 },
          ],
        },
        {
          frameIndex: 2,
          joints: [
            { id: 0, x: 0.45, y: 0.5 },
            { id: 1, x: 0.43, y: 0.45 },
            { id: 2, x: 0.41, y: 0.4 },
            { id: 3, x: 0.39, y: 0.35 },
            { id: 4, x: 0.37, y: 0.3 },
            { id: 5, x: 0.47, y: 0.4 },
            { id: 6, x: 0.49, y: 0.3 },
            { id: 7, x: 0.51, y: 0.2 },
            { id: 8, x: 0.53, y: 0.1 },
            { id: 9, x: 0.45, y: 0.38 },
            { id: 10, x: 0.45, y: 0.28 },
            { id: 11, x: 0.45, y: 0.18 },
            { id: 12, x: 0.45, y: 0.08 },
            { id: 13, x: 0.43, y: 0.38 },
            { id: 14, x: 0.41, y: 0.28 },
            { id: 15, x: 0.39, y: 0.18 },
            { id: 16, x: 0.37, y: 0.08 },
            { id: 17, x: 0.41, y: 0.4 },
            { id: 18, x: 0.38, y: 0.3 },
            { id: 19, x: 0.35, y: 0.2 },
            { id: 20, x: 0.32, y: 0.1 },
          ],
        },
      ],
    },
  },
  {
    id: 'thank-you',
    word: 'Thank you',
    difficulty: 'MEDIUM',
    description: 'A gesture of greeting with hands together',
    pose: {
      handType: 'RIGHT',
      motionType: 'STATIC',
      joints: [
        { id: 0, x: 0.5, y: 0.7 },
        { id: 1, x: 0.52, y: 0.65 },
        { id: 2, x: 0.54, y: 0.6 },
        { id: 3, x: 0.56, y: 0.55 },
        { id: 4, x: 0.58, y: 0.5 },
        { id: 5, x: 0.5, y: 0.6 },
        { id: 6, x: 0.5, y: 0.5 },
        { id: 7, x: 0.5, y: 0.4 },
        { id: 8, x: 0.5, y: 0.3 },
        { id: 9, x: 0.48, y: 0.6 },
        { id: 10, x: 0.46, y: 0.5 },
        { id: 11, x: 0.44, y: 0.4 },
        { id: 12, x: 0.42, y: 0.3 },
        { id: 13, x: 0.46, y: 0.62 },
        { id: 14, x: 0.44, y: 0.52 },
        { id: 15, x: 0.42, y: 0.42 },
        { id: 16, x: 0.4, y: 0.32 },
        { id: 17, x: 0.44, y: 0.65 },
        { id: 18, x: 0.42, y: 0.55 },
        { id: 19, x: 0.4, y: 0.45 },
        { id: 20, x: 0.38, y: 0.35 },
      ],
    },
  },
];
