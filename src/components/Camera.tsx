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
}

export default function Camera({ lessonId, onScoreUpdate, onSuccess, onFeedback, isRunning = true }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<Holistic | null>(null);
  const stillStartTime = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(isRunning); // isRunning을 ref로 저장
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [countdown, setCountdown] = useState(5000);

  // isRunning prop이 변경될 때 ref 업데이트
  useEffect(() => {
    console.log('🔍 Camera isRunning prop changed to:', isRunning);
    isRunningRef.current = isRunning;
  }, [isRunning]);

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

  // 데이터를 서버 형식에 맞게 변환하는 함수
  const formatLandmarks = (landmarks: any) => {
    if (!landmarks) return [];
    return landmarks.map((lm: any) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility ?? 0,
    }));
  };

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
      await sendFeedback(results);
      // 전송 후 타이머 리셋
      stillStartTime.current = null;
    }
  };

  // AI 서버로 데이터를 보내는 함수
  const sendFeedback = async (results: Results) => {
    if (!lessonId) return;

    const numericLessonId = parseInt(lessonId, 10);
    if (isNaN(numericLessonId)) {
      console.error('Invalid lessonId:', lessonId);
      return;
    }

    const payload = {
      target_word_id: 0,
      raw_landmarks: {
        face_landmarks: formatLandmarks(results.faceLandmarks),
        pose_landmarks: formatLandmarks(results.poseLandmarks),
        left_hand_landmarks: formatLandmarks(results.leftHandLandmarks),
        right_hand_landmarks: formatLandmarks(results.rightHandLandmarks),
      }
    };

    try {
      const data = await aiApi.sendFeedback(numericLessonId, payload);
      console.log('AI Server response:', data);

      // 서버에서 받은 score를 0~100으로 변환 (서버는 0~1 사이로 보냄)
      const scorePercent = Math.round(data.score * 100);
      if (data.score !== undefined) {
        onScoreUpdate?.(scorePercent);
      }

      // 피드백 콜백 호출 (매번 표시)
      if (data.feedback) {
        onFeedback?.(data.feedback, scorePercent);
      }

      // 성공 판정
      if (data.isCorrect) {
        console.log('Success! Sign language is correct.');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to send feedback to AI server:', error);
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
      {isWebcamReady && isRunning && (
        <div className="camera-countdown">
          {countdown === 0 ? 'Sending...' : `Next check: ${(countdown / 1000).toFixed(1)}s`}
        </div>
      )}

      {!isWebcamReady && (
        <div className="camera-loading">Loading webcam...</div>
      )}
    </div>
  );
}
