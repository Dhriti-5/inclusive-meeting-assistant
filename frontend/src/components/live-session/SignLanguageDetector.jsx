import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FileVision, Hand, Video, VideoOff, Activity, AlertCircle } from 'lucide-react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { recognizeGesture, GestureSmoother } from '../../utils/gestureRecognition';

const SignLanguageDetector = ({ onGestureDetected, isActive = true }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const gestureSmoother = useRef(new GestureSmoother(7, 0.65));

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [detectedText, setDetectedText] = useState('');
  const [fps, setFps] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const lastFrameTime = useRef(Date.now());
  const frameCount = useRef(0);

  // Initialize MediaPipe Hand Landmarker
  useEffect(() => {
    
    const initializeHandLandmarker = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 Loading MediaPipe Hand Landmarker...');

        // Load MediaPipe vision tasks
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        // Create Hand Landmarker
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          numHands: 2,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        handLandmarkerRef.current = handLandmarker;
        setIsLoading(false);
        console.log('✅ MediaPipe Hand Landmarker initialized successfully');
      } catch (err) {
        console.error('❌ Failed to initialize Hand Landmarker:', err);
        setError(`Failed to load MediaPipe: ${err.message}. Please check your internet connection.`);
        setIsLoading(false);
      }
    };

    initializeHandLandmarker();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (handLandmarkerRef.current) {
        try {
          handLandmarkerRef.current.close();
        } catch (e) {
          console.warn('Error closing hand landmarker:', e);
        }
      }
    };
  }, []);

  // Draw hand landmarks on canvas
  const drawLandmarks = useCallback((landmarks, canvasCtx, videoWidth, videoHeight) => {
    if (!landmarks || landmarks.length === 0) return;

    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
    
    landmarks.forEach((handLandmarks) => {
      // Draw connections
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],          // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8],          // Index
        [0, 9], [9, 10], [10, 11], [11, 12],     // Middle
        [0, 13], [13, 14], [14, 15], [15, 16],   // Ring
        [0, 17], [17, 18], [18, 19], [19, 20],   // Pinky
        [5, 9], [9, 13], [13, 17]                // Palm
      ];

      canvasCtx.strokeStyle = '#00FF00';
      canvasCtx.lineWidth = 2;

      connections.forEach(([start, end]) => {
        const startPoint = handLandmarks[start];
        const endPoint = handLandmarks[end];
        
        canvasCtx.beginPath();
        canvasCtx.moveTo(startPoint.x * videoWidth, startPoint.y * videoHeight);
        canvasCtx.lineTo(endPoint.x * videoWidth, endPoint.y * videoHeight);
        canvasCtx.stroke();
      });

      // Draw landmarks
      handLandmarks.forEach((landmark, index) => {
        const x = landmark.x * videoWidth;
        const y = landmark.y * videoHeight;
        
        canvasCtx.fillStyle = index === 0 ? '#FF0000' : '#00FF00';
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
        canvasCtx.fill();
      });
    });
  }, []);

  // Process video frame
  const processFrame = useCallback(async () => {
    if (
      !isActive ||
      !cameraEnabled ||
      !isWebcamReady ||
      !webcamRef.current?.video ||
      !handLandmarkerRef.current ||
      !canvasRef.current
    ) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      try {
        // Detect hand landmarks
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

        // Calculate FPS
        frameCount.current++;
        const now = Date.now();
        if (now - lastFrameTime.current >= 1000) {
          setFps(frameCount.current);
          frameCount.current = 0;
          lastFrameTime.current = now;
        }

        // Clear previous drawings
        canvasCtx.clearRect(0, 0, videoWidth, videoHeight);

        if (results.landmarks && results.landmarks.length > 0) {
          // Draw landmarks
          drawLandmarks(results.landmarks, canvasCtx, videoWidth, videoHeight);

          // Recognize gesture from first detected hand
          const firstHandLandmarks = results.landmarks[0];
          const prediction = recognizeGesture(firstHandLandmarks);
          
          // Add to smoother
          gestureSmoother.current.addPrediction(prediction);
          const stableGesture = gestureSmoother.current.getStableGesture();

          if (stableGesture.gesture !== 'none' && stableGesture.gesture !== 'unknown') {
            setCurrentGesture(stableGesture);
            
            // Add to detected text if gesture is stable enough
            if (stableGesture.stability > 0.8 && stableGesture.confidence > 0.75) {
              setDetectedText(prev => {
                const lastChar = prev.slice(-1);
                // Don't add same character consecutively
                if (lastChar !== stableGesture.gesture) {
                  const newText = prev + stableGesture.gesture;
                  if (onGestureDetected) {
                    onGestureDetected(stableGesture.gesture, newText);
                  }
                  return newText;
                }
                return prev;
              });
            }
          } else {
            setCurrentGesture(prediction);
          }
        } else {
          setCurrentGesture(null);
        }
      } catch (err) {
        console.error('Error processing frame:', err);
      }
    }

    animationRef.current = requestAnimationFrame(processFrame);
  }, [isActive, cameraEnabled, isWebcamReady, drawLandmarks, onGestureDetected]);

  // Start processing when webcam is ready
  useEffect(() => {
    if (isWebcamReady && !isLoading && handLandmarkerRef.current && isActive) {
      processFrame();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isWebcamReady, isLoading, isActive, processFrame]);

  const handleWebcamReady = useCallback(() => {
    console.log('📹 Webcam ready');
    setIsWebcamReady(true);
  }, []);

  const handleWebcamError = useCallback((err) => {
    console.error('Webcam error:', err);
    setError('Failed to access webcam. Please check permissions.');
  }, []);

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
    if (cameraEnabled) {
      setCurrentGesture(null);
      gestureSmoother.current.reset();
    }
  };

  const clearText = () => {
    setDetectedText('');
    gestureSmoother.current.reset();
  };

  const deleteLastChar = () => {
    setDetectedText(prev => prev.slice(0, -1));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border-2 border-red-200">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Sign Language Detector</h3>
        <p className="text-red-600 text-center mb-4">{error}</p>
        <div className="text-sm text-red-500 bg-red-100 p-3 rounded">
          <p className="font-semibold mb-2">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Ensure npm packages are installed</li>
            <li>Check browser console (F12) for details</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Camera View */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="text-center">
              <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-white">Loading MediaPipe Hand Detector...</p>
            </div>
          </div>
        )}

        {cameraEnabled ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: 'user'
              }}
              onUserMedia={handleWebcamReady}
              onUserMediaError={handleWebcamError}
              className="w-full h-auto"
              mirrored
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: 'scaleX(-1)' }}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-96 bg-gray-800">
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">Camera Disabled</p>
            </div>
          </div>
        )}

        {/* FPS Counter */}
        {cameraEnabled && !isLoading && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 px-3 py-1 rounded text-white text-sm">
            {fps} FPS
          </div>
        )}

        {/* Current Gesture Display */}
        {currentGesture && cameraEnabled && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 px-6 py-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Hand className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-3xl font-bold text-white">
                  {currentGesture.gesture}
                </div>
                <div className="text-sm text-gray-300">
                  {currentGesture.description || 'Detected'}
                </div>
                <div className="text-xs text-gray-400">
                  Confidence: {(currentGesture.confidence * 100).toFixed(0)}%
                  {currentGesture.stability && ` | Stability: ${(currentGesture.stability * 100).toFixed(0)}%`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={toggleCamera}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            cameraEnabled
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {cameraEnabled ? (
            <>
              <VideoOff className="w-5 h-5" />
              Disable Camera
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              Enable Camera
            </>
          )}
        </button>

        <button
          onClick={clearText}
          disabled={!detectedText}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear Text
        </button>

        <button
          onClick={deleteLastChar}
          disabled={!detectedText}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Delete
        </button>
      </div>

      {/* Detected Text Display */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <FileVision className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Detected Sign Language</h3>
        </div>
        <div className="min-h-[100px] p-4 bg-gray-50 rounded border border-gray-300">
          {detectedText ? (
            <p className="text-2xl font-mono text-gray-800 break-all leading-relaxed">
              {detectedText}
            </p>
          ) : (
            <p className="text-gray-400 italic">
              Sign language gestures will appear here...
            </p>
          )}
        </div>
        {detectedText && (
          <div className="mt-3 text-sm text-gray-600">
            Detected {detectedText.length} character{detectedText.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">📋 How to Use:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Show your hand clearly to the camera</li>
          <li>• Hold each gesture steady for 1-2 seconds</li>
          <li>• Supported: A-Z letters and numbers 1-5</li>
          <li>• Works best with good lighting and plain background</li>
        </ul>
      </div>
    </div>
  );
};

export default SignLanguageDetector;
