"use client";

import { InferenceEngine, CVImage } from "inferencejs";
import { useEffect, useRef, useState, useMemo } from "react";
import style from "@/app/components/main/RoboFlowDetection/RoboFlowDetection.module.css";
import { FaCircleInfo } from "react-icons/fa6";
import Link from "next/link";

export default function Test() {
  const inferEngine = useMemo(() => new InferenceEngine(), []);
  const [modelWorkerId, setModelWorkerId] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [itemDetected, setItemDetected] = useState([]);
  const [isMounted, setIsMounted] = useState(false); // Track mounting state

  const videoRef = useRef();
  const detecting = useRef(true);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      detecting.current = false;
      cleanupDetection().then(() => {
        setModelLoading(false);
        setItemDetected([]);
      });
    };
  }, []);

  useEffect(() => {
    if (isMounted && !modelLoading && !modelWorkerId) {
      setModelLoading(true);
      inferEngine
        .startWorker(
          "572_fruits_vegetables",
          1,
          "rf_EsVTlbAbaZPLmAFuQwWoJgFpMU82"
        )
        .then((id) => {
          setModelWorkerId(id);
        })
        .catch((error) => {
          console.error("Error starting worker:", error);
          setModelLoading(false);
        });
    }
  }, [inferEngine, modelLoading, modelWorkerId, isMounted]);

  useEffect(() => {
    if (modelWorkerId && isMounted) {
      startWebcam();
    }
  }, [modelWorkerId, isMounted]);

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
      if (videoRef.current && isMounted) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        videoRef.current.onplay = () => {
          detecting.current = true;
          detectFrame();
        };
      } else if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }).catch((error) => {
      console.error("Error accessing webcam:", error);
    });
  };

  const detectFrame = () => {
    if (!modelWorkerId || !detecting.current || !isMounted) {
      return;
    }

    const img = new CVImage(videoRef.current);
    inferEngine.infer(modelWorkerId, img)
      .then((predictions) => {
        const highConfidenceItems = predictions
          .filter((p) => p.confidence >= 0.75)
          .map((p) => p.class);

        setItemDetected((prev) => {
          const updatedItems = [...prev];
          highConfidenceItems.forEach((item) => {
            if (!updatedItems.includes(item)) updatedItems.push(item);
          });
          return updatedItems.length === prev.length ? prev : updatedItems;
        });

        setTimeout(detectFrame, 1000 / 3);
      })
      .catch((error) => {
        console.error("Inference error:", error);
      });
  };

  const cleanupDetection = async () => {
    if (modelWorkerId) {
      await inferEngine.stopWorker(modelWorkerId);
      setModelWorkerId(null);
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
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
      </div>
      <div className={`absolute bottom-0 ${style.objectDetected}`}>
        <ul className="gap-2">
          <p className="font-bold mb-2">🍎 Food detector</p>
          {modelLoading && !modelWorkerId && (
            <p className="text-sm text-gray-500">Cargando modelo...</p>
          )}
          <div className="flex gap-2 flex-wrap">
            {itemDetected.map((item, index) => (
              <Link
                href={`/ItemSelected/${item}`}
                key={index}
                className="button flex gap-3 items-center p-4 w-fit"
              >
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