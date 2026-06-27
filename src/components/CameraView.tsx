import React, { useRef, useState, useCallback } from "react";
import { Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  isLoading?: boolean;
  validationStatus?: "idle" | "success" | "error";
}

export function CameraView({ onCapture, isLoading, validationStatus = "idle" }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      setError("");
    } catch (err) {
      setError("Camera permission denied or camera not available.");
    }
  }, []);

  // Attach stream to video element when it becomes available
  React.useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(base64Image);
        stopCamera();
      }
    }
  };

  let borderClass = "border-primary/20";
  let shadowClass = "shadow-lg";
  
  if (validationStatus === "success") {
    borderClass = "border-green-500 border-4";
    shadowClass = "shadow-[0_0_20px_rgba(34,197,94,0.6)]";
  } else if (validationStatus === "error") {
    borderClass = "border-red-500 border-4";
    shadowClass = "shadow-[0_0_20px_rgba(239,68,68,0.6)]";
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className={`relative w-full max-w-sm aspect-[3/4] bg-black rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300 ${borderClass} ${shadowClass}`}>
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-6 flex flex-col items-center gap-3">
            <Camera className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{error || "Camera is offline"}</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-3">
        {!stream ? (
          <Button onClick={startCamera} size="lg" className="rounded-full shadow-md">
            <Camera className="w-4 h-4 mr-2" /> Start Camera
          </Button>
        ) : (
          <Button 
            onClick={captureImage} 
            size="lg" 
            className="rounded-full shadow-md w-32"
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Capture Face"}
          </Button>
        )}
      </div>
    </div>
  );
}
