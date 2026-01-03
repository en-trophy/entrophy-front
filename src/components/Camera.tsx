import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Holistic, HAND_CONNECTIONS, POSE_CONNECTIONS } from '@mediapipe/holistic';
import type { Results } from '@mediapipe/holistic';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import { aiApi, backendApi } from '../services/api';
import type { Pose } from '../types';
import './Camera.css';

interface FrameCaptureConfig {
  frameCount: number;      // 캡처할 프레임 수
  intervalMs: number;      // 프레임 간 간격 (밀리초)
}

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
  const frameConfigRef = useRef<FrameCaptureConfig>({ frameCount: 1, intervalMs: 0 }); // frameConfig를 ref로 저장
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [countdown, setCountdown] = useState(5000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(1);
  const [showAnalyzingOverlay, setShowAnalyzingOverlay] = useState(true);

  // Load frame config from API
  useEffect(() => {
    const loadFrameConfig = async () => {
      try {
        const numericLessonId = parseInt(lessonId, 10);
        const data = await backendApi.getAnswerFramesCount(numericLessonId);

        // frameCount에 따라 intervalMs 설정
        const intervalMs = data.frameCount > 1 ? 1500 : 0;

        frameConfigRef.current = {
          frameCount: data.frameCount,
          intervalMs,
        };

        setTotalFrames(data.frameCount);
        console.log('📸 Frame config loaded:', { frameCount: data.frameCount, intervalMs });
      } catch (error) {
        console.error('Failed to load frame config:', error);
        // 기본값 유지
        frameConfigRef.current = { frameCount: 1, intervalMs: 0 };
      }
    };

    loadFrameConfig();
  }, [lessonId]);

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

    // 5초 경과하면 캡처 시작
    if (elapsed >= 5000) {
      console.log('[AI] 5 seconds elapsed, starting capture sequence...');
      // 타이머 멈춤 & analyzing 시작
      stillStartTime.current = null;
      isRunningRef.current = false; // 타이머 정지
      setIsAnalyzing(true);

      const config = frameConfigRef.current;
      console.log('📸 Using frame config:', config);

      if (config.frameCount === 1) {
        // 단일 프레임 - 기존 방식
        await sendFeedback();
      } else {
        // 멀티 프레임 캡처
        await captureMultipleFrames(config);
      }
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

  // 여러 프레임을 순차적으로 캡처
  const captureMultipleFrames = async (config: FrameCaptureConfig) => {
    const frames: Blob[] = [];
    const { frameCount, intervalMs } = config;

    setTotalFrames(frameCount);
    setShowAnalyzingOverlay(false); // 초기에는 overlay 숨김

    const FLASH_DURATION_MS = 500; // Overlay 표시 시간

    console.log(`[Multi-Frame] Starting capture: ${frameCount} frames, ${intervalMs}ms interval`);

    for (let i = 0; i < frameCount; i++) {
      setCurrentFrame(i + 1);

      // Overlay 표시 ("Capturing frame X/Y...")
      setShowAnalyzingOverlay(true);
      await new Promise(resolve => setTimeout(resolve, FLASH_DURATION_MS));

      // 프레임 캡처
      const frameBlob = await captureWebcamImage();
      if (!frameBlob) {
        console.error(`[Multi-Frame] Failed to capture frame ${i + 1}`);
        setShowAnalyzingOverlay(false);
        setIsAnalyzing(false);
        onFeedback?.(`Failed to capture frame ${i + 1}. Please check your camera and try again.`, 0);
        return;
      }

      frames.push(frameBlob);
      console.log(`[Multi-Frame] Frame ${i + 1} captured, size: ${frameBlob.size} bytes`);

      // Overlay 숨김 (웹캠 화면 보임)
      setShowAnalyzingOverlay(false);

      // 다음 프레임까지 대기 (마지막 프레임 제외)
      if (i < frameCount - 1) {
        const remainingInterval = intervalMs - FLASH_DURATION_MS;
        await new Promise(resolve => setTimeout(resolve, remainingInterval));
      }
    }

    console.log(`[Multi-Frame] All ${frameCount} frames captured, sending to API...`);

    // 모든 프레임 캡처 완료 - Analyzing 표시
    setShowAnalyzingOverlay(true);
    setCurrentFrame(0); // currentFrame을 0으로 설정하여 "Analyzing..." 텍스트 표시

    // 모든 프레임을 API로 전송
    await sendFeedback(frames);
  };

  // AI 서버로 이미지를 보내는 함수
  const sendFeedback = async (frames?: Blob[]) => {
    if (!lessonId) return;

    const numericLessonId = parseInt(lessonId, 10);
    if (isNaN(numericLessonId)) {
      console.error('Invalid lessonId:', lessonId);
      return;
    }

    try {
      // 단일 프레임 또는 멀티 프레임 처리
      const rawImages = frames || [await captureWebcamImage()];

      // null 필터링하여 Blob[] 타입 보장
      const imagesToSend = rawImages.filter((blob): blob is Blob => blob !== null);

      // 모든 프레임 유효성 검사
      if (imagesToSend.length === 0 || imagesToSend.length !== rawImages.length) {
        console.error('Failed to capture one or more images');
        setIsAnalyzing(false);
        return;
      }

      console.log(`📷 Sending ${imagesToSend.length} frame(s) to AI server`);

      // AI 서버로 전송
      const data = await aiApi.sendFeedback(numericLessonId, imagesToSend);
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
    } finally {
      // 멀티 프레임 상태 초기화
      setCurrentFrame(0);
      setTotalFrames(1);
      setShowAnalyzingOverlay(true); // 다음 세션을 위해 초기값으로 리셋
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
      {isAnalyzing && showAnalyzingOverlay && (
        <div className="camera-analyzing-overlay">
          <div className="analyzing-spinner"></div>
          <div className="analyzing-text">
            {totalFrames > 1 && currentFrame > 0 && currentFrame <= totalFrames
              ? `Capturing frame ${currentFrame}/${totalFrames}...`
              : 'Analyzing...'}
          </div>
        </div>
      )}

      {!isWebcamReady && (
        <div className="camera-loading">Loading webcam...</div>
      )}
    </div>
  );
}
