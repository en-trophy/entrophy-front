import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Holistic, Results, HAND_CONNECTIONS, POSE_CONNECTIONS } from '@mediapipe/holistic';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { aiApi } from '../services/api';
import type { Pose } from '../types';
import './Camera.css';

interface CameraProps {
  targetPose: Pose | null;
  lessonId: string;
  onScoreUpdate?: (score: number) => void;
  onSuccess?: () => void;
}

export default function Camera({ lessonId, onScoreUpdate, onSuccess }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<Holistic | null>(null);
  const lastSentTime = useRef<number>(0);
  const [isWebcamReady, setIsWebcamReady] = useState(false);

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

  // MediaPipe 결과 처리
  const onHolisticResults = async (results: Results) => {
    // AI 서버로 데이터 전송 (0.5초마다)
    const currentTime = Date.now();
    if (currentTime - lastSentTime.current >= 500) {
      lastSentTime.current = currentTime;
      await sendFeedback(results);
    }

    // Canvas에 skeleton 그리기
    drawSkeletonOnCanvas(results);
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
      if (data.score !== undefined) {
        onScoreUpdate?.(Math.round(data.score * 100));
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
      {!isWebcamReady && (
        <div className="camera-loading">Loading webcam...</div>
      )}
    </div>
  );
}
