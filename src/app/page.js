
import TutorialSection from "./components/main/TutorialSection/TutorialSection";
import RoboFlowDetection from "@/app/components/main/RoboFlowDetection/RoboFlowDetection"

import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");
  return (
    <div>
      <main>
        <TutorialSection />
        <RoboFlowDetection />
      </main>
    </div>
  );
}
