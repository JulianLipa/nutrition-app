"use client";
import { useEffect, useState } from "react";

import { MdOutlineCameraRear } from "react-icons/md"; // Nuevo icono para el error de cámara

import Link from "next/link";

const CameraDetection = () => {
  const [cameraError, setCameraError] = useState(false);
  return <div>
    {cameraError ? (
          <section>
            <div className="flex p-5 rounded-xl bg-white">
              <MdOutlineCameraRear className={style.cameraErrorIcon} />
              <p className={style.cameraErrorMessage}>error</p>

              <Link
                onClick={startWebcam}
                href={""}
                className="button flex gap-3 items-center p-4 w-fit relative overflow-hidden rounded-xl"
              >
                Retry
              </Link>
            </div>
          </section>
        ) : (
          <video
            ref={videoRef}
            className={style.videoElement}
            muted
            playsInline
          />
        )}
  </div>;
};

export default CameraDetection;
