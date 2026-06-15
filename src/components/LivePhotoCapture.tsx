"use client";

import { Camera, CameraOff, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface LivePhotoCaptureProps {
  onCapture: (file: File, preview: string) => void;
  onClear: () => void;
  preview: string | null;
}

type CameraStatus = "checking" | "ready" | "active" | "unavailable";

export function LivePhotoCapture({
  onCapture,
  onClear,
  preview,
}: LivePhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("checking");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkCamera() {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        if (!cancelled) {
          setStatus("unavailable");
          setError("Your browser does not support camera access.");
        }
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideo = devices.some((device) => device.kind === "videoinput");
        if (!cancelled) {
          setStatus(hasVideo ? "ready" : "unavailable");
          if (!hasVideo) {
            setError("No camera was found on this device.");
          }
        }
      } catch {
        if (!cancelled) {
          setStatus("ready");
        }
      }
    }

    checkCamera();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("active");
    } catch (err) {
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");

      setStatus("unavailable");
      setError(
        denied
          ? "Camera access was denied. Allow camera permission in your browser to claim territory."
          : "No camera is available on this device."
      );
    } finally {
      setIsStarting(false);
    }
  }, [stopStream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `claim-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        stopStream();
        setStatus("ready");
        onCapture(file, dataUrl);
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture, stopStream]);

  const handleRetake = useCallback(() => {
    onClear();
    void startCamera();
  }, [onClear, startCamera]);

  if (status === "checking") {
    return (
      <div className="w-full h-36 rounded-xl border border-gold/10 bg-surface flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
        <span className="text-sm text-muted">Checking for camera…</span>
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div className="w-full rounded-xl border border-red-500/30 bg-red-950/30 p-4 flex flex-col items-center justify-center gap-2 text-center">
        <CameraOff className="h-8 w-8 text-red-400" />
        <p className="text-sm font-medium text-red-200">Camera required</p>
        <p className="text-xs text-red-200/80 leading-relaxed">
          {error ??
            "A live camera photo is required to claim territory. Gallery uploads are not allowed."}
        </p>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-gold/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Live claim photo"
          className="w-full h-48 object-cover"
        />
        <button
          type="button"
          onClick={handleRetake}
          className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 text-xs backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retake
        </button>
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden border border-gold/20 bg-black aspect-[4/3]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        </div>
        <button
          type="button"
          onClick={capturePhoto}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-background font-semibold text-sm shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all"
        >
          <Camera className="h-5 w-5" />
          Capture live photo
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void startCamera()}
      disabled={isStarting}
      className="w-full h-36 rounded-xl border-2 border-dashed border-gold/30 flex flex-col items-center justify-center gap-2 hover:border-gold/60 hover:bg-gold/5 transition-all disabled:opacity-50"
    >
      {isStarting ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <span className="text-sm text-muted">Opening camera…</span>
        </>
      ) : (
        <>
          <Camera className="h-8 w-8 text-gold" />
          <span className="text-sm text-muted">Open camera for live photo</span>
          <span className="text-[10px] text-muted/70">
            Gallery uploads are not allowed
          </span>
        </>
      )}
    </button>
  );
}
