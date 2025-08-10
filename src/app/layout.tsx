import { ThemeProvider } from '@/contexts/ThemeContext';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AppV AI Chatbot",
  description: "AI Chatbot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
