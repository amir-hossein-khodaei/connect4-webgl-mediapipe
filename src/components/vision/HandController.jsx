import React, { useRef, useEffect, useState } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useGameStore } from '../../store/gameStore';

const HandController = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const baseUrl = import.meta.env.BASE_URL;

  const isProcessingRef = useRef(false); 
  const isMounted = useRef(false);       

  const { inputMode, setHoverColumn, playMove, setIsAiming } = useGameStore();
  
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [uiState, setUiState] = useState('loading'); 

  const logicState = useRef({
    wasFist: false, fistHoldFrames: 0, openHoldFrames: 0, lastCol: 3
  });

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter(device => device.kind === 'videoinput');
      if (isMounted.current) {
        setDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }
    } catch (err) {
      console.warn("Device enumeration failed:", err);
    }
  };

  useEffect(() => {
    if (inputMode !== 'hand') return;
    
    let currentStream = null;
    let hands = null;
    let animationId = null;

    const startSystem = async () => {
      setIsLoaded(false);
      setCameraError(null);

      try {
        // --- ATTEMPT 1: Get Camera Stream ---
        let stream;
        try {
            // Soft constraints (no 'exact') to prevent OverconstrainedError
            const constraints = {
              video: selectedDeviceId 
                ? { deviceId: selectedDeviceId, width: { ideal: 640 }, height: { ideal: 480 } }
                : { width: { ideal: 640 }, height: { ideal: 480 } }
            };
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
            console.warn("High quality stream failed, trying fallback...", err);
            // Fallback: Simplest possible video request
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        
        currentStream = stream;
        await fetchDevices();

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current.onloadeddata = () => {
              videoRef.current.play().catch(e => console.log("Play interrupted"));
              resolve();
            };
          });
          if (isMounted.current) setIsLoaded(true);
        }

        // --- ATTEMPT 2: Start AI ---
        hands = new Hands({
          locateFile: (file) => `${baseUrl}mediapipe/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // Lower complexity for better performance/compatibility
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);

        const processVideo = async () => {
          if (!isMounted.current) return;
          const video = videoRef.current;
          if (video && video.readyState >= 2 && !isProcessingRef.current) {
            try {
                isProcessingRef.current = true;
                await hands.send({ image: video });
            } catch (error) {
                // Squelch runtime errors
            } finally {
                isProcessingRef.current = false;
            }
          }
          if (isMounted.current) animationId = requestAnimationFrame(processVideo);
        };
        processVideo();

      } catch (err) {
        console.error("Camera System Error:", err);
        let msg = "Camera failed.";
        if (err.name === 'NotReadableError') msg = "Camera is busy. Close other apps.";
        if (err.name === 'NotAllowedError') msg = "Permission denied.";
        if (err.name === 'NotFoundError') msg = "No camera found.";
        if (isMounted.current) setCameraError(msg);
      }
    };

    startSystem();

    return () => {
      if (currentStream) currentStream.getTracks().forEach(track => track.stop());
      if (hands) hands.close();
      if (animationId) cancelAnimationFrame(animationId);
      isProcessingRef.current = false;
    };
  }, [inputMode, selectedDeviceId]);

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
    if (!isMounted.current || !canvasRef.current || !results.image || !videoRef.current) return;
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    const ctx = canvasRef.current.getContext('2d');
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
          } else if (state === 'open') {
              logicState.current.fistHoldFrames = 0;
              logicState.current.openHoldFrames++;
              setIsAiming(false); 
              if (logicState.current.wasFist && logicState.current.openHoldFrames > 5) {
                  setUiState('dropping');
                  playMove(logicState.current.lastCol); 
                  logicState.current.wasFist = false; 
              } else if (!logicState.current.wasFist) {
                  setUiState('reloading');
              }
          }
      }
      const color = uiState === 'aiming' ? '#FFD700' : (uiState === 'dropping' ? '#00FFFF' : '#aaaaaa');
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
         onChange={(e) => setSelectedDeviceId(e.target.value)}
         value={selectedDeviceId}
       >
         {devices.length === 0 && <option>Camera Starting...</option>}
         {devices.map((device, index) => (
           <option key={device.deviceId} value={device.deviceId}>
             {device.label || `Camera ${index + 1}`}
           </option>
         ))}
       </select>

      <div className={`relative w-52 h-40 overflow-hidden rounded-lg transition-all duration-300 border-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-black ${uiState === 'aiming' ? 'border-[#ffd700]' : 'border-[#4a5a7a]'}`}>
        {cameraError ? (
           <div className="flex items-center justify-center h-full p-4 text-red-500 text-xs text-center font-bold bg-black/90">
             {cameraError}
           </div>
        ) : (
          <>
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
            {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-[#aaccff] text-xs animate-pulse bg-black/80">VISION STARTING...</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default HandController;