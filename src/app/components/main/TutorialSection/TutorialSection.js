"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { useTranslations } from "next-intl";

import { DetectionProvider } from "@/context/DetectionContext";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const TutorialSection = () => {
  const t = useTranslations("HomePage");

  const [currentSection, setCurrentSection] = useState(0);

  const handleNextSection = () => {
    setCurrentSection((prevSection) => prevSection + 1);
  };

  const handlePreviousSection = () => {
    setCurrentSection((prevSection) =>
      prevSection === 0 ? 2 : prevSection - 1
    );
  };

  return (
    <section
      className={`tutorialSection relative ${
        currentSection === 3 ? "hidden" : "flex"
      }`}
    >
      <div
        className={`
          tutorialSectionDiv 
          transition-opacity duration-500 ease-in-out
          absolute
          ${
            currentSection === 0
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none hidden"
          }
        `}
      >
        <h1 className="font-bold">{t("languageTitle")}</h1>
        <p>{t("language3")}</p>
        <div className="flex w-full justify-center mt-7">
          <Image src={"/camera.png"} alt="Image" width={40} height={40} />
        </div>

        <div className="flex items-center w-full justify-center mt-5">
          <IoIosArrowBack
            className="text-3xl line-tutorial-grey"
          />

          <div className="flex gap-2 text-xl">
            <p>-</p>
            <p className="line-tutorial-grey">-</p>
            <p className="line-tutorial-grey">-</p>
          </div>

          <IoIosArrowForward
            className="text-3xl cursor-pointer"
            onClick={handleNextSection}
          />
        </div>
      </div>

      <div
        className={`
          tutorialSectionDiv 
          transition-opacity duration-500 ease-in-out
          absolute mt-20
          ${
            currentSection === 1
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      >
        <h1 className="font-bold">{t("languageTitle")}</h1>

        <p>{t("language")}</p>
        <Image src={"/lang-2.png"} alt="Image" width={250} height={250} />

        <p>{t("language2")}</p>
        <Image src={t("language3-img")} alt="Image" width={250} height={250} />

        <div className="flex items-center w-full justify-center">
          <IoIosArrowBack
            className="text-3xl cursor-pointer"
            onClick={handlePreviousSection}
          />

          <div className="flex gap-2 text-xl">
            <p className="line-tutorial-grey">-</p>
            <p>-</p>
            <p className="line-tutorial-grey">-</p>
          </div>

          <IoIosArrowForward
            className="text-3xl cursor-pointer"
            onClick={handleNextSection}
          />
        </div>
      </div>

      <div
        className={`
          tutorialSectionDiv 
          transition-opacity duration-500 ease-in-out
          absolute mt-20
          ${
            currentSection === 2
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      >
        <h1 className="font-bold">{t("languageTitle")}</h1>

        <p>{t("nutritional")}</p>
        <Image src={"/banana.jpg"} alt="Image" width={250} height={250} />

        <div className="flex items-center w-full justify-center">
          <IoIosArrowBack
            className="text-3xl cursor-pointer"
            onClick={handlePreviousSection}
          />
          <div className="flex gap-2 text-xl">
            <p className="line-tutorial-grey">-</p>
            <p className="line-tutorial-grey">-</p>
            <p>-</p>
          </div>
          <IoIosArrowForward
            className="text-3xl cursor-pointer"
            onClick={handleNextSection}
          />
        </div>
      </div>
    </section>
  );
};

export default TutorialSection;
