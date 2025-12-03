import type { Joint } from '../types';

// MediaPipe Hands 기준 21개 관절 연결 정보
// 각 배열은 [시작 관절 ID, 끝 관절 ID]
export const HAND_CONNECTIONS: [number, number][] = [
  // 엄지
  [0, 1], [1, 2], [2, 3], [3, 4],
  // 검지
  [0, 5], [5, 6], [6, 7], [7, 8],
  // 중지
  [0, 9], [9, 10], [10, 11], [11, 12],
  // 약지
  [0, 13], [13, 14], [14, 15], [15, 16],
  // 새끼
  [0, 17], [17, 18], [18, 19], [19, 20],
];

// 정규화된 좌표(0~1)를 Canvas 픽셀 좌표로 변환
export function toCanvasXY(
  joint: Joint,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: joint.x * canvasWidth,
    y: joint.y * canvasHeight,
  };
}

// Skeleton 스타일 옵션
export interface SkeletonStyle {
  lineWidth: number;
  strokeStyle: string;
  fillStyle: string;
}

// Skeleton 그리기 함수
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  joints: Joint[],
  style: SkeletonStyle
): void {
  const { lineWidth, strokeStyle, fillStyle } = style;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;

  // 1) 뼈대(선) 그리기
  HAND_CONNECTIONS.forEach(([a, b]) => {
    const ja = joints.find((j) => j.id === a);
    const jb = joints.find((j) => j.id === b);
    if (!ja || !jb) return;

    const pa = toCanvasXY(ja, w, h);
    const pb = toCanvasXY(jb, w, h);

    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  });

  // 2) 관절(점) 그리기
  joints.forEach((j) => {
    const p = toCanvasXY(j, w, h);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 정답과 사용자 관절 오차 계산
export function getJointErrorMap(
  targetJoints: Joint[],
  userJoints: Joint[]
): Map<number, number> {
  const map = new Map<number, number>();

  targetJoints.forEach((t) => {
    const u = userJoints.find((j) => j.id === t.id);
    if (!u) return;

    const dx = t.x - u.x;
    const dy = t.y - u.y;
    const dist = Math.sqrt(dx * dx + dy * dy); // 0~대략 1 사이
    map.set(t.id, dist);
  });

  return map;
}

// 오차 크기에 따른 색상 반환
export function colorByError(dist: number | undefined): string {
  if (dist === undefined) return 'rgba(128, 128, 128, 0.7)'; // 회색 (데이터 없음)
  if (dist < 0.03) return 'rgba(0, 255, 0, 0.9)'; // 초록 (정확)
  if (dist < 0.08) return 'rgba(255, 215, 0, 0.9)'; // 노랑 (보통)
  return 'rgba(255, 0, 0, 0.9)'; // 빨강 (틀림)
}

// 사용자 Skeleton을 오차에 따라 색깔로 그리기
export function drawUserSkeletonWithError(
  ctx: CanvasRenderingContext2D,
  targetJoints: Joint[],
  userJoints: Joint[]
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const errorMap = getJointErrorMap(targetJoints, userJoints);

  ctx.lineWidth = 4;

  // 뼈대(선)
  HAND_CONNECTIONS.forEach(([a, b]) => {
    const ja = userJoints.find((j) => j.id === a);
    const jb = userJoints.find((j) => j.id === b);
    if (!ja || !jb) return;

    const pa = toCanvasXY(ja, w, h);
    const pb = toCanvasXY(jb, w, h);

    const distA = errorMap.get(a);
    const distB = errorMap.get(b);
    const dist = Math.max(distA || 0, distB || 0);
    ctx.strokeStyle = colorByError(dist);

    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  });

  // 점
  userJoints.forEach((j) => {
    const p = toCanvasXY(j, w, h);
    const dist = errorMap.get(j.id);
    ctx.fillStyle = colorByError(dist);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 전체 점수 계산 (0~100)
export function calculateScore(targetJoints: Joint[], userJoints: Joint[]): number {
  const errorMap = getJointErrorMap(targetJoints, userJoints);

  if (errorMap.size === 0) return 0;

  let totalError = 0;
  errorMap.forEach((error) => {
    totalError += error;
  });

  const avgError = totalError / errorMap.size;

  // 오차가 0이면 100점, 0.1 이상이면 0점으로 매핑
  const score = Math.max(0, Math.min(100, (1 - avgError / 0.1) * 100));

  return Math.round(score);
}
