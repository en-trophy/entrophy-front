import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Holistic, HAND_CONNECTIONS, POSE_CONNECTIONS } from '@mediapipe/holistic';
import type { Results } from '@mediapipe/holistic';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import Header from '../components/Header';
import SidebarNav from '../components/SidebarNav';
import { aiApi } from '../services/api';
import type { SimulationResponse } from '../types';
import './SimulationPage.css';

export default function SimulationPage() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<Holistic | null>(null);
  const stillStartTime = useRef<number | null>(null);
  const isCheckingRef = useRef<boolean>(false); // isChecking을 ref로 저장
  const simulationRef = useRef<SimulationResponse | null>(null); // simulation을 ref로 저장
  const currentDialogueIndexRef = useRef<number>(0); // currentDialogueIndex를 ref로 저장

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(5000);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // AI 피드백 기다리는 중
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{
    message: string;
    score: number;
  } | null>(null);

  // isChecking prop이 변경될 때 ref 업데이트
  useEffect(() => {
    console.log('🔍 isChecking state changed to:', isChecking);
    isCheckingRef.current = isChecking;
  }, [isChecking]);

  // simulation이 변경될 때 ref 업데이트
  useEffect(() => {
    simulationRef.current = simulation;
  }, [simulation]);

  // currentDialogueIndex가 변경될 때 ref 업데이트
  useEffect(() => {
    currentDialogueIndexRef.current = currentDialogueIndex;
  }, [currentDialogueIndex]);

  // Load simulation data
  useEffect(() => {
    void loadSimulation();
  }, []);

  const loadSimulation = async () => {
    try {
      setLoading(true);
      // TODO: 나중에 백엔드에서 오늘 배운 lesson_ids를 가져오기
      // 지금은 테스트용으로 하드코딩
      const testLessonIds = [1, 2];
      const data = await aiApi.createSimulation({ lesson_ids: testLessonIds });
      setSimulation(data);
      setError(null);

      // 첫 대화가 User 차례면 바로 인식 시작 준비
      if (data.dialogue.length > 0 && data.dialogue[0].speaker === 'User') {
        setIsWaitingForUser(true);
      }
    } catch (err) {
      console.error('Failed to load simulation:', err);
      setError('Failed to load simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  // Webcam ready
  const onWebcamReady = () => {
    setIsWebcamReady(true);
    if (webcamRef.current?.video && holisticRef.current) {
      const camera = new MediaPipeCamera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video && holisticRef.current) {
            await holisticRef.current.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      void camera.start();
    }
  };

  // MediaPipe results - 5초 타이머 처리
  const onHolisticResults = async (results: Results) => {
    drawSkeletonOnCanvas(results);

    console.log('⏱️ onHolisticResults called - isChecking:', isCheckingRef.current, 'countdown:', countdown);

    // isChecking이 false면 타이머 정지
    if (!isCheckingRef.current) {
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
      // 먼저 타이머 멈춤 (중복 호출 방지)
      stillStartTime.current = null;
      isCheckingRef.current = false;
      setIsChecking(false);

      await performSignLanguage();
    }
  };

  // Draw skeleton on canvas
  const drawSkeletonOnCanvas = (results: Results) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mirror for display
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // Draw pose
    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
    }

    // Draw hands
    if (results.leftHandLandmarks) {
      drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#FF0000', lineWidth: 2 });
    }
    if (results.rightHandLandmarks) {
      drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#0000FF', lineWidth: 2 });
    }

    ctx.restore();
  };

  // Capture webcam image
  const captureWebcamImage = async (): Promise<Blob | null> => {
    const video = webcamRef.current?.video;
    if (!video) return null;

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return null;

    // No mirroring for AI
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      captureCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  // Start checking when button is clicked
  const handleStart = () => {
    setIsChecking(true);
  };

  // User performs sign language (called automatically after 5 seconds)
  const performSignLanguage = async () => {
    console.log('📸 performSignLanguage called');
    if (!simulationRef.current) {
      console.log('❌ No simulation data');
      return;
    }

    const currentDialogue = simulationRef.current.dialogue[currentDialogueIndexRef.current];
    console.log('🎯 Current dialogue:', currentDialogue);

    if (!currentDialogue.target_lesson_id) {
      console.log('❌ No target_lesson_id');
      return;
    }

    // AI 분석 시작
    setIsAnalyzing(true);

    try {
      console.log('📷 Capturing image...');
      const imageBlob = await captureWebcamImage();
      if (!imageBlob) {
        console.log('❌ Failed to capture image');
        setCurrentFeedback({ message: 'Failed to capture image', score: 0 });
        setShowFeedbackModal(true);
        setIsAnalyzing(false);
        return;
      }

      console.log('🚀 Sending to AI server with lesson ID:', currentDialogue.target_lesson_id);
      const feedback = await aiApi.sendFeedback(currentDialogue.target_lesson_id, imageBlob);
      console.log('✅ Feedback received:', feedback);

      if (feedback.isCorrect) {
        console.log('🎉 Correct! Showing success modal');
        // 성공 모달 표시
        setShowSuccessModal(true);
        setIsAnalyzing(false);
      } else {
        console.log('💡 Incorrect. Showing feedback modal');
        // 피드백 모달 표시
        setCurrentFeedback({ message: feedback.feedback, score: feedback.score });
        setShowFeedbackModal(true);
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('❌ Failed to get feedback:', err);
      setCurrentFeedback({ message: 'Failed to analyze. Please try again.', score: 0 });
      setShowFeedbackModal(true);
      setIsAnalyzing(false);
    }
  };

  // Retry after feedback
  const handleRetry = () => {
    setShowFeedbackModal(false);
    setIsChecking(true);
  };

  // Move to next dialogue after success
  const handleSuccess = () => {
    setShowSuccessModal(false);
    moveToNextDialogue();
  };

  // Move to next dialogue
  const moveToNextDialogue = () => {
    if (!simulation) return;

    const nextIndex = currentDialogueIndex + 1;

    if (nextIndex >= simulation.dialogue.length) {
      // Simulation complete
      setIsCompleted(true);
      setIsWaitingForUser(false);
      return;
    }

    setCurrentDialogueIndex(nextIndex);
    setIsChecking(false);
    setCountdown(5000);

    const nextDialogue = simulation.dialogue[nextIndex];
    if (nextDialogue.speaker === 'User') {
      setIsWaitingForUser(true);
    } else {
      setIsWaitingForUser(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-layout">
          <SidebarNav />
          <main className="page-content">
            <div className="page-container">
              <Header />
              <div className="simulation-loading">Loading simulation...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="page">
        <div className="page-layout">
          <SidebarNav />
          <main className="page-content">
            <div className="page-container">
              <Header />
              <div className="simulation-error">
                <p>{error || 'Failed to load simulation'}</p>
                <button onClick={() => navigate('/')} className="button-primary">
                  Go Home
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="page">
        <div className="page-layout">
          <SidebarNav />
          <main className="page-content">
            <div className="page-container">
              <Header />
              <div className="simulation-completed">
                <h2>Simulation Complete!</h2>
                <p>Great job practicing today's lessons!</p>
                <button onClick={() => navigate('/')} className="button-primary">
                  Go Home
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentDialogue = simulation.dialogue[currentDialogueIndex];

  return (
    <div className="page">
      <div className="page-layout">
        <SidebarNav />
        <main className="page-content">
          <div className="page-container">
            <Header />

            <div className="simulation-container">
              {/* Situation */}
              <div className="simulation-situation">
                <h2>Situation</h2>
                <p>{simulation.situation}</p>
              </div>

              {/* Situation Image */}
              <div className="simulation-image">
                <img src={simulation.image_url} alt="Situation" />
              </div>

              {/* Webcam */}
              <div className="simulation-webcam">
                <div className="webcam-container">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored={true}
                    onUserMedia={onWebcamReady}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="skeleton-canvas"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />

                  {/* Status indicator (left top) */}
                  {isWebcamReady && isWaitingForUser && (
                    <div className={`camera-status ${isChecking ? '' : 'paused'}`}>
                      {isChecking ? 'Checking...' : 'Paused'}
                    </div>
                  )}

                  {/* Countdown display (right top) */}
                  {isWebcamReady && isChecking && (
                    <div className="camera-countdown">
                      {countdown === 0 ? 'Sending...' : `Next check: ${(countdown / 1000).toFixed(1)}s`}
                    </div>
                  )}

                  {/* Overlay for Perform Sign button (User turn only) */}
                  {isWaitingForUser && !isChecking && !isAnalyzing && !showSuccessModal && !showFeedbackModal && (
                    <div className="simulation-start-overlay">
                      <button
                        onClick={handleStart}
                        className="simulation-start-button"
                        disabled={!isWebcamReady}
                      >
                        Perform Sign
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dialogue */}
              <div className="simulation-dialogue">
                {currentDialogue.speaker === 'AI' ? (
                  <div className="dialogue-ai">
                    <div className="speech-bubble ai-bubble">
                      <p><strong>AI:</strong> {currentDialogue.text}</p>
                    </div>
                    <button onClick={moveToNextDialogue} className="button-primary">
                      Next
                    </button>
                  </div>
                ) : (
                  <div className="dialogue-user">
                    <div className="speech-bubble user-bubble">
                      <p><strong>Your turn:</strong> {currentDialogue.text}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="simulation-progress">
                Dialogue {currentDialogueIndex + 1} / {simulation.dialogue.length}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={handleSuccess}>
          <div className="success-modal">
            <div className="success-icon">🎉</div>
            <h2>Success!</h2>
            <p>You've successfully performed the sign language!</p>
            <button className="success-button" onClick={handleSuccess}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && currentFeedback && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="feedback-icon">💡</div>
            <h2>Feedback</h2>
            <p className="feedback-score">Score: {currentFeedback.score}/100</p>
            <p className="feedback-message">{currentFeedback.message}</p>
            <button className="retry-button" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
