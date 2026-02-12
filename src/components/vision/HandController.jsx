import React, { useRef, useEffect, useState } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useGameStore } from '../../store/gameStore';

const HandController = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // SAFETY FLAGS
  const isProcessingRef = useRef(false); // Prevents "Syncing Error" (AI Overload)
  const isMounted = useRef(false);       // Prevents "Zombie Loops" when switching menus

  // CONNECTING VISION TO GAME STATE
  const { 
    inputMode, 
    setHoverColumn, 
    playMove, 
    setIsAiming 
  } = useGameStore();
  
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // UI State
  const [uiState, setUiState] = useState('loading'); 

  // Mutable logic state
  const logicState = useRef({
    wasFist: false,        
    fistHoldFrames: 0,     
    openHoldFrames: 0,     
    lastCol: 3
  });

  // 0. Lifecycle Safety
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // 1. Get List of Cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter(device => device.kind === 'videoinput');
        if (isMounted.current) {
            setDevices(videoInputs);
            if (videoInputs.length > 0) {
                setSelectedDeviceId(videoInputs[0].deviceId);
            }
        }
      } catch (err) {
        console.error("Error listing devices:", err);
      }
    };
    getDevices();
  }, []);

  // 2. Start Camera
  useEffect(() => {
    if (inputMode !== 'hand' || !selectedDeviceId) return;
    
    let currentStream = null;
    setIsLoaded(false);
    setCameraError(null);

    const startCamera = async () => {
      try {
        // Stop previous stream
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }

        const constraints = {
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted.current) {
            // Component unmounted while camera was asking for permission
            stream.getTracks().forEach(track => track.stop());
            return;
        }

        currentStream = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // IMPORTANT: Wait for 'onloadeddata' before allowing MediaPipe to start
          videoRef.current.onloadeddata = () => {
             if (isMounted.current && videoRef.current) {
                 videoRef.current.play().catch(e => console.log("Play interrupted"));
                 setIsLoaded(true); // <--- Triggers the MediaPipe effect
             }
          };
        }
      } catch (err) {
        if (isMounted.current) setCameraError("Camera blocked or missing.");
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [inputMode, selectedDeviceId]);

  // 3. MediaPipe Logic
  useEffect(() => {
    if (inputMode !== 'hand' || !isLoaded) return;

    const hands = new Hands({
      locateFile: (file) => `/mediapipe/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1, 
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    let animationId;
    
    const processVideo = async () => {
      if (!isMounted.current) return;

      // STRICT SAFETY CHECKS
      const video = videoRef.current;
      if (
          video && 
          video.readyState >= 2 && // 2 = HAVE_CURRENT_DATA
          !video.paused && 
          !video.ended &&
          video.videoWidth > 0 &&  // Ensure dimensions exist
          !isProcessingRef.current // Don't overlap frames
      ) {
        try {
            isProcessingRef.current = true;
            await hands.send({ image: video });
        } catch (error) {
            // SILENCE EXPECTED STARTUP ERRORS
            // MediaPipe often throws "not readable" on the very first frame even if readyState is good.
            // We ignore it to keep the console clean.
            if (error && error.message && !error.message.includes("not readable")) {
                 console.warn("Vision Frame Dropped:", error);
            }
        } finally {
            isProcessingRef.current = false;
        }
      }

      // Loop again
      if (isMounted.current) {
         animationId = requestAnimationFrame(processVideo);
      }
    };
    
    // Start loop
    processVideo();

    return () => {
      cancelAnimationFrame(animationId);
      hands.close();
      isProcessingRef.current = false;
    };
  }, [inputMode, isLoaded]);

  // --- Strict Hand State Logic ---
  const checkHandState = (landmarks) => {
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20]; 
    let extendedFingers = 0;

    tips.forEach(tipIndex => {
      const tip = landmarks[tipIndex];
      const distToWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      if (distToWrist > 0.25) extendedFingers++;
    });
    return extendedFingers >= 3 ? 'open' : 'fist';
  };

  const onResults = (results) => {
    // Safety check inside callback
    if (!isMounted.current || !canvasRef.current || !results.image || !videoRef.current) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    if (videoWidth === 0 || videoHeight === 0) return;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    
    ctx.translate(videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const state = checkHandState(landmarks);
      const currentGameState = useGameStore.getState().gameStatus;

      if (currentGameState === 'playing') {
          if (state === 'fist') {
              logicState.current.fistHoldFrames++;
              logicState.current.openHoldFrames = 0;
              if (logicState.current.fistHoldFrames > 3) {
                  logicState.current.wasFist = true; 
                  setUiState('aiming');
                  setIsAiming(true); 

                  const wrist = landmarks[0];
                  const indexMcp = landmarks[5]; 
                  const centerX = (wrist.x + indexMcp.x) / 2;
                  const x = 1 - centerX; 
                  const col = Math.floor(((Math.max(0.2, Math.min(x, 0.8)) - 0.2) / 0.6) * 7);
                  const safeCol = Math.max(0, Math.min(6, col));
                  
                  logicState.current.lastCol = safeCol;
                  setHoverColumn(safeCol);
              }
          } 
          else if (state === 'open') {
              logicState.current.fistHoldFrames = 0;
              logicState.current.openHoldFrames++;
              setIsAiming(false); 

              if (logicState.current.wasFist) {
                  if (logicState.current.openHoldFrames > 5) {
                      setUiState('dropping');
                      playMove(logicState.current.lastCol); 
                      logicState.current.wasFist = false; 
                  }
              } else {
                  setUiState('reloading');
              }
          }
      }

      const color = uiState === 'aiming' ? '#FFD700' : (uiState === 'dropping' ? '#00FFFF' : '#aaaaaa');
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: color, lineWidth: 5 });
      drawLandmarks(ctx, landmarks, { color: '#ffffff', lineWidth: 2, radius: 4 });
      ctx.shadowBlur = 0;

    } else {
        setIsAiming(false);
        logicState.current.fistHoldFrames = 0;
    }
    
    ctx.restore();
  };

  if (inputMode !== 'hand') return null;

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-serif">
      <label htmlFor="camera-select" className="sr-only">Choose Camera</label>
      <select 
         id="camera-select"
         className="bg-[#050a15]/90 text-[#aaccff] text-[10px] p-1 rounded border border-[#4a5a7a] outline-none max-w-[150px] uppercase tracking-wider cursor-pointer"
         onChange={(e) => setSelectedDeviceId(e.target.value)}
         value={selectedDeviceId}
       >
         {devices.map((device, index) => (
           <option key={device.deviceId} value={device.deviceId}>
             {device.label || `Scrying Glass ${index + 1}`}
           </option>
         ))}
       </select>

      {/* THE MIRROR FRAME */}
      <div className={`
          relative w-52 h-40 overflow-hidden rounded-lg transition-all duration-300
          border-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-black
          ${uiState === 'aiming' ? 'border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.6)]' : 
            uiState === 'dropping' ? 'border-[#00ffff] shadow-[0_0_35px_rgba(0,255,255,0.8)] scale-105' : 
            'border-[#4a5a7a] opacity-90'}
      `}>
        
        {cameraError ? (
           <div className="flex items-center justify-center h-full p-4 text-red-500 text-xs text-center">
             {cameraError}
           </div>
        ) : (
          <>
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
            
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-[#aaccff] text-xs animate-pulse tracking-widest bg-black/80 z-10">
                    WARMING UP VISION...
                </div>
            )}
            
            {isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`
                        px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md border shadow-lg transition-all duration-200
                        ${uiState === 'aiming' ? 'bg-[#ffd700]/20 border-[#ffd700] text-[#ffd700]' : 
                          uiState === 'dropping' ? 'bg-[#00ffff]/20 border-[#00ffff] text-[#00ffff] scale-125' : 
                          'bg-black/40 border-white/20 text-gray-400'}
                    `}>
                        {uiState === 'aiming' && "⚡ CHARGING"}
                        {uiState === 'dropping' && "✨ CAST!"}
                        {uiState === 'reloading' && "✊ FIST TO AIM"}
                        {uiState === 'loading' && "..."}
                    </span>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HandController;