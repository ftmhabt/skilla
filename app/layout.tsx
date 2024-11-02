import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "./components/navbar";
import { GlobalProvider } from "@/context/context";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Skilla",
  description: "learn what you really need",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased  min-h-screen flex items-center justify-center font-zain">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          storageKey="planit-theme"
        >
          <GlobalProvider>
            <div className="flex flex-col w-screen min-h-screen">
              <Navbar />
              <main className="p-4 sm:mx-auto sm:w-[400px]">{children}</main>
              <Analytics />
              <footer className="bg-secondary mt-auto text-sm text-center p-1 text-white">
                by{" "}
                <a href="https://github.com/ftmhabt" className="text-primary">
                  ftmhabt
                </a>
              </footer>
            </div>
          </GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
