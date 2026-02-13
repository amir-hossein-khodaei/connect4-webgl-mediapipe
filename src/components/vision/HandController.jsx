import React, { useRef, useEffect, useState } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useGameStore } from '../../store/gameStore';

const HandController = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // Keep track of stream without re-renders
  const handsRef = useRef(null);
  
  const baseUrl = import.meta.env.BASE_URL;
  const isMounted = useRef(false);       
  const isProcessing = useRef(false);

  const { inputMode, setHoverColumn, playMove, setIsAiming } = useGameStore();
  
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(''); // Current ID
  const [cameraError, setCameraError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Game Logic State
  const logicState = useRef({
    wasFist: false, fistHoldFrames: 0, openHoldFrames: 0, lastCol: 3
  });

  // 1. LIFECYCLE
  useEffect(() => {
    isMounted.current = true;
    return () => { 
        stopEverything();
        isMounted.current = false; 
    };
  }, []);

  // 2. STOP HELPER
  const stopEverything = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
    }
    setIsLoaded(false);
  };

  // 3. START CAMERA FUNCTION (Called Manually)
  const startCamera = async (preferredDeviceId = null) => {
    if (!isMounted.current) return;
    
    // Stop any existing stream first
    stopEverything();
    setCameraError(null);

    try {
        // A. CONSTRAINTS: Try simple first to avoid errors
        let constraints = { video: true };
        
        // If user picked a specific camera, try to use it
        if (preferredDeviceId) {
            constraints = { video: { deviceId: { exact: preferredDeviceId }, width: 640, height: 480 } };
        }

        console.log("📷 Starting Camera...", constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!isMounted.current) {
            stream.getTracks().forEach(t => t.stop());
            return;
        }

        streamRef.current = stream;

        // B. ATTACH TO VIDEO
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Wait for video to be ready
            await new Promise(resolve => {
                videoRef.current.onloadeddata = () => {
                    videoRef.current.play().catch(e => console.warn(e));
                    resolve();
                };
            });
        }

        // C. REFRESH DEVICE LIST (Now that we have permissions)
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoInputs);
        
        // Update selection state without triggering loops
        if (preferredDeviceId) {
            setSelectedDeviceId(preferredDeviceId);
        } else if (videoInputs.length > 0) {
            // Auto-detect which one we got
            const track = stream.getVideoTracks()[0];
            const settings = track.getSettings();
            if (settings.deviceId) setSelectedDeviceId(settings.deviceId);
        }

        // D. START AI
        startMediaPipe(stream);

    } catch (err) {
        console.error("❌ Camera Failed:", err);
        if (preferredDeviceId) {
            console.warn("⚠️ Specific camera failed, trying default...");
            startCamera(null); // Fallback to default
        } else {
            setCameraError("Camera Blocked. Close other apps & reload.");
        }
    }
  };

  // 4. START AI HELPER
  const startMediaPipe = (stream) => {
      const hands = new Hands({
        locateFile: (file) => `${baseUrl}mediapipe/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, 
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onResults);
      handsRef.current = hands;
      setIsLoaded(true);
      
      // Start Loop
      requestAnimationFrame(processFrame);
  };

  const processFrame = async () => {
    if (!isMounted.current || !handsRef.current || !videoRef.current) return;
    
    // Throttle: Only process if ready
    if (videoRef.current.readyState >= 2 && !isProcessing.current) {
        isProcessing.current = true;
        try {
            await handsRef.current.send({ image: videoRef.current });
        } catch(e) { /* ignore */ }
        isProcessing.current = false;
    }
    requestAnimationFrame(processFrame);
  };

  // 5. TRIGGER ON MOUNT (Only once!)
  useEffect(() => {
    if (inputMode === 'hand') {
        startCamera(null); // Start default camera
    } else {
        stopEverything();
    }
  }, [inputMode]); 

  // --- LOGIC (Unchanged) ---
  const checkHandState = (landmarks) => {
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20]; 
    let extendedFingers = 0;
    tips.forEach(tipIndex => {
        if (Math.hypot(landmarks[tipIndex].x - wrist.x, landmarks[tipIndex].y - wrist.y) > 0.25) extendedFingers++;
    });
    return extendedFingers >= 3 ? 'open' : 'fist';
  };

  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.translate(videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

    if (results.multiHandLandmarks?.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const state = checkHandState(landmarks);
      const currentGameState = useGameStore.getState().gameStatus;

      if (currentGameState === 'playing') {
         // Logic mapped to game
         if (state === 'fist') {
             logicState.current.fistHoldFrames++;
             logicState.current.openHoldFrames = 0;
             if (logicState.current.fistHoldFrames > 3) {
                 logicState.current.wasFist = true; 
                 setIsAiming(true); 
                 const x = 1 - (landmarks[0].x + landmarks[5].x) / 2;
                 const col = Math.floor(((Math.max(0.2, Math.min(x, 0.8)) - 0.2) / 0.6) * 7);
                 const safeCol = Math.max(0, Math.min(6, col));
                 logicState.current.lastCol = safeCol;
                 setHoverColumn(safeCol);
             }
         } else {
             logicState.current.fistHoldFrames = 0;
             logicState.current.openHoldFrames++;
             setIsAiming(false);
             if (logicState.current.wasFist && logicState.current.openHoldFrames > 5) {
                 playMove(logicState.current.lastCol); 
                 logicState.current.wasFist = false; 
             }
         }
      }
      const color = logicState.current.wasFist ? '#FFD700' : '#aaaaaa';
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: color, lineWidth: 5 });
      drawLandmarks(ctx, landmarks, { color: '#ffffff', lineWidth: 2, radius: 4 });
    }
    ctx.restore();
  };

  if (inputMode !== 'hand') return null;

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-serif">
      <select 
         className="bg-[#050a15]/90 text-[#aaccff] text-[10px] p-1 rounded border border-[#4a5a7a] outline-none max-w-[150px] uppercase tracking-wider cursor-pointer"
         onChange={(e) => startCamera(e.target.value)} // Manual switch only
         value={selectedDeviceId}
       >
         {devices.length === 0 && <option>Detecting...</option>}
         {devices.map((device, index) => (
           <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>
         ))}
       </select>

      <div className={`relative w-52 h-40 overflow-hidden rounded-lg border-4 border-[#4a5a7a] bg-black`}>
        {cameraError ? (
           <div className="flex flex-col items-center justify-center h-full p-4 text-red-500 text-xs text-center font-bold bg-black/90">
             <span>{cameraError}</span>
             <button onClick={() => startCamera(null)} className="mt-2 bg-gray-800 px-2 py-1 rounded">Retry</button>
           </div>
        ) : (
          <>
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
            {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-[#aaccff] text-xs animate-pulse bg-black/80">STARTING VISION...</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default HandController;