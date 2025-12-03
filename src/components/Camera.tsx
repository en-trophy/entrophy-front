import { useEffect, useRef, useState } from 'react';
import type { Joint, Pose } from '../types';
import {
  drawSkeleton,
  drawUserSkeletonWithError,
  calculateScore,
} from '../utils/skeleton';
import './Camera.css';

interface CameraProps {
  targetPose: Pose | null;
  onScoreUpdate?: (score: number) => void;
}

export default function Camera({ targetPose, onScoreUpdate }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // 임시: 사용자 joints (나중에 AI 서버에서 받아올 데이터)
  const [latestUserJoints, setLatestUserJoints] = useState<Joint[] | null>(null);

  // 웹캠 초기화
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 } })
      .then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          setIsWebcamReady(true);
        };
      })
      .catch((err) => {
        console.error('웹캠 접근 실패:', err);
        alert('웹캠 접근 권한이 필요합니다.');
      });

    return () => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Canvas 크기 설정
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isWebcamReady) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }, [isWebcamReady]);

  // 모션 애니메이션 (프레임 전환)
  useEffect(() => {
    if (!targetPose || targetPose.motionType !== 'MOTION') return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % targetPose.frames.length);
    }, targetPose.frameIntervalMs);

    return () => clearInterval(interval);
  }, [targetPose]);

  // 렌더링 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isWebcamReady || !targetPose) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function renderLoop() {
      if (!ctx || !canvas || !targetPose) return;

      // Canvas 초기화
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 현재 프레임의 정답 joints 가져오기
      let targetJoints: Joint[];
      if (targetPose.motionType === 'STATIC') {
        targetJoints = targetPose.joints;
      } else {
        targetJoints = targetPose.frames[currentFrameIndex].joints;
      }

      // 1) 정답 실루엣 그리기 (희미한 흰색)
      drawSkeleton(ctx, targetJoints, {
        lineWidth: 2,
        strokeStyle: 'rgba(255, 255, 255, 0.6)',
        fillStyle: 'rgba(255, 255, 255, 0.8)',
      });

      // 2) 사용자 skeleton + 오차 시각화
      if (latestUserJoints) {
        drawUserSkeletonWithError(ctx, targetJoints, latestUserJoints);

        // 점수 계산 및 업데이트
        const score = calculateScore(targetJoints, latestUserJoints);
        onScoreUpdate?.(score);
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    }

    renderLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isWebcamReady, targetPose, currentFrameIndex, latestUserJoints, onScoreUpdate]);

  // TODO: AI 서버 호출 (0.3~0.5초마다)
  useEffect(() => {
    if (!isWebcamReady) return;

    // 임시: 테스트용 더미 데이터 생성
    const interval = setInterval(() => {
      // 나중에 여기서 video 프레임을 캡처해서 AI 서버로 전송
      // 그리고 응답으로 받은 userJoints를 setLatestUserJoints에 설정

      // 임시 더미 데이터 (실제로는 AI 서버 응답)
      const dummyUserJoints: Joint[] = Array.from({ length: 21 }, (_, i) => ({
        id: i,
        x: 0.4 + Math.random() * 0.2,
        y: 0.3 + Math.random() * 0.4,
      }));
      setLatestUserJoints(dummyUserJoints);
    }, 500); // 0.5초마다

    return () => clearInterval(interval);
  }, [isWebcamReady]);

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
      />
      <canvas ref={canvasRef} className="camera-canvas" />
      {!isWebcamReady && (
        <div className="camera-loading">웹캠을 불러오는 중...</div>
      )}
    </div>
  );
}
