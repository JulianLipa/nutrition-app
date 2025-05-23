"use client";

import { InferenceEngine, CVImage } from "inferencejs";
import { useEffect, useRef, useState, useMemo } from "react";
import style from "@/app/components/main/RoboFlowDetection/RoboFlowDetection.module.css";

import { FaCircleInfo } from "react-icons/fa6";
import { CgClose } from "react-icons/cg";

import Link from "next/link";
import Image from "next/image";

import { useTranslations } from "next-intl";

export default function Test() {
  const inferEngine = useMemo(() => new InferenceEngine(), []);
  const [modelWorkerId, setModelWorkerId] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [itemDetected, setItemDetected] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  const [itemSelected, setItemSelected] = useState(null);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [loading, setLoading] = useState(false);

  const t = useTranslations("HomePage");

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

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
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
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
      });
  };

  const detectFrame = () => {
    if (!modelWorkerId || !detecting.current || !isMounted) {
      return;
    }

    const img = new CVImage(videoRef.current);
    inferEngine
      .infer(modelWorkerId, img)
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

  const handleItemSelected = (event, id) => {
    event.preventDefault();

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingItemId(id);
        const res = await fetch(`/api/getFruitDetails?fruit_name=${id}`);
        const response = await res.json();
        setItemSelected(response);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
        setLoadingItemId(null);
      }
    };

    fetchData();
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
        <p className="font-bold mb-2">🍎 {t("title")}</p>
        <ul className="gap-2">
          <div className="flex gap-2 flex-wrap">
            {!itemSelected &&
              itemDetected.map((item, index) => (
                <Link
                  href={"#"}
                  onClick={(e) => handleItemSelected(e, item)}
                  key={index}
                  className="button flex gap-3 items-center p-4 w-fit relative overflow-hidden rounded-xl" // <== importante
                >
                  {loadingItemId === item && (
                    <div
                      className={`absolute inset-0 flex justify-center items-center ${style.overlayBlack}`}
                    >
                      <Image
                        src={"/loading-2.gif"}
                        alt="Loading"
                        width={30}
                        height={30}
                        className="w-1/2"
                      />
                    </div>
                  )}

                  <FaCircleInfo />

                  <p>{t(`${item}`)}</p>
                </Link>
              ))}
          </div>
        </ul>
      </div>

      {itemSelected && (
        <div
          className={`w-full h-full flex justify-center items-center absolute ${style.overlayBlack}`}
        >
          <div className={`mt-5 z-50 w-1/4 ${style.objectNutritionData}`}>
            <CgClose
              className="float-right cursor-pointer"
              onClick={() => setItemSelected(null)}
            />

            <Image
              src={itemSelected?.image}
              alt="Image"
              width={250}
              height={250}
              className={""}
            />

            <div className="text-center mt-5">
              <h1 className="flex gap-1">
                <p className="font-bold">{t("calories")}:</p>
                <p className="flex">
                  {itemSelected.nutrition?.calories}
                  {itemSelected.nutrition?.unit}
                </p>
              </h1>
              <h1 className="flex gap-1">
                <p className="font-bold">{t("carbs")}:</p>
                <p className="flex">
                  {itemSelected.nutrition?.carbs}
                  {itemSelected.nutrition?.unit}
                </p>
              </h1>
              <h1 className="flex gap-1">
                <p className="font-bold">{t("fat")}:</p>
                {itemSelected.nutrition?.fat} {itemSelected.nutrition?.unit}
              </h1>
              <h1 className="flex gap-1">
                <p className="font-bold">{t("protein")}:</p>
                <p className="flex">
                  {itemSelected.nutrition?.protein}
                  {itemSelected.nutrition?.unit}
                </p>
              </h1>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
