import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { DetectionProvider } from "@/context/DetectionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Food detector",
  description:
    "Detect the food you point with your camera and access to the nutritional information.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DetectionProvider>{children}</DetectionProvider>
      </body>
    </html>
  );
}
