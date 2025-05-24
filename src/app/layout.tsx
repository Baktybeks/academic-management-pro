// app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ваше приложение",
  description: "Описание вашего приложения",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
