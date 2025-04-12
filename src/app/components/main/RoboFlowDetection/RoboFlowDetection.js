"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { InferenceEngine, CVImage } from "inferencejs";

import style from '@/app/components/main/RoboFlowDetection/RoboFlowDetection.module.css'; // Opcional si tenés estilos externos

function RoboFLowDetection() {
  const inferEngine = useMemo(() => new InferenceEngine(), []);
  const [modelWorkerId, setModelWorkerId] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);
  const [isRearCamera, setIsRearCamera] = useState(true);

  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (!modelLoading) {
      setModelLoading(true);
      inferEngine
        .startWorker(
          "572_fruits_vegetables",
          1,
          "rf_uRmPhtHeOrZMI6nIt435KZF2LNU2"
        )
        .then((id) => setModelWorkerId(id));
    }
  }, [inferEngine, modelLoading]);

  useEffect(() => {
    if (modelWorkerId) {
      startWebcam();
    }
  }, [modelWorkerId, isRearCamera]);

  const startWebcam = () => {
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: isRearCamera ? { exact: "environment" } : "user",
      },
      audio: false,
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();

          videoRef.current.onplay = () => {
            const ctx = canvasRef.current.getContext("2d");
            const height = videoRef.current.videoHeight;
            const width = videoRef.current.videoWidth;

            videoRef.current.width = width;
            videoRef.current.height = height;
            canvasRef.current.width = width;
            canvasRef.current.height = height;

            ctx.scale(1, 1);

            detectFrame();
          };
        }
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara", err);
      });
  };

  const detectFrame = () => {
    if (!modelWorkerId) return setTimeout(detectFrame, 100 / 3);

    const img = new CVImage(videoRef.current);
    inferEngine.infer(modelWorkerId, img).then((predictions) => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const items = predictions.map((prediction) => {
        const { x, y, width, height } = prediction.bbox;
        const boxX = x - width / 2;
        const boxY = y - height / 2;

        ctx.strokeStyle = prediction.color;
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, width, height);

        const label = `${prediction.class} ${Math.round(
          prediction.confidence * 100
        )}%`;
        const text = ctx.measureText(label);
        ctx.fillStyle = prediction.color;
        ctx.fillRect(boxX - 2, boxY - 30, text.width + 4, 30);

        ctx.font = "15px monospace";
        ctx.fillStyle = "black";
        ctx.fillText(label, boxX, boxY - 10);

        return {
          label: prediction.class,
          confidence: Math.round(prediction.confidence * 100),
        };
      });

      setDetectedItems(items);
      setTimeout(detectFrame, 100 / 3);
    });
  };

  const toggleCamera = () => {
    setIsRearCamera((prev) => !prev);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100svh",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "80vw",
          height: "90svh",
          overflow: "hidden",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      <button
        onClick={toggleCamera}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "none",
          background: "#111",
          color: "white",
          cursor: "pointer",
        }}
      >
        Cambiar cámara
      </button>

      <div style={{ marginTop: "1rem" }}>
        <h3>Objetos detectados:</h3>
        <ul>
          {detectedItems.map((item, index) => (
            <li key={index}>
              {item.label}: {item.confidence}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RoboFLowDetection;
