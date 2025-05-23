// languageSwitcher.js (client component)
"use client";

import { useRouter } from "next/navigation";
import US from "country-flag-icons/react/3x2/US";
import ES from "country-flag-icons/react/3x2/ES";

export function LanguageSwitcher() {
  const router = useRouter();

  const changeLanguage = async (locale) => {
    document.cookie = `locale=${locale}; path=/`; // set cookie
    router.refresh(); // refresh page to apply new messages
  };

  return (
    <div className="flex gap-5 justify-center items-center absolute top-0 w-full z-50 mt-5">
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
  );
}
