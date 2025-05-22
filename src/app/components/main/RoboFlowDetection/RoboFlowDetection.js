"use client";

import { useEffect, useRef, useState } from "react";
import { InferenceEngine, CVImage } from "inferencejs";
import style from "@/app/components/main/RoboFlowDetection/RoboFlowDetection.module.css";
import { FaCircleInfo } from "react-icons/fa6";
import Link from "next/link";
import { setupTF } from "@/app/lib/tf-setup";

export default function RoboFlowDetection() {
  const [inferEngine, setInferEngine] = useState(null);
  const [modelWorkerId, setModelWorkerId] = useState(null);
  const [itemDetected, setItemDetected] = useState([]);

  const videoRef = useRef(null);

  useEffect(() => {
    const initModel = async () => {
      await setupTF();
      const engine = new InferenceEngine();
      setInferEngine(engine);
      const id = await engine.startWorker(
        "572_fruits_vegetables",
        1,
        "rf_uRmPhtHeOrZMI6nIt435KZF2LNU2"
      );
      setModelWorkerId(id);
    };

    if (!inferEngine) {
      initModel();
    }
  }, [inferEngine]);

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
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => videoRef.current.play();
      videoRef.current.onplay = () => detectFrame();
    });
  };

  const detectFrame = async () => {
    if (!modelWorkerId || !inferEngine) {
      return setTimeout(detectFrame, 1000);
    }
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      return setTimeout(detectFrame, 500);
    }

    try {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, width, height);
      const imageBitmap = await createImageBitmap(canvas);
      const img = new CVImage(imageBitmap);

      const predictions = await inferEngine.infer(modelWorkerId, img);

      const highConfidenceItems = predictions
        .filter((p) => p.confidence >= 0.75)
        .map((p) => p.class);

      setItemDetected((prev) => {
        const newItems = [...prev];
        highConfidenceItems.forEach((item) => {
          if (!newItems.includes(item)) newItems.push(item);
        });
        return newItems;
      });

      setTimeout(detectFrame, 100 / 3);
    } catch (error) {
      console.error("Error en inferencia:", error);
      setTimeout(detectFrame, 1000);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        <video ref={videoRef} className={style.videoElement} muted playsInline />
      </div>
      <div className={`absolute bottom-0 ${style.objectDetected}`}>
        <ul className="gap-2">
          <p className="font-bold mb-2">🍎 Food detector</p>
          <div className="flex gap-2 flex-wrap">
            {itemDetected.map((item, index) => (
              <Link href={`/ItemSelected/${item}`} key={index} className="button flex gap-3 items-center p-4 w-fit">
                <FaCircleInfo />
                <p>{item}</p>
              </Link>
            ))}
          </div>
        </ul>
      </div>
    </div>
  );
}
