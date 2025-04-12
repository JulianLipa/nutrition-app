"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { InferenceEngine, CVImage } from "inferencejs";
import style from "@/app/components/main/RoboFlowDetection/RoboFlowDetection.module.css";

function RoboFLowDetection() {
  const inferEngine = useMemo(() => new InferenceEngine(), []);
  const [modelWorkerId, setModelWorkerId] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);

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
      const video = videoRef.current;
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
      };

      video.onplay = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const updateSize = () => {
          const width = video.videoWidth;
          const height = video.videoHeight;

          video.width = width;
          video.height = height;
          canvas.width = width;
          canvas.height = height;

          ctx.scale(1, 1);
        };

        updateSize();
        detectFrame();
      };
    });
  };

  const detectFrame = () => {
    if (!modelWorkerId) return setTimeout(detectFrame, 100 / 3);

    const img = new CVImage(videoRef.current);
    inferEngine.infer(modelWorkerId, img).then((predictions) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

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

  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        <video
          ref={videoRef}
          className={style.videoElement}
          muted
          playsInline
        />
        <canvas ref={canvasRef} className={style.canvasOverlay} />
        <div
          style={{
          }}
        >
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
    </div>
  );
}

export default RoboFLowDetection;
