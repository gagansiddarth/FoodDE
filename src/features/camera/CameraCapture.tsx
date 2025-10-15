import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

interface CameraCaptureProps {
  onUsePhoto: (blob: Blob) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onUsePhoto, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        setError("Unable to access camera. Please allow permissions or use Upload.");
      }
    };
    start();
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedDataUrl(dataUrl);
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
  };

  const handleUsePhoto = async () => {
    if (!capturedDataUrl) return;
    const res = await fetch(capturedDataUrl);
    const blob = await res.blob();
    onUsePhoto(blob);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Camera</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        {error && (
          <p className="text-sm text-destructive mb-3">{error}</p>
        )}
        {!capturedDataUrl ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
          </div>
        ) : (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <img src={capturedDataUrl} alt="Captured" className="w-full h-full object-contain" />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-4 flex gap-2 justify-end">
          {!capturedDataUrl ? (
            <Button onClick={handleCapture}>Capture</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleRetake}>Retake</Button>
              <Button variant="hero" onClick={handleUsePhoto}>Use Photo</Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CameraCapture;


