"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { InferenceEngine, CVImage } from "inferencejs";

function RoboFLowDetection() {
  const inferEngine = useMemo(() => new InferenceEngine(), []);
  const [modelWorkerId, setModelWorkerId] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);

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
  }, [modelWorkerId]);

  const startWebcam = () => {
    const constraints = {
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "environment",
      },
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
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
    });
  };

  const detectFrame = () => {
    if (!modelWorkerId) return setTimeout(detectFrame, 100 / 3);

    const img = new CVImage(videoRef.current);
    inferEngine.infer(modelWorkerId, img).then((predictions) => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      predictions.forEach((prediction) => {
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
      });

      setTimeout(detectFrame, 100 / 3);
    });
  };

  return (
    <div>
      <div style={{ position: "relative" }}>
        <video ref={videoRef} style={{ position: "relative" }} />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>
    </div>
  );
}

export default RoboFLowDetection;
