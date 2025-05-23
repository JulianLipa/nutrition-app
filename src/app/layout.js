import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageSwitcher } from "./components/main/LanguageSwitcher/LanguageSwitcher";

import { DetectionProvider } from "@/context/DetectionContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

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

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DetectionProvider>
            <LanguageSwitcher />
            {children}
          </DetectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
