import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Holistic, HAND_CONNECTIONS, POSE_CONNECTIONS } from '@mediapipe/holistic';
import type { Results } from '@mediapipe/holistic';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import { aiApi } from '../services/api';
import type { Pose } from '../types';
import './Camera.css';

interface CameraProps {
  targetPose: Pose | null;
  lessonId: string;
  onScoreUpdate?: (score: number) => void;
  onSuccess?: () => void;
  onFeedback?: (feedback: string, score: number) => void;
  isRunning?: boolean;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
}

export default function Camera({ lessonId, onScoreUpdate, onSuccess, onFeedback, isRunning = true, onAnalyzingChange }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<Holistic | null>(null);
  const stillStartTime = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(isRunning); // isRunning을 ref로 저장
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [countdown, setCountdown] = useState(5000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // isRunning prop이 변경될 때 ref 업데이트
  useEffect(() => {
    console.log('🔍 Camera isRunning prop changed to:', isRunning);
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // isAnalyzing이 변경될 때 부모 컴포넌트에 알림
  useEffect(() => {
    onAnalyzingChange?.(isAnalyzing);
  }, [isAnalyzing, onAnalyzingChange]);

  // MediaPipe Holistic 초기화
  useEffect(() => {
    holisticRef.current = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holisticRef.current.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holisticRef.current.onResults(onHolisticResults);

    return () => {
      holisticRef.current?.close();
    };
  }, [lessonId]);

  // MediaPipe 결과 처리 (5초마다 자동 전송)
  const onHolisticResults = async (results: Results) => {
    // Canvas에 skeleton 그리기 (항상 표시)
    drawSkeletonOnCanvas(results);

    console.log('⏱️ onHolisticResults called - isRunning:', isRunningRef.current, 'countdown:', countdown);

    // isRunning이 false면 검사 중지
    if (!isRunningRef.current) {
      stillStartTime.current = null;
      setCountdown(5000);
      return;
    }

    const currentTime = Date.now();

    // 처음 시작할 때
    if (stillStartTime.current === null) {
      stillStartTime.current = currentTime;
      console.log('🎬 Timer started at:', currentTime);
    }

    const elapsed = currentTime - stillStartTime.current;
    const remaining = Math.max(0, 5000 - elapsed);
    setCountdown(remaining);

    // 5초 경과하면 AI 서버로 전송
    if (elapsed >= 5000) {
      console.log('[AI] Sending to server...');
      // 타이머 멈춤 & analyzing 시작
      stillStartTime.current = null;
      isRunningRef.current = false; // 타이머 정지
      setIsAnalyzing(true);

      await sendFeedback();
    }
  };

  // 웹캠 이미지를 캡처하는 함수
  const captureWebcamImage = async (): Promise<Blob | null> => {
    const video = webcamRef.current?.video;
    if (!video) return null;

    // 임시 canvas 생성
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return null;

    // 비디오 프레임을 canvas에 그리기 (거울 모드 제거 - AI 서버용)
    ctx.drawImage(video, 0, 0);

    // canvas를 Blob으로 변환
    return new Promise((resolve) => {
      captureCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  // AI 서버로 이미지를 보내는 함수
  const sendFeedback = async () => {
    if (!lessonId) return;

    const numericLessonId = parseInt(lessonId, 10);
    if (isNaN(numericLessonId)) {
      console.error('Invalid lessonId:', lessonId);
      return;
    }

    try {
      // 웹캠 이미지 캡처
      const imageBlob = await captureWebcamImage();
      if (!imageBlob) {
        console.error('Failed to capture webcam image');
        return;
      }

      console.log('📷 Captured image, size:', imageBlob.size, 'bytes');

      // AI 서버로 이미지 전송
      const data = await aiApi.sendFeedback(numericLessonId, imageBlob);
      console.log('AI Server response:', data);

      // 서버에서 받은 score를 0~100으로 변환 (서버는 0~1 사이로 보냄)
      const scorePercent = Math.round(data.score * 100);
      if (data.score !== undefined) {
        onScoreUpdate?.(scorePercent);
      }

      // 100점이거나 성공 판정이면 성공 모달 표시
      if (scorePercent === 100 || data.isCorrect) {
        console.log('Success! Sign language is correct.');
        onSuccess?.();
        setIsAnalyzing(false); // 성공 시 analyzing 종료
      } else {
        // 100점 미만일 때만 피드백 모달 표시
        if (data.feedback) {
          onFeedback?.(data.feedback, scorePercent);
          setIsAnalyzing(false); // 피드백 시 analyzing 종료
        }
      }
    } catch (error) {
      console.error('Failed to send feedback to AI server:', error);
      setIsAnalyzing(false); // 에러 시에도 analyzing 종료
    }
  };

  // Canvas에 skeleton 그리기
  const drawSkeletonOnCanvas = (results: Results) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 크기 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Canvas 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // MediaPipe skeleton 그리기
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
    drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#FF0000', lineWidth: 2 });
    drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#0000FF', lineWidth: 2 });

    ctx.restore();
  };

  // 웹캠 준비 완료 후 MediaPipe Camera 시작
  useEffect(() => {
    const video = webcamRef.current?.video;
    if (!video || !holisticRef.current) return;

    const camera = new MediaPipeCamera(video, {
      onFrame: async () => {
        if (webcamRef.current?.video && holisticRef.current) {
          await holisticRef.current.send({ image: webcamRef.current.video });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();
    setIsWebcamReady(true);

    return () => {
      camera.stop();
    };
  }, []);

  return (
    <div className="camera-container">
      <Webcam
        ref={webcamRef}
        mirrored={true}
        className="camera-video"
        videoConstraints={{ width: 640, height: 480 }}
      />
      <canvas ref={canvasRef} className="camera-canvas" />

      {/* 상태 표시 */}
      {isWebcamReady && (
        <div className={`camera-status ${isRunning ? '' : 'paused'}`}>
          {isRunning ? 'Checking...' : 'Paused'}
        </div>
      )}

      {/* 카운트다운 표시 */}
      {isWebcamReady && isRunning && !isAnalyzing && (
        <div className="camera-countdown">
          Next check: {(countdown / 1000).toFixed(1)}s
        </div>
      )}

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="camera-analyzing-overlay">
          <div className="analyzing-spinner"></div>
          <div className="analyzing-text">Analyzing...</div>
        </div>
      )}

      {!isWebcamReady && (
        <div className="camera-loading">Loading webcam...</div>
      )}
    </div>
  );
}
