"use client";

import { useRouter } from "next/navigation";
import US from "country-flag-icons/react/3x2/US";
import ES from "country-flag-icons/react/3x2/ES";

import { useTranslations } from "next-intl";

import style from "@/app/components/main/RoboFlowDetection/RoboFlowDetection.module.css";

export function LanguageSwitcher() {
  const router = useRouter();

  const t = useTranslations("HomePage");

  const changeLanguage = async (locale) => {
    document.cookie = `locale=${locale}; path=/`;
    router.refresh();
  };

  return (
    <div className="flex justify-center">
      <div
        className={`flex gap-5 justify-center items-center absolute top-0 w-full z-1000 ${style.languageDiv}`}
      >
        <US
          title="United States"
          onClick={() => changeLanguage("en")}
          className="w-10 cursor-pointer"
        />
        <ES
          title="United States"
          onClick={() => changeLanguage("es")}
          className="w-10 cursor-pointer"
        />
      </div>
    </div>
  );
}
